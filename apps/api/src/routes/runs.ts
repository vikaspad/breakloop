import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { runQueue } from "../jobs/queue";
import { registerStream, emit, closeStream } from "../websocket/traceEmitter";
import { config } from "../config";

const router = Router();

// SSE stream — must sit BEFORE router.use(authMiddleware) because the browser's
// native EventSource cannot send custom headers. Token is passed as ?token=<jwt>.
router.get("/:id/stream", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req.query["token"] as string | undefined)
      ?? req.headers.authorization?.slice(7);

    if (!token) {
      res.status(401).json({ data: null, error: "Unauthorized", meta: {} });
      return;
    }

    let userId: string;
    try {
      const payload = jwt.verify(token, config.jwt.secret) as { sub: string };
      userId = payload.sub;
    } catch {
      res.status(401).json({ data: null, error: "Invalid token", meta: {} });
      return;
    }

    const run = await prisma.run.findFirstOrThrow({
      where: { id: req.params["id"], agent: { userId } },
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // If the run already finished before the client connected, replay the
    // terminal event immediately so the UI doesn't hang waiting.
    if (run.status === "COMPLETE" || run.status === "FAILED") {
      const summary = run.summary as { pass?: number; warn?: number; fail?: number; cancelled?: boolean } | null;
      if (run.status === "COMPLETE") {
        emit(req.params["id"], "RUN_COMPLETE", {
          runId: run.id,
          overallScore: run.overallScore ?? 0,
          summary,
        });
      } else if (summary?.cancelled) {
        emit(req.params["id"], "RUN_CANCELLED", { runId: run.id, message: "Run cancelled by user" });
      } else {
        emit(req.params["id"], "RUN_ERROR", { message: "Run failed" });
      }
      res.end();
      return;
    }

    registerStream(req.params["id"], res);
  } catch (err) { next(err); }
});

// All other run routes use the standard JWT-header auth middleware.
router.use(authMiddleware);

const RunDto = z.object({
  agentId: z.string(),
  suiteId: z.string(),
});

router.post("/", validate(RunDto), async (req: AuthRequest, res, next) => {
  try {
    const { agentId, suiteId } = req.body as z.infer<typeof RunDto>;
    await prisma.agent.findFirstOrThrow({ where: { id: agentId, userId: req.userId } });
    await prisma.testSuite.findFirstOrThrow({ where: { id: suiteId } });

    const run = await prisma.run.create({ data: { agentId, suiteId } });
    const job = await runQueue.add("run", { runId: run.id }, { attempts: 1 });
    // Store BullMQ job ID so the cancel endpoint can remove it if still queued
    if (job.id) {
      await prisma.run.update({ where: { id: run.id }, data: { summary: { jobId: job.id } } });
    }
    res.status(202).json({ data: { runId: run.id }, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const { agentId } = req.query as { agentId?: string };
    const runs = await prisma.run.findMany({
      where: { agent: { userId: req.userId }, ...(agentId ? { agentId } : {}) },
      include: {
        agent: { select: { id: true, name: true } },
        suite: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ data: runs, error: null, meta: { count: runs.length } });
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const run = await prisma.run.findFirstOrThrow({
      where: { id: req.params["id"], agent: { userId: req.userId } },
      include: {
        agent: true,
        suite: { include: { cases: true } },
        caseResults: { include: { case: true } },
      },
    });
    res.json({ data: run, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.post("/:id/cancel", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params["id"];
    const run = await prisma.run.findFirstOrThrow({
      where: { id, agent: { userId: req.userId } },
    });

    if (run.status !== "RUNNING" && run.status !== "PENDING") {
      res.json({ data: { ok: true, alreadyDone: true }, error: null, meta: {} });
      return;
    }

    // Try to remove from the BullMQ queue if the job hasn't started yet
    const prevSummary = run.summary as { jobId?: string } | null;
    if (prevSummary?.jobId) {
      try {
        const job = await runQueue.getJob(prevSummary.jobId);
        if (job) await job.remove();
      } catch { /* job is likely active — runner will detect FAILED status on next case */ }
    }

    // Mark as failed with cancellation flag in DB — runner reads this between cases
    await prisma.run.update({
      where: { id },
      data: { status: "FAILED", completedAt: new Date(), summary: { cancelled: true } },
    });

    // Notify any connected SSE clients immediately
    emit(id, "RUN_CANCELLED", { runId: id, message: "Run cancelled by user" });
    setTimeout(() => closeStream(id), 1000);

    res.json({ data: { ok: true }, error: null, meta: {} });
  } catch (err) { next(err); }
});

export default router;
