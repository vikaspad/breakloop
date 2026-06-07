import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { Run } from "../types";

export function useRuns(agentId?: string) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await api.runs.list(agentId);
      setRuns(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRuns(); }, [agentId]);

  return { runs, loading, refetch: fetchRuns };
}
