import { Response } from "express";

const streams = new Map<string, Set<Response>>();

export function registerStream(runId: string, res: Response): void {
  if (!streams.has(runId)) streams.set(runId, new Set());
  streams.get(runId)!.add(res);
  res.on("close", () => streams.get(runId)?.delete(res));
}

export function emit(runId: string, event: string, data: unknown): void {
  const clients = streams.get(runId);
  if (!clients) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch { clients.delete(res); }
  }
}

export function closeStream(runId: string): void {
  const clients = streams.get(runId);
  if (!clients) return;
  for (const res of clients) { try { res.end(); } catch { /* noop */ } }
  streams.delete(runId);
}
