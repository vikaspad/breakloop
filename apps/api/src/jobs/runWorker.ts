import { createRunWorker } from "./queue";
import { executeRun } from "../engine/runner";

export const worker = createRunWorker(executeRun);

worker.on("completed", (job) => console.log(`[worker] Run ${job.data.runId} completed`));
worker.on("failed", (job, err) => console.error(`[worker] Run ${job?.data?.runId} failed:`, err));
