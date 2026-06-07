import Anthropic from "@anthropic-ai/sdk";
import type { Agent } from "@prisma/client";
import { BaseAdapter, AgentResponse, RunPayload, TraceStep, ToolCall } from "./base.adapter";
import { decrypt } from "../engine/crypto";

export class ClaudeAdapter extends BaseAdapter {
  connType = "CLAUDE_API";

  async run(payload: RunPayload): Promise<AgentResponse> {
    const { agent, input, systemPrompt } = payload;
    const start = Date.now();

    const apiKey = agent.authToken ? decrypt(agent.authToken) : "";
    const client = new Anthropic({ apiKey });

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt ?? agent.systemPrompt ?? "You are a helpful AI assistant.",
        messages: [{ role: "user", content: input }],
      });

      const latencyMs = Date.now() - start;
      let output = "";
      const toolCalls: ToolCall[] = [];
      const steps: TraceStep[] = [];

      for (const block of response.content) {
        if (block.type === "text") {
          output += block.text;
          steps.push({ step: "Text Output", status: "pass", msg: `Generated ${block.text.length} chars`, ms: this.elapsed(start) });
        } else if (block.type === "tool_use") {
          toolCalls.push({ name: block.name, input: block.input as Record<string, unknown> });
          steps.push({ step: `Tool: ${block.name}`, status: "pass", msg: `Called with ${JSON.stringify(block.input).slice(0, 80)}`, ms: this.elapsed(start) });
        }
      }

      return { output, toolCalls, steps, latencyMs, raw: response };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { output: "", toolCalls: [], steps: [], latencyMs, raw: null, error: msg };
    }
  }

  async healthCheck(agent: Agent): Promise<boolean> {
    if (!agent.authToken) return false;
    try {
      const apiKey = decrypt(agent.authToken);
      const client = new Anthropic({ apiKey });
      await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        messages: [{ role: "user", content: "hi" }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
