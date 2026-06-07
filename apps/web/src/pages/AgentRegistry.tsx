import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, AGENT_TYPE_COLORS, STATUS_COLORS } from "../theme";
import { Tag } from "../components/shared/Tag";
import { StatusDot } from "../components/shared/StatusDot";
import { EmptyState } from "../components/shared/EmptyState";
import { useAgentStore } from "../store/agentStore";
import { useUIStore } from "../store/uiStore";
import type { Agent } from "../types";

const CONN_LABELS: Record<string, string> = {
  REST: "REST API", CLAUDE_API: "Claude API", OPENAI: "OpenAI",
  LANGCHAIN: "LangChain", WEBSOCKET: "WebSocket", MOCK: "Mock",
};

// ─── Agent Detail Panel ──────────────────────────────────────────────────────

function AgentDetailPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const { updateAgent } = useAgentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: agent.name,
    description: agent.description || "",
    tags: agent.tags || [],
    evalCriteria: agent.evalCriteria || [],
  });
  const [saving, setSaving] = useState(false);
  const color = AGENT_TYPE_COLORS[agent.type] ?? C.textSub;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAgent(agent.id, {
        name: editData.name,
        description: editData.description,
        tags: editData.tags,
        evalCriteria: editData.evalCriteria,
      });
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update agent: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: "flex", gap: 16, padding: "9px 14px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 10, color: C.textDim, width: 130, flexShrink: 0, paddingTop: 1 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.text, flex: 1, wordBreak: "break-all" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 580, maxHeight: "85vh", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 18, flexShrink: 0 }}>◈</div>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", background: C.card, width: "100%", marginBottom: 6 }}
              />
            ) : (
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: C.text }}>{agent.name}</div>
            )}
            <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
              <StatusDot status={agent.status} />
              <span style={{ fontSize: 10, color: STATUS_COLORS[agent.status] ?? C.textDim }}>{agent.status}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isEditing && (
              <>
                <button onClick={handleSave} disabled={saving} style={{ background: saving ? C.muted : C.green, border: `1px solid ${C.green}40`, color: saving ? C.textDim : "#ffffff", padding: "8px 16px", borderRadius: 6, cursor: saving ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {saving ? "Saving..." : "✓ Save"}
                </button>
                <button onClick={() => { setIsEditing(false); setEditData({ name: agent.name, description: agent.description || "", tags: agent.tags || [], evalCriteria: agent.evalCriteria || [] }); }} style={{ background: "none", border: `1px solid ${C.border}`, color: C.textDim, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>
                  Cancel
                </button>
              </>
            )}
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, color: C.amber, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "inherit", fontWeight: 600 }}>
                Edit
              </button>
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 20, padding: "0 4px" }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {isEditing ? (
            <>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.border}` }}>
                <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 4 }}>DESCRIPTION</label>
                <textarea
                  value={editData.description}
                  onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                  style={{ width: "100%", minHeight: 60, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", background: C.card, color: C.text, fontFamily: "inherit", fontSize: 11, resize: "vertical" }}
                  placeholder="Agent description (optional)"
                />
              </div>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.border}` }}>
                <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 4 }}>TAGS (comma-separated)</label>
                <input
                  type="text"
                  value={editData.tags.join(", ")}
                  onChange={e => setEditData(d => ({ ...d, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) }))}
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", background: C.card, color: C.text, fontFamily: "inherit", fontSize: 11 }}
                  placeholder="e.g. production, v1"
                />
              </div>
              <div style={{ padding: "9px 14px" }}>
                <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 8 }}>EVAL CRITERIA</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["goal_completion", "no_hallucination", "schema_valid", "tool_accuracy", "instruction_fidelity", "latency_ok", "no_pii_leak", "safety_pass"].map(c => (
                    <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editData.evalCriteria.includes(c)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditData(d => ({ ...d, evalCriteria: [...d.evalCriteria, c] }));
                          } else {
                            setEditData(d => ({ ...d, evalCriteria: d.evalCriteria.filter(x => x !== c) }));
                          }
                        }}
                        style={{ width: 16, height: 16, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 11, color: C.text }}>{c.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {row("Description", agent.description || <span style={{ color: C.textDim }}>—</span>)}
          {row("Agent Type", <Tag label={agent.type.replace(/_/g, " ")} color={color} bg={`${color}18`} />)}
          {row("Connection", CONN_LABELS[agent.connType] ?? agent.connType)}
          {row("Endpoint", agent.endpoint
            ? <code style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.amber }}>{agent.endpoint}</code>
            : <span style={{ color: C.textDim }}>—</span>
          )}
          {row("Auth Type", agent.authType)}
          {row("Tags", agent.tags.length > 0
            ? <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{agent.tags.map(t => <Tag key={t} label={t} />)}</div>
            : <span style={{ color: C.textDim }}>—</span>
          )}
          {row("Eval Criteria", (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {agent.evalCriteria.map(c => <Tag key={c} label={c} color={C.green} bg={C.greenDim} />)}
            </div>
          ))}
          {row("Runs", `${agent._count?.runs ?? 0}`)}
          {row("Test Suites", `${agent._count?.suites ?? 0}`)}
          {row("Created", new Date(agent.createdAt).toLocaleString())}
          {agent.systemPrompt && row("System Prompt", (
            <pre style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.textSub, whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6 }}>
              {agent.systemPrompt}
            </pre>
          ))}
          {agent.outputSchema && row("Output Schema", (
            <pre style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.amber, whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6 }}>
              {JSON.stringify(agent.outputSchema, null, 2)}
            </pre>
          ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSub, padding: "7px 18px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AgentRegistry ────────────────────────────────────────────────────────────

export function AgentRegistry() {
  const navigate = useNavigate();
  const { agents, fetchAgents, deleteAgent, pingAgent } = useAgentStore();
  const { openWizard } = useUIStore();
  const [pingState, setPingState] = useState<Record<string, "pinging" | "ok" | "fail">>({});
  const [deleteState, setDeleteState] = useState<Record<string, boolean>>({});
  const [detailAgent, setDetailAgent] = useState<Agent | null>(null);

  useEffect(() => { fetchAgents(); }, []);

  const handlePing = async (id: string) => {
    setPingState(s => ({ ...s, [id]: "pinging" }));
    const healthy = await pingAgent(id);
    setPingState(s => ({ ...s, [id]: healthy ? "ok" : "fail" }));
    setTimeout(() => setPingState(s => { const n = { ...s }; delete n[id]; return n; }), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete agent "${name}"? This will also delete all associated test suites and runs.`)) return;

    setDeleteState(s => ({ ...s, [id]: true }));
    try {
      await deleteAgent(id);
      alert(`Agent "${name}" deleted successfully`);
    } catch (err) {
      alert(`Failed to delete agent: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeleteState(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="animate-fadeUp">
      {detailAgent && <AgentDetailPanel agent={detailAgent} onClose={() => setDetailAgent(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700 }}>Agent Registry</h1>
          <p style={{ fontSize: 11, color: C.textSub, marginTop: 3 }}>All connected agents and their configurations</p>
        </div>
        <button onClick={openWizard} style={{ background: C.amberDim, border: `1px solid ${C.amber}50`, color: C.amber, padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>
          + Onboard Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <EmptyState icon="◈" title="No agents yet" subtitle="Onboard your first agent to get started." action={{ label: "+ Onboard Agent", onClick: openWizard }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {agents.map(a => {
            const color = AGENT_TYPE_COLORS[a.type] ?? C.textSub;
            const ps = pingState[a.id];
            return (
              <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 16, flexShrink: 0 }}>◈</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: C.text, fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{a.name}</span>
                      <StatusDot status={a.status} />
                      <span style={{ fontSize: 9, color: STATUS_COLORS[a.status] ?? C.textDim }}>{a.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Tag label={a.type.replace(/_/g, " ")} color={color} bg={`${color}18`} />
                      <Tag label={CONN_LABELS[a.connType] ?? a.connType} />
                      {a.tags.map(t => <Tag key={t} label={t} />)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: C.textDim }}>{a._count?.runs ?? 0} runs</div>
                      <div style={{ fontSize: 9, color: C.textDim }}>{a._count?.suites ?? 0} suites</div>
                    </div>

                    {/* Ping button with live feedback */}
                    <button
                      onClick={() => handlePing(a.id)}
                      disabled={ps === "pinging"}
                      style={{
                        background: ps === "ok" ? C.greenDim : ps === "fail" ? C.redDim : "none",
                        border: `1px solid ${ps === "ok" ? C.green + "60" : ps === "fail" ? C.red + "60" : C.border}`,
                        color: ps === "ok" ? C.green : ps === "fail" ? C.red : C.textSub,
                        padding: "5px 10px", borderRadius: 6,
                        cursor: ps === "pinging" ? "not-allowed" : "pointer",
                        fontSize: 10, fontFamily: "inherit", minWidth: 52, transition: "all 0.3s",
                      }}>
                      {ps === "pinging" ? "…" : ps === "ok" ? "✓ OK" : ps === "fail" ? "✗ Fail" : "Ping"}
                    </button>

                    {/* View details */}
                    <button onClick={() => setDetailAgent(a)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.textSub, padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>
                      View
                    </button>

                    <button onClick={() => { navigate("/run"); }} style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, color: C.amber, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>
                      Test →
                    </button>

                    <button
                      onClick={() => handleDelete(a.id, a.name)}
                      disabled={deleteState[a.id]}
                      style={{
                        background: deleteState[a.id] ? C.muted : C.redDim,
                        border: `1px solid ${C.red}30`,
                        color: deleteState[a.id] ? C.textDim : C.red,
                        padding: "5px 10px",
                        borderRadius: 6,
                        cursor: deleteState[a.id] ? "not-allowed" : "pointer",
                        fontSize: 10,
                        fontFamily: "inherit",
                      }}
                    >
                      {deleteState[a.id] ? "…" : "Del"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
