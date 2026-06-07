import OpenAI from "openai";
import type { Agent } from "@prisma/client";
import { BaseAdapter, AgentResponse, RunPayload, TraceStep, ToolCall } from "./base.adapter";
import { decrypt } from "../engine/crypto";

export class OpenAIAdapter extends BaseAdapter {
  connType = "OPENAI";

  async run(payload: RunPayload): Promise<AgentResponse> {
    const { agent, input, systemPrompt } = payload;
    const start = Date.now();

    const apiKey = agent.authToken ? decrypt(agent.authToken) : "";
    const client = new OpenAI({ apiKey });

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt ?? agent.systemPrompt ?? "You are a helpful AI assistant." },
          { role: "user", content: input },
        ],
      });

      const latencyMs = Date.now() - start;
      const choice = response.choices[0];
      const output = choice?.message?.content ?? "";
      const toolCalls: ToolCall[] = (choice?.message?.tool_calls ?? []).map((tc) => ({
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments) as Record<string, unknown>,
      }));

      const steps: TraceStep[] = [
        { step: "OpenAI Chat", status: "pass", msg: `Tokens: ${response.usage?.total_tokens ?? "?"}`, ms: `${latencyMs}ms` },
      ];

      return { output, toolCalls, steps, latencyMs, raw: response };
    } catch (err) {
      const latencyMs = Date.now() - start;
      return { output: "", toolCalls: [], steps: [], latencyMs, raw: null, error: String(err) };
    }
  }

  async healthCheck(agent: Agent): Promise<boolean> {
    if (!agent.authToken) return false;
    try {
      const apiKey = decrypt(agent.authToken);
      const client = new OpenAI({ apiKey });
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
