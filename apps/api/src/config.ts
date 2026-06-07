import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("3001"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(16).optional(), // Now optional - loaded from DB
  JWT_EXPIRES_IN: z.string().default("7d"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  EVALUATOR_MODEL: z.string().default("gpt-4o-mini"),
  EVALUATOR_MAX_TOKENS: z.coerce.number().default(1024),
  ENCRYPTION_KEY: z.string().optional(), // Now optional - loaded from DB
  VITE_API_URL: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

// Default fallback values (used until first setup via UI)
const DEFAULT_JWT_SECRET = "breakloop-dev-secret-change-in-setup-32chars";
const DEFAULT_ENCRYPTION_KEY = "0".repeat(64);

export const config = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  jwt: {
    secret: parsed.data.JWT_SECRET || DEFAULT_JWT_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
  },
  db: {
    url: parsed.data.DATABASE_URL,
  },
  redis: {
    url: parsed.data.REDIS_URL,
  },
  anthropic: {
    apiKey: parsed.data.ANTHROPIC_API_KEY ?? "",
  },
  openai: {
    apiKey: parsed.data.OPENAI_API_KEY ?? "",
  },
  evaluator: {
    model: parsed.data.EVALUATOR_MODEL,
    maxTokens: parsed.data.EVALUATOR_MAX_TOKENS,
  },
  encryptionKey: parsed.data.ENCRYPTION_KEY || DEFAULT_ENCRYPTION_KEY,
};

// Function to load secrets from database (called after setup)
export async function loadSecretsFromDatabase() {
  try {
    const { prisma } = await import("./db/prisma");
    const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "singleton" } });

    if (systemConfig) {
      config.jwt.secret = systemConfig.jwtSecret;
      config.encryptionKey = systemConfig.encryptionKey;
      return true;
    }
  } catch (err) {
    console.warn("[CONFIG] Could not load secrets from database:", err);
  }
  return false;
}
