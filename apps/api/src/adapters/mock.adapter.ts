import Anthropic from "@anthropic-ai/sdk";
import type { Agent } from "@prisma/client";
import { config } from "../config";
import { BaseAdapter, AgentResponse, RunPayload, TraceStep } from "./base.adapter";

export class MockAdapter extends BaseAdapter {
  connType = "MOCK";

  async run(payload: RunPayload): Promise<AgentResponse> {
    const { agent, input } = payload;
    const start = Date.now();

    const client = new Anthropic({ apiKey: config.anthropic.apiKey });

    const system = `You are simulating an AI agent of type "${agent.type}".
Agent name: ${agent.name}.
Respond as this agent would respond — in character, matching the agent type's typical behavior.
Be concise and realistic. Do not mention that you are simulating.`;

    const steps: TraceStep[] = [
      { step: "Mock Simulation", status: "pass", msg: `Simulating ${agent.type} agent via Claude`, ms: "0ms" },
    ];

    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system,
        messages: [{ role: "user", content: input }],
      });

      const latencyMs = Date.now() - start;
      const output = response.content.filter(b => b.type === "text").map(b => (b as { type: "text"; text: string }).text).join("");
      steps.push({ step: "Response Generated", status: "pass", msg: `${output.length} chars`, ms: `${latencyMs}ms` });

      return { output, toolCalls: [], steps, latencyMs, raw: response };
    } catch (err) {
      const latencyMs = Date.now() - start;
      return { output: "", toolCalls: [], steps, latencyMs, raw: null, error: String(err) };
    }
  }

  async healthCheck(_agent: Agent): Promise<boolean> {
    return !!config.anthropic.apiKey;
  }
}
