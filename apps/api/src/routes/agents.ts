import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { getAdapter } from "../adapters";
import { encrypt } from "../engine/crypto";
import { AgentType, ConnType, AuthType } from "@prisma/client";

const router = Router();
router.use(authMiddleware);

const AgentDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(AgentType),
  connType: z.nativeEnum(ConnType),
  endpoint: z.string().url().optional().or(z.literal("")),
  authType: z.nativeEnum(AuthType).default(AuthType.NONE),
  authToken: z.string().optional(),
  inputSchema: z.record(z.unknown()).optional(),
  outputSchema: z.record(z.unknown()).optional(),
  evalCriteria: z.array(z.string()).min(1),
  systemPrompt: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { runs: true, suites: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: agents, error: null, meta: { count: agents.length } });
  } catch (err) { next(err); }
});

router.post("/", validate(AgentDto), async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as z.infer<typeof AgentDto>;
    const data = {
      ...body,
      userId: req.userId!,
      authToken: body.authToken ? encrypt(body.authToken) : undefined,
      endpoint: body.endpoint || undefined,
    };
    const agent = await prisma.agent.create({ data });
    res.status(201).json({ data: agent, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const agent = await prisma.agent.findFirstOrThrow({ where: { id: req.params["id"], userId: req.userId } });
    res.json({ data: agent, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.agent.findFirstOrThrow({ where: { id: req.params["id"], userId: req.userId } });
    const body = req.body as Partial<z.infer<typeof AgentDto>>;
    const update = {
      ...body,
      authToken: body.authToken ? encrypt(body.authToken) : existing.authToken,
    };
    const agent = await prisma.agent.update({ where: { id: req.params["id"] }, data: update });
    res.json({ data: agent, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params["id"];
    // Verify agent belongs to user before deleting
    await prisma.agent.findFirstOrThrow({ where: { id, userId: req.userId } });

    // Delete agent - Prisma cascade delete will handle all related records:
    // Agent → TestSuite → TestCase → CaseResult
    // Agent → Run → CaseResult
    await prisma.agent.delete({ where: { id } });

    res.json({ data: { ok: true }, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.post("/:id/ping", async (req: AuthRequest, res, next) => {
  try {
    const agent = await prisma.agent.findFirstOrThrow({ where: { id: req.params["id"], userId: req.userId } });
    const adapter = getAdapter(agent.connType);
    const healthy = await adapter.healthCheck(agent);
    const status = healthy ? "HEALTHY" : "FAIL";
    await prisma.agent.update({ where: { id: agent.id }, data: { status } });
    res.json({ data: { healthy, status }, error: null, meta: {} });
  } catch (err) { next(err); }
});

export default router;
