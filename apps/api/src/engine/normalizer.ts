import { AgentResponse } from "../adapters/base.adapter";

export interface NormalizedResponse {
  output: string;
  toolCallCount: number;
  stepCount: number;
  latencyMs: number;
  hasError: boolean;
  errorMessage?: string;
}

export function normalize(response: AgentResponse): NormalizedResponse {
  return {
    output: response.output.trim(),
    toolCallCount: response.toolCalls.length,
    stepCount: response.steps.length,
    latencyMs: response.latencyMs,
    hasError: !!response.error,
    errorMessage: response.error,
  };
}
