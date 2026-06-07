import { create } from "zustand";
import { api } from "../api/client";
import type { Run, TraceEvent } from "../types";

interface RunStore {
  activeRun: Run | null;
  activeRunId: string | null;
  traceEvents: TraceEvent[];
  isRunning: boolean;
  triggerRun: (agentId: string, suiteId: string) => Promise<string>;
  cancelRun: () => Promise<void>;
  appendTrace: (event: TraceEvent) => void;
  clearTrace: () => void;
  setActiveRun: (run: Run | null) => void;
}

export const useRunStore = create<RunStore>((set, get) => ({
  activeRun: null,
  activeRunId: null,
  traceEvents: [],
  isRunning: false,

  triggerRun: async (agentId, suiteId) => {
    set({ isRunning: true, traceEvents: [], activeRunId: null });
    const res = await api.runs.trigger(agentId, suiteId);
    set({ activeRunId: res.data.runId });
    return res.data.runId;
  },

  cancelRun: async () => {
    const { activeRunId } = get();
    if (!activeRunId) return;
    try {
      await api.runs.cancel(activeRunId);
    } catch { /* SSE will notify the UI via RUN_CANCELLED */ }
    set({ isRunning: false });
  },

  appendTrace: (event) =>
    set((s) => {
      const events = [...s.traceEvents, event];
      const done = event.type === "RUN_COMPLETE" || event.type === "RUN_ERROR" || event.type === "RUN_CANCELLED";
      return { traceEvents: events, isRunning: !done };
    }),

  clearTrace: () => set({ traceEvents: [], activeRun: null, activeRunId: null, isRunning: false }),

  setActiveRun: (run) => set({ activeRun: run }),
}));
