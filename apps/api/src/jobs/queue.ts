import { Queue, Worker } from "bullmq";
import { config } from "../config";

function parseRedisConnection(url: string) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname || "localhost",
      port: parseInt(u.port || "6379", 10),
      password: u.password || undefined,
      db: u.pathname ? parseInt(u.pathname.slice(1) || "0", 10) : 0,
    };
  } catch {
    return { host: "localhost", port: 6379 };
  }
}

const connection = parseRedisConnection(config.redis.url);

export const runQueue = new Queue("breakloop-runs", { connection });

export function createRunWorker(processor: (runId: string) => Promise<void>): Worker {
  return new Worker(
    "breakloop-runs",
    async (job) => {
      await processor(job.data.runId as string);
    },
    { connection, concurrency: 3 },
  );
}
