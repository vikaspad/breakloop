import type { Agent } from "@prisma/client";
import { BaseAdapter, AgentResponse, RunPayload } from "./base.adapter";
import { decrypt } from "../engine/crypto";

export class RestAdapter extends BaseAdapter {
  connType = "REST";

  async run(payload: RunPayload): Promise<AgentResponse> {
    const { agent, input, sessionId } = payload;
    const start = Date.now();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (agent.authToken) {
      const token = decrypt(agent.authToken);
      if (agent.authType === "BEARER") headers["Authorization"] = `Bearer ${token}`;
      else if (agent.authType === "API_KEY") headers["x-api-key"] = token;
      else if (agent.authType === "BASIC") headers["Authorization"] = `Basic ${Buffer.from(token).toString("base64")}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch(agent.endpoint!, {
        method: "POST",
        headers,
        body: JSON.stringify({ input, session_id: sessionId }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return { output: "", toolCalls: [], steps: [], latencyMs, raw: null, error: `HTTP ${res.status}` };
      }

      const data: unknown = await res.json();
      const output = typeof (data as Record<string, unknown>)["output"] === "string"
        ? (data as Record<string, unknown>)["output"] as string
        : JSON.stringify(data);

      return {
        output,
        toolCalls: [],
        steps: [{ step: "REST Call", status: "pass", msg: `HTTP 200 in ${latencyMs}ms`, ms: `${latencyMs}ms` }],
        latencyMs,
        raw: data,
      };
    } catch (err) {
      clearTimeout(timeout);
      const latencyMs = Date.now() - start;
      const raw = err instanceof Error ? err.message : String(err);

      let msg: string;
      if (!agent.endpoint) {
        msg = "No endpoint configured for this agent. Set an endpoint in Agent Registry.";
      } else if (raw.includes("ECONNREFUSED") || raw.includes("fetch failed") || raw.includes("ENOTFOUND")) {
        msg = `Cannot reach agent at ${agent.endpoint} — connection refused. Is the agent server running?`;
      } else if (raw.includes("abort") || raw.includes("AbortError")) {
        msg = `Request to ${agent.endpoint} timed out after 30s.`;
      } else {
        msg = `${raw} (endpoint: ${agent.endpoint})`;
      }

      return { output: "", toolCalls: [], steps: [], latencyMs, raw: null, error: msg };
    }
  }

  async healthCheck(agent: Agent): Promise<boolean> {
    if (!agent.endpoint) return false;
    try {
      const res = await fetch(agent.endpoint, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }
}
