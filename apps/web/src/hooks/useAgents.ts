import { useEffect } from "react";
import { useAgentStore } from "../store/agentStore";

export function useAgents() {
  const { agents, loading, fetchAgents, createAgent, deleteAgent, pingAgent, selectedAgent, setSelectedAgent } = useAgentStore();

  useEffect(() => {
    if (agents.length === 0) fetchAgents();
  }, []);

  return { agents, loading, fetchAgents, createAgent, deleteAgent, pingAgent, selectedAgent, setSelectedAgent };
}
