import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { authMiddleware } from "../middleware/auth";
import { encrypt, decrypt } from "../engine/crypto";

const router = Router();

router.use(authMiddleware);

// GET /api/config/evaluator — Get current evaluator config
router.get("/evaluator", async (req, res) => {
  try {
    const config = await prisma.evaluatorConfig.findUnique({
      where: { userId: req.userId! },
    });

    if (!config) {
      return res.json({
        data: {
          evaluatorType: "BUILTIN",
          model: "gpt-4o-mini",
          isEnabled: false,
          apiKey: undefined,
        },
        error: null,
        meta: {},
      });
    }

    // Don't return encrypted API key to frontend
    res.json({
      data: {
        evaluatorType: config.evaluatorType,
        model: config.model,
        isEnabled: config.isEnabled,
        apiKey: undefined, // Never expose to frontend
      },
      error: null,
      meta: {},
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch config",
      meta: {},
    });
  }
});

// PATCH /api/config/evaluator — Update evaluator config
router.patch(
  "/evaluator",
  async (req, res) => {
    try {
      const body = z
        .object({
          evaluatorType: z.enum(["BUILTIN", "OPENAI", "CLAUDE"]).optional(),
          model: z.string().optional(),
          apiKey: z.string().optional(),
          isEnabled: z.boolean().optional(),
        })
        .parse(req.body);

      // If disabling, don't touch the stored key
      if (body.isEnabled === false) {
        const updated = await prisma.evaluatorConfig.upsert({
          where: { userId: req.userId! },
          update: { isEnabled: false },
          create: {
            userId: req.userId!,
            isEnabled: false,
            evaluatorType: "BUILTIN",
            model: "gpt-4o-mini",
          },
        });

        return res.json({
          data: {
            evaluatorType: updated.evaluatorType,
            model: updated.model,
            isEnabled: updated.isEnabled,
          },
          error: null,
          meta: {},
        });
      }

      // If enabling or updating, validate required fields
      if (body.isEnabled === true || body.evaluatorType) {
        if (!body.evaluatorType)
          throw new Error("evaluatorType is required when enabling");
        if (body.evaluatorType !== "BUILTIN" && !body.apiKey)
          throw new Error("apiKey is required for custom evaluators");
        if (!body.model)
          throw new Error("model is required");
      }

      // Encrypt API key if provided
      const encryptedKey =
        body.apiKey && body.evaluatorType !== "BUILTIN"
          ? encrypt(body.apiKey)
          : undefined;

      // Auto-enable if custom evaluator with API key is provided
      const finalIsEnabled =
        body.isEnabled ?? (body.evaluatorType && body.evaluatorType !== "BUILTIN" && body.apiKey ? true : undefined);

      const updateData: any = {
        ...(body.evaluatorType && { evaluatorType: body.evaluatorType }),
        ...(body.model && { model: body.model }),
        ...(encryptedKey !== undefined && { apiKey: encryptedKey }),
        ...(finalIsEnabled !== undefined && { isEnabled: finalIsEnabled }),
      };

      const updated = await prisma.evaluatorConfig.upsert({
        where: { userId: req.userId! },
        update: updateData,
        create: {
          userId: req.userId!,
          evaluatorType: body.evaluatorType ?? "BUILTIN",
          model: body.model ?? "gpt-4o-mini",
          apiKey: encryptedKey,
          isEnabled: body.isEnabled ?? false,
        },
      });

      res.json({
        data: {
          evaluatorType: updated.evaluatorType,
          model: updated.model,
          isEnabled: updated.isEnabled,
        },
        error: null,
        meta: {},
      });
    } catch (err) {
      res.status(400).json({
        data: null,
        error: err instanceof Error ? err.message : "Invalid config",
        meta: {},
      });
    }
  }
);

export default router;
