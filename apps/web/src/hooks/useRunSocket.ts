import { useEffect, useRef } from "react";
import { api } from "../api/client";
import { useRunStore } from "../store/runStore";
import type { TraceEvent } from "../types";

export function useRunSocket(runId: string | null) {
  const { appendTrace } = useRunStore();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!runId) return;

    const url = api.runs.stream(runId);
    const es = new EventSource(url);
    esRef.current = es;

    const handle = (eventType: TraceEvent["type"]) => (e: MessageEvent<string>) => {
      try {
        const data = JSON.parse(e.data) as Record<string, unknown>;
        appendTrace({ type: eventType, data });
      } catch { /* noop */ }
    };

    es.addEventListener("CASE_COMPLETE", handle("CASE_COMPLETE"));
    es.addEventListener("RUN_COMPLETE", handle("RUN_COMPLETE"));
    es.addEventListener("RUN_ERROR", handle("RUN_ERROR"));
    es.addEventListener("RUN_STARTED", handle("RUN_STARTED"));
    es.addEventListener("STEP_COMPLETE", handle("STEP_COMPLETE"));
    es.addEventListener("RUN_CANCELLED", handle("RUN_CANCELLED"));

    return () => { es.close(); esRef.current = null; };
  }, [runId]);
}
