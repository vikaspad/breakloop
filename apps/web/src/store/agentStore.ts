import { create } from "zustand";
import { api } from "../api/client";
import type { Agent, CreateAgentDto } from "../types";

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  fetchAgents: () => Promise<void>;
  setSelectedAgent: (agent: Agent | null) => void;
  createAgent: (dto: CreateAgentDto) => Promise<Agent>;
  updateAgent: (id: string, dto: Partial<CreateAgentDto>) => Promise<Agent>;
  deleteAgent: (id: string) => Promise<void>;
  pingAgent: (id: string) => Promise<boolean>;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  selectedAgent: null,
  loading: false,

  fetchAgents: async () => {
    set({ loading: true });
    try {
      const res = await api.agents.list();
      set({ agents: res.data });
    } catch {
      // use mock data if API unavailable
    } finally {
      set({ loading: false });
    }
  },

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  createAgent: async (dto) => {
    const res = await api.agents.create(dto);
    set((s) => ({ agents: [res.data, ...s.agents] }));
    return res.data;
  },

  updateAgent: async (id, dto) => {
    const res = await api.agents.update(id, dto);
    set((s) => ({
      agents: s.agents.map((a) => a.id === id ? res.data : a),
      selectedAgent: s.selectedAgent?.id === id ? res.data : s.selectedAgent,
    }));
    return res.data;
  },

  deleteAgent: async (id) => {
    try {
      await api.agents.delete(id);
      set((s) => ({ agents: s.agents.filter((a) => a.id !== id) }));
    } catch (err) {
      console.error("[deleteAgent] Failed to delete agent:", err);
      alert(`Failed to delete agent: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  },

  pingAgent: async (id) => {
    try {
      const res = await api.agents.ping(id);
      set((s) => ({
        agents: s.agents.map((a) =>
          a.id === id ? { ...a, status: res.data.status as Agent["status"] } : a,
        ),
      }));
      if (get().selectedAgent?.id === id) {
        const updated = get().agents.find((a) => a.id === id);
        if (updated) set({ selectedAgent: updated });
      }
      return res.data.healthy;
    } catch {
      set((s) => ({
        agents: s.agents.map((a) => a.id === id ? { ...a, status: "FAIL" } : a),
      }));
      return false;
    }
  },
}));
