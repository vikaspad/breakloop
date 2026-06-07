import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { config } from "../config";
import { validate } from "../middleware/validate";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const RegisterDto = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1) });
const LoginDto = z.object({ email: z.string().email(), password: z.string() });

router.post("/register", validate(RegisterDto), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as z.infer<typeof RegisterDto>;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) { res.status(409).json({ data: null, error: "Email already registered", meta: {} }); return; }
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const token = jwt.sign({ sub: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as string });
    res.status(201).json({ data: { token, user: { id: user.id, email: user.email, name: user.name } }, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.post("/login", validate(LoginDto), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof LoginDto>;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ data: null, error: "Invalid credentials", meta: {} }); return;
    }
    const token = jwt.sign({ sub: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as string });
    res.json({ data: { token, user: { id: user.id, email: user.email, name: user.name } }, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId } });
    res.json({ data: { id: user.id, email: user.email, name: user.name }, error: null, meta: {} });
  } catch (err) { next(err); }
});

router.post("/logout", (_req, res) => {
  res.json({ data: { ok: true }, error: null, meta: {} });
});

export default router;
