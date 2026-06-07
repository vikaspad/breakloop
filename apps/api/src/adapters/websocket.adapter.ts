import { WebSocket } from "ws";
import type { Agent } from "@prisma/client";
import { BaseAdapter, AgentResponse, RunPayload } from "./base.adapter";
import { decrypt } from "../engine/crypto";

export class WebSocketAdapter extends BaseAdapter {
  connType = "WEBSOCKET";

  async run(payload: RunPayload): Promise<AgentResponse> {
    const { agent, input, sessionId } = payload;
    const start = Date.now();

    return new Promise((resolve) => {
      let output = "";
      const headers: Record<string, string> = {};
      if (agent.authToken) headers["Authorization"] = `Bearer ${decrypt(agent.authToken)}`;

      const ws = new WebSocket(agent.endpoint!, { headers });
      const timer = setTimeout(() => {
        ws.close();
        resolve({ output, toolCalls: [], steps: [{ step: "WebSocket", status: "fail", msg: "Timeout after 30s", ms: "30s" }], latencyMs: 30000, raw: null, error: "Timeout" });
      }, 30_000);

      ws.on("open", () => {
        ws.send(JSON.stringify({ input, session_id: sessionId }));
      });

      ws.on("message", (data) => {
        const text = data.toString();
        try {
          const parsed = JSON.parse(text) as Record<string, unknown>;
          if (parsed["done"]) { clearTimeout(timer); ws.close(); return; }
          output += typeof parsed["token"] === "string" ? parsed["token"] : text;
        } catch {
          output += text;
        }
      });

      ws.on("close", () => {
        clearTimeout(timer);
        const latencyMs = Date.now() - start;
        resolve({
          output, toolCalls: [],
          steps: [{ step: "WebSocket Stream", status: "pass", msg: `Streamed ${output.length} chars`, ms: `${latencyMs}ms` }],
          latencyMs, raw: null,
        });
      });

      ws.on("error", (err) => {
        clearTimeout(timer);
        resolve({ output: "", toolCalls: [], steps: [], latencyMs: Date.now() - start, raw: null, error: err.message });
      });
    });
  }

  async healthCheck(agent: Agent): Promise<boolean> {
    if (!agent.endpoint) return false;
    return new Promise((resolve) => {
      const ws = new WebSocket(agent.endpoint!);
      const timer = setTimeout(() => { ws.close(); resolve(false); }, 5000);
      ws.on("open", () => { clearTimeout(timer); ws.close(); resolve(true); });
      ws.on("error", () => { clearTimeout(timer); resolve(false); });
    });
  }
}
