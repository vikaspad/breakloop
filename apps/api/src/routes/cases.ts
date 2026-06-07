import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router({ mergeParams: true });
router.use(authMiddleware);

const CaseDto = z.object({
  input: z.string().min(1),
  expectedOutput: z.string().optional(),
  behaviorTags: z.array(z.string()).default([]),
  passCriteria: z.string().optional(),
});

router.get("/suites/:suiteId/cases", async (req: AuthRequest, res, next) => {
  try {
    await prisma.testSuite.findFirstOrThrow({ where: { id: req.params["suiteId"], agent: { userId: req.userId } } });
    const cases = await prisma.testCase.findMany({ where: { suiteId: req.params["suiteId"] } });
    res.json({ data: cases, error: null, meta: { count: cases.length } });
  } catch (err) { next(err); }
});

router.post("/suites/:suiteId/cases", validate(CaseDto), async (req: AuthRequest, res, next) => {
  try {
    await prisma.testSuite.findFirstOrThrow({ where: { id: req.params["suiteId"], agent: { userId: req.userId } } });
    const tc = await prisma.testCase.create({ data: { ...req.body as z.infer<typeof CaseDto>, suiteId: req.params["suiteId"] } });
    res.status(201).json({ data: tc, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.patch("/cases/:id", async (req: AuthRequest, res, next) => {
  try {
    const tc = await prisma.testCase.findFirstOrThrow({
      where: { id: req.params["id"] },
      include: { suite: { include: { agent: true } } },
    });
    if (tc.suite.agent.userId !== req.userId) { res.status(403).json({ data: null, error: "Forbidden", meta: {} }); return; }
    const updated = await prisma.testCase.update({ where: { id: req.params["id"] }, data: req.body as Record<string, unknown> });
    res.json({ data: updated, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.delete("/cases/:id", async (req: AuthRequest, res, next) => {
  try {
    const tc = await prisma.testCase.findFirstOrThrow({
      where: { id: req.params["id"] },
      include: { suite: { include: { agent: true } } },
    });
    if (tc.suite.agent.userId !== req.userId) { res.status(403).json({ data: null, error: "Forbidden", meta: {} }); return; }
    await prisma.testCase.delete({ where: { id: req.params["id"] } });
    res.json({ data: { ok: true }, error: null, meta: {} });
  } catch (err) { next(err); }
});

export default router;
