import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(authMiddleware);

const SuiteDto = z.object({
  name: z.string().min(1),
  agentId: z.string(),
  tags: z.array(z.string()).default([]),
});

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const suites = await prisma.testSuite.findMany({
      where: { agent: { userId: req.userId } },
      include: { _count: { select: { cases: true, runs: true } }, agent: { select: { id: true, name: true, type: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: suites, error: null, meta: { count: suites.length } });
  } catch (err) { next(err); }
});

router.post("/", validate(SuiteDto), async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as z.infer<typeof SuiteDto>;
    await prisma.agent.findFirstOrThrow({ where: { id: body.agentId, userId: req.userId } });
    const suite = await prisma.testSuite.create({ data: body });
    res.status(201).json({ data: suite, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const suite = await prisma.testSuite.findFirstOrThrow({
      where: { id: req.params["id"], agent: { userId: req.userId } },
      include: { cases: true, agent: { select: { id: true, name: true } } },
    });
    res.json({ data: suite, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    await prisma.testSuite.findFirstOrThrow({ where: { id: req.params["id"], agent: { userId: req.userId } } });
    const suite = await prisma.testSuite.update({ where: { id: req.params["id"] }, data: req.body as Record<string, unknown> });
    res.json({ data: suite, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params["id"];
    // Verify suite belongs to user's agent before deleting
    await prisma.testSuite.findFirstOrThrow({ where: { id, agent: { userId: req.userId } } });

    // Delete suite - Prisma cascade delete will handle:
    // TestSuite → TestCase → CaseResult
    // TestSuite → Run → CaseResult
    await prisma.testSuite.delete({ where: { id } });

    res.json({ data: { ok: true }, error: null, meta: {} });
  } catch (err) { next(err); }
});

export default router;
