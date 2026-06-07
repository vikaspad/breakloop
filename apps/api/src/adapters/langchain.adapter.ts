import type { Agent } from "@prisma/client";
import { BaseAdapter, AgentResponse, RunPayload, TraceStep } from "./base.adapter";
import { decrypt } from "../engine/crypto";

export class LangChainAdapter extends BaseAdapter {
  connType = "LANGCHAIN";

  async run(payload: RunPayload): Promise<AgentResponse> {
    const { agent, input, sessionId } = payload;
    const start = Date.now();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (agent.authToken) {
      headers["Authorization"] = `Bearer ${decrypt(agent.authToken)}`;
    }

    try {
      const res = await fetch(`${agent.endpoint}/invoke`, {
        method: "POST",
        headers,
        body: JSON.stringify({ input: { input, session_id: sessionId }, config: {} }),
        signal: AbortSignal.timeout(30_000),
      });

      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return { output: "", toolCalls: [], steps: [], latencyMs, raw: null, error: `HTTP ${res.status}` };
      }

      const data = await res.json() as Record<string, unknown>;
      const output = typeof data["output"] === "string" ? data["output"] : JSON.stringify(data["output"]);
      const intermediateSteps = Array.isArray(data["intermediate_steps"]) ? data["intermediate_steps"] : [];

      const steps: TraceStep[] = intermediateSteps.map((s: unknown, i: number) => ({
        step: `Step ${i + 1}`,
        status: "pass" as const,
        msg: JSON.stringify(s).slice(0, 120),
        ms: this.elapsed(start),
      }));

      steps.push({ step: "LangServe Invoke", status: "pass", msg: `Completed in ${latencyMs}ms`, ms: `${latencyMs}ms` });

      return { output, toolCalls: [], steps, latencyMs, raw: data };
    } catch (err) {
      const latencyMs = Date.now() - start;
      return { output: "", toolCalls: [], steps: [], latencyMs, raw: null, error: String(err) };
    }
  }

  async healthCheck(agent: Agent): Promise<boolean> {
    if (!agent.endpoint) return false;
    try {
      const res = await fetch(`${agent.endpoint}/info`, { signal: AbortSignal.timeout(5000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}
