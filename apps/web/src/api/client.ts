import type { Agent, TestSuite, TestCase, Run, CreateAgentDto, ApiResponse } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function getToken(): string | null {
  return localStorage.getItem("bl_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json() as ApiResponse<T>;
  if (res.status === 401) {
    localStorage.removeItem("bl_token");
    window.location.reload();
  }
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>("/api/auth/login", {
        method: "POST", body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>("/api/auth/register", {
        method: "POST", body: JSON.stringify({ email, password, name }),
      }),
    me: () => request<{ id: string; email: string; name: string }>("/api/auth/me"),
  },
  agents: {
    list: () => request<Agent[]>("/api/agents"),
    get: (id: string) => request<Agent>(`/api/agents/${id}`),
    create: (dto: CreateAgentDto) =>
      request<Agent>("/api/agents", { method: "POST", body: JSON.stringify(dto) }),
    update: (id: string, dto: Partial<CreateAgentDto>) =>
      request<Agent>(`/api/agents/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/agents/${id}`, { method: "DELETE" }),
    ping: (id: string) =>
      request<{ healthy: boolean; status: string }>(`/api/agents/${id}/ping`, { method: "POST" }),
  },
  suites: {
    list: () => request<TestSuite[]>("/api/suites"),
    get: (id: string) => request<TestSuite>(`/api/suites/${id}`),
    create: (name: string, agentId: string, tags?: string[]) =>
      request<TestSuite>("/api/suites", { method: "POST", body: JSON.stringify({ name, agentId, tags: tags ?? [] }) }),
    update: (id: string, data: { name?: string; tags?: string[] }) =>
      request<TestSuite>(`/api/suites/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/suites/${id}`, { method: "DELETE" }),
  },
  cases: {
    list: (suiteId: string) => request<TestCase[]>(`/api/suites/${suiteId}/cases`),
    create: (suiteId: string, data: Omit<TestCase, "id" | "suiteId" | "createdAt">) =>
      request<TestCase>(`/api/suites/${suiteId}/cases`, { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<TestCase>) =>
      request<TestCase>(`/api/cases/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/cases/${id}`, { method: "DELETE" }),
  },
  runs: {
    trigger: (agentId: string, suiteId: string) =>
      request<{ runId: string }>("/api/runs", { method: "POST", body: JSON.stringify({ agentId, suiteId }) }),
    cancel: (id: string) =>
      request<{ ok: boolean }>(`/api/runs/${id}/cancel`, { method: "POST" }),
    list: (agentId?: string) =>
      request<Run[]>(`/api/runs${agentId ? `?agentId=${agentId}` : ""}`),
    get: (id: string) => request<Run>(`/api/runs/${id}`),
    stream: (id: string) => {
      const token = getToken();
      return `${BASE}/api/runs/${id}/stream${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    },
  },
  config: {
    getEvaluator: () =>
      request<any>("/api/config/evaluator"),
    updateEvaluator: (data: { evaluatorType?: string; model?: string; apiKey?: string; isEnabled?: boolean }) =>
      request<any>("/api/config/evaluator", { method: "PATCH", body: JSON.stringify(data) }),
  },
  setup: {
    check: () =>
      request<{ isSetupComplete: boolean }>("/api/setup/check"),
    complete: (data: { adminEmail: string; adminPassword: string; adminName: string; jwtSecret: string; encryptionKey: string }) =>
      request<{ token: string; user: { id: string; email: string; name: string }; config: { isSetupComplete: boolean; setupCompletedAt: string } }>("/api/setup/complete", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
