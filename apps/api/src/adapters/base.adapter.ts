import type { Agent } from "@prisma/client";

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
}

export interface TraceStep {
  step: string;
  status: "pass" | "warn" | "fail";
  msg: string;
  ms: string;
}

export interface AgentResponse {
  output: string;
  toolCalls: ToolCall[];
  steps: TraceStep[];
  latencyMs: number;
  raw: unknown;
  error?: string;
}

export interface RunPayload {
  input: string;
  sessionId: string;
  systemPrompt?: string;
  agent: Agent;
}

export abstract class BaseAdapter {
  abstract connType: string;
  abstract run(payload: RunPayload): Promise<AgentResponse>;
  abstract healthCheck(agent: Agent): Promise<boolean>;

  protected elapsed(start: number): string {
    const ms = Date.now() - start;
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  }
}
