import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config, loadSecretsFromDatabase } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import agentRoutes from "./routes/agents";
import suiteRoutes from "./routes/suites";
import caseRoutes from "./routes/cases";
import runRoutes from "./routes/runs";
import configRoutes from "./routes/config";
import setupRoutes from "./routes/setup";
import "./jobs/runWorker";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, ts: new Date() }));

// Setup route (must be first)
app.use("/api/setup", setupRoutes);

// Load secrets from database on startup
loadSecretsFromDatabase().then(loaded => {
  if (loaded) {
    console.log("[CONFIG] Loaded JWT secret and encryption key from database");
  } else {
    console.log("[CONFIG] Using default secrets - run setup to configure");
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/suites", suiteRoutes);
app.use("/api/runs", runRoutes); // must be before the /api catch-all below
app.use("/api/config", configRoutes);
app.use("/api", caseRoutes);    // catch-all for /api/cases/:id and /api/suites/:id/cases

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`BreakLoop API running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
