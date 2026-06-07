import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, AGENT_TYPE_COLORS, STATUS_COLORS } from "../theme";
import { ScoreRing } from "../components/shared/ScoreRing";
import { MiniBar } from "../components/shared/MiniBar";
import { StatusDot } from "../components/shared/StatusDot";
import { Tag } from "../components/shared/Tag";
import { EmptyState } from "../components/shared/EmptyState";
import { useAgentStore } from "../store/agentStore";
import { useUIStore } from "../store/uiStore";
import { api } from "../api/client";
import type { Run } from "../types";

// Map agent status → ring colour (the source of truth for the ring)
const STATUS_RING_COLOR: Record<string, string> = {
  HEALTHY: C.green,
  WARN:    C.amber,
  FAIL:    C.red,
  PENDING: C.textDim,
};

// When no run score exists yet, fill the arc this much so the ring still
// looks meaningful and matches the status colour
const STATUS_ARC: Record<string, number> = {
  HEALTHY: 100,
  WARN:    55,
  FAIL:    15,
  PENDING: 0,
};

export function Dashboard() {
  const navigate = useNavigate();
  const { agents, fetchAgents } = useAgentStore();
  const { openWizard } = useUIStore();
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    fetchAgents();
    api.runs.list()
      .then(r => setRuns(r.data))
      .catch(() => {});
  }, []);

  // Last completed run score per agent
  const lastScore = (agentId: string): number | null => {
    const hit = runs.find(r => r.agentId === agentId && r.status === "COMPLETE" && r.overallScore !== undefined);
    return hit?.overallScore ?? null;
  };

  const totalRuns = agents.reduce((acc, a) => acc + (a._count?.runs ?? 0), 0);

  const stats = [
    { label: "AGENTS",      value: agents.length,                                           color: C.amber  },
    { label: "TOTAL RUNS",  value: totalRuns,                                               color: C.purple },
    { label: "FAILING",     value: agents.filter(a => a.status === "FAIL").length,          color: C.red    },
    { label: "HEALTHY",     value: agents.filter(a => a.status === "HEALTHY").length,       color: C.green  },
  ];

  return (
    <div className="animate-fadeUp">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: C.text }}>Platform Dashboard</h1>
        <p style={{ fontSize: 11, color: C.textSub, marginTop: 3 }}>Health overview across all registered agents</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontFamily: "'Syne',sans-serif", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.1em", marginBottom: 12 }}>AGENT HEALTH</div>

      {agents.length === 0 ? (
        <EmptyState icon="◈" title="No agents registered yet"
          subtitle="Onboard your first agent to start testing."
          action={{ label: "+ Onboard Agent", onClick: openWizard }} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {agents.map(a => {
            const typeColor  = AGENT_TYPE_COLORS[a.type] ?? C.textSub;
            const ringColor  = STATUS_RING_COLOR[a.status] ?? C.textDim;
            const score      = lastScore(a.id);
            const hasScore   = score !== null;

            // Arc length: real score if we have one, else status-based default
            const arcValue   = hasScore ? score : STATUS_ARC[a.status] ?? 0;
            // Label: real score if we have one, else "—"
            const ringLabel  = hasScore ? String(score) : "—";
            // Bar colour matches ring
            const barColor   = ringColor;

            return (
              <div key={a.id}
                onClick={() => navigate("/run")}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderHover)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <StatusDot status={a.status} />
                      <span style={{ fontSize: 13, color: C.text, fontWeight: 600, fontFamily: "'Syne',sans-serif" }}>{a.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      <Tag label={a.type.replace(/_/g, " ")} color={typeColor} bg={`${typeColor}18`} />
                      <Tag label={a.connType} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <div style={{ fontSize: 10, color: C.textDim }}>
                        Runs: <span style={{ color: C.textSub }}>{a._count?.runs ?? 0}</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.textDim }}>
                        Status: <span style={{ color: STATUS_COLORS[a.status] ?? C.textSub }}>{a.status}</span>
                      </div>
                      {hasScore && (
                        <div style={{ fontSize: 10, color: C.textDim }}>
                          Last score: <span style={{ color: ringColor, fontWeight: 600 }}>{score}/100</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ring: colour = status, arc = last score (or status default), label = last score or "—" */}
                  <ScoreRing
                    score={arcValue}
                    colorOverride={ringColor}
                    label={ringLabel}
                  />
                </div>

                <div style={{ marginTop: 10 }}>
                  <MiniBar value={arcValue} color={barColor} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
