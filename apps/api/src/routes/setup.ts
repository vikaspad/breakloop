import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import { validate } from "../middleware/validate";

const router = Router();

const SetupDto = z.object({
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  adminName: z.string().min(1),
  jwtSecret: z.string().min(32),
  encryptionKey: z.string().regex(/^[0-9a-f]{64}$/i),
});

// Check if setup is complete
router.get("/check", async (req, res, next) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: "singleton" } });
    res.json({
      data: { isSetupComplete: config?.isSetupComplete ?? false },
      error: null,
      meta: {},
    });
  } catch (err) {
    next(err);
  }
});

// Complete initial setup
router.post("/complete", validate(SetupDto), async (req, res, next) => {
  try {
    const { adminEmail, adminPassword, adminName, jwtSecret, encryptionKey } = req.body as z.infer<typeof SetupDto>;

    // Check if setup already completed
    const existing = await prisma.systemConfig.findUnique({ where: { id: "singleton" } });
    if (existing?.isSetupComplete) {
      return res.status(409).json({ data: null, error: "Setup already completed", meta: {} });
    }

    // Create or update system config
    const config = await prisma.systemConfig.upsert({
      where: { id: "singleton" },
      update: {
        jwtSecret,
        encryptionKey,
        isSetupComplete: true,
        setupCompletedAt: new Date(),
      },
      create: {
        id: "singleton",
        jwtSecret,
        encryptionKey,
        isSetupComplete: true,
        setupCompletedAt: new Date(),
      },
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });

    res.status(201).json({
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name },
        config: { isSetupComplete: true, setupCompletedAt: config.setupCompletedAt },
      },
      error: null,
      meta: {},
    });
  } catch (err) {
    next(err);
  }
});

export default router;
