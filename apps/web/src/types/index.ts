export type AgentType = "CONVERSATIONAL" | "TOOL_USING" | "AUTONOMOUS" | "MULTI_AGENT" | "RAG_PIPELINE" | "CUSTOM";
export type ConnType = "REST" | "CLAUDE_API" | "OPENAI" | "LANGCHAIN" | "WEBSOCKET" | "MOCK";
export type AuthType = "BEARER" | "API_KEY" | "BASIC" | "NONE";
export type AgentStatus = "PENDING" | "HEALTHY" | "WARN" | "FAIL";
export type RunStatus = "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
export type EvalStatus = "PASS" | "WARN" | "FAIL";

export interface Agent {
  id: string;
  name: string;
  description?: string;
  type: AgentType;
  connType: ConnType;
  endpoint?: string;
  authType: AuthType;
  evalCriteria: string[];
  systemPrompt?: string;
  tags: string[];
  status: AgentStatus;
  userId: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  _count?: { runs: number; suites: number };
}

export interface TestSuite {
  id: string;
  name: string;
  tags: string[];
  agentId: string;
  agent?: Pick<Agent, "id" | "name" | "type">;
  cases?: TestCase[];
  createdAt: string;
  _count?: { cases: number; runs: number };
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput?: string;
  behaviorTags: string[];
  passCriteria?: string;
  suiteId: string;
  createdAt: string;
}

export interface TraceStep {
  step: string;
  status: "pass" | "warn" | "fail";
  msg: string;
  ms: string;
}

export interface CaseResult {
  id: string;
  caseId: string;
  runId: string;
  status: EvalStatus;
  agentOutput: string;
  latencyMs: number;
  scores: Record<string, number>;
  failureTags: string[];
  evalReason: string;
  traceSteps: TraceStep[];
  createdAt: string;
  case?: TestCase;
}

export interface Run {
  id: string;
  agentId: string;
  suiteId: string;
  status: RunStatus;
  overallScore?: number;
  summary?: { pass: number; warn: number; fail: number };
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  agent?: Pick<Agent, "id" | "name">;
  suite?: Pick<TestSuite, "id" | "name">;
  caseResults?: CaseResult[];
}

export interface TraceEvent {
  type: "CASE_COMPLETE" | "RUN_COMPLETE" | "RUN_ERROR" | "STEP_COMPLETE" | "RUN_STARTED" | "RUN_CANCELLED";
  data: Record<string, unknown>;
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  type: AgentType;
  connType: ConnType;
  endpoint?: string;
  authType: AuthType;
  authToken?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  evalCriteria: string[];
  systemPrompt?: string;
  tags: string[];
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  meta: Record<string, unknown>;
}
