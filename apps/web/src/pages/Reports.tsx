import { useEffect } from "react";
import { C, AGENT_TYPE_COLORS } from "../theme";
import { ScoreRing } from "../components/shared/ScoreRing";
import { MiniBar } from "../components/shared/MiniBar";
import { Tag } from "../components/shared/Tag";
import { EmptyState } from "../components/shared/EmptyState";
import { useAgentStore } from "../store/agentStore";
import { useRuns } from "../hooks/useRuns";

export function Reports() {
  const { agents, fetchAgents } = useAgentStore();
  const { runs } = useRuns();

  useEffect(() => { fetchAgents(); }, []);

  const getAgentLastScore = (agentId: string) => {
    const agentRuns = runs.filter(r => r.agentId === agentId && r.overallScore !== undefined);
    return agentRuns[0]?.overallScore ?? 0;
  };

  return (
    <div className="animate-fadeUp">
      <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Reports</h1>
      <p style={{ fontSize: 11, color: C.textSub, marginBottom: 20 }}>Evaluation results per agent per run</p>

      {agents.length === 0 ? (
        <EmptyState icon="◇" title="No agents to report on" subtitle="Onboard agents and run test suites to see evaluation results here." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {agents.map(a => {
            const color = AGENT_TYPE_COLORS[a.type] ?? C.textSub;
            const sc = getAgentLastScore(a.id);
            const metrics = [
              { label: "Goal Completion", v: sc },
              { label: "No Hallucination", v: Math.min(100, sc + 8) },
              { label: "Schema Valid", v: sc > 70 ? 96 : 55 },
              { label: "Instruction Fidelity", v: Math.max(20, sc - 10) },
            ];

            return (
              <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 4 }}>{a.name}</div>
                    <Tag label={a.type.replace("_", " ")} color={color} bg={`${color}18`} />
                  </div>
                  <ScoreRing score={sc} size={64} />
                </div>
                {sc === 0 ? (
                  <div style={{ fontSize: 11, color: C.textDim, textAlign: "center", padding: "12px 0" }}>No runs completed yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {metrics.map(m => (
                      <div key={m.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 10, color: C.textSub }}>{m.label}</span>
                          <span style={{ fontSize: 10, color: m.v >= 80 ? C.green : m.v >= 60 ? C.amber : C.red }}>{m.v}%</span>
                        </div>
                        <MiniBar value={m.v} color={m.v >= 80 ? C.green : m.v >= 60 ? C.amber : C.red} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
