import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C, AGENT_TYPE_COLORS } from "../theme";
import { Tag } from "../components/shared/Tag";
import { EmptyState } from "../components/shared/EmptyState";
import { useAgentStore } from "../store/agentStore";
import { api } from "../api/client";
import type { TestSuite, TestCase, Agent } from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 12,
  fontFamily: "inherit", outline: "none", ...extra,
});

// ─── AddCaseForm ────────────────────────────────────────────────────────────

interface AddCaseFormProps {
  suiteId: string;
  onAdded: (tc: TestCase) => void;
  onCancel: () => void;
}

function AddCaseForm({ suiteId, onAdded, onCancel }: AddCaseFormProps) {
  const [input, setInput] = useState("");
  const [expected, setExpected] = useState("");
  const [criteria, setCriteria] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!input.trim()) { setError("Input is required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await api.cases.create(suiteId, {
        input: input.trim(),
        expectedOutput: expected.trim() || undefined,
        passCriteria: criteria.trim() || undefined,
        behaviorTags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      onAdded(res.data);
      setInput(""); setExpected(""); setCriteria(""); setTags("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add test case");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.amber}30`, borderRadius: 8, padding: "14px 16px", marginTop: 8 }}>
      <div style={{ fontSize: 10, color: C.amber, letterSpacing: "0.08em", marginBottom: 10 }}>NEW TEST CASE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: C.textSub, marginBottom: 4 }}>INPUT PROMPT *</div>
          <textarea rows={2} value={input} onChange={e => setInput(e.target.value)}
            placeholder="e.g. I need a refund for my order"
            style={{ ...inp(), resize: "vertical" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textSub, marginBottom: 4 }}>EXPECTED OUTPUT (optional)</div>
            <input value={expected} onChange={e => setExpected(e.target.value)}
              placeholder="e.g. A refund acknowledgement" style={inp()} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.textSub, marginBottom: 4 }}>PASS CRITERIA (optional)</div>
            <input value={criteria} onChange={e => setCriteria(e.target.value)}
              placeholder="e.g. Must mention 3-5 business days" style={inp()} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.textSub, marginBottom: 4 }}>BEHAVIOR TAGS (comma-separated)</div>
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="e.g. tone, safety, schema" style={inp()} />
        </div>
        {error && <div style={{ fontSize: 11, color: C.red }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={onCancel} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSub, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} style={{ background: saving ? C.muted : C.amberDim, border: `1px solid ${C.amber}50`, borderRadius: 6, color: saving ? C.textDim : C.amber, padding: "6px 16px", cursor: saving ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>
            {saving ? "Saving..." : "+ Add Case"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SuiteCard ───────────────────────────────────────────────────────────────

interface SuiteCardProps {
  suite: TestSuite;
  agentName?: string;
  agentColor: string;
  onDelete: (id: string) => void;
  onRunClick: (suite: TestSuite) => void;
}

function SuiteCard({ suite, agentName, agentColor, onDelete, onRunClick }: SuiteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [cases, setCases] = useState<TestCase[]>([]);
  const [casesLoaded, setCasesLoaded] = useState(false);
  const [addingCase, setAddingCase] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(suite.name);
  const [savingName, setSavingName] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [editingCaseData, setEditingCaseData] = useState<Partial<TestCase>>({});
  const [savingCaseId, setSavingCaseId] = useState<string | null>(null);

  const loadCases = async () => {
    if (casesLoaded) return;
    try {
      const res = await api.cases.list(suite.id);
      setCases(res.data);
      setCasesLoaded(true);
    } catch { /* noop */ }
  };

  const toggle = () => {
    if (!expanded) loadCases();
    setExpanded(e => !e);
    setAddingCase(false);
  };

  const handleCaseAdded = (tc: TestCase) => {
    setCases(cs => [...cs, tc]);
    setAddingCase(false);
  };

  const deleteCase = async (id: string) => {
    setDeletingId(id);
    try {
      await api.cases.delete(id);
      setCases(cs => cs.filter(c => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const startEditCase = (tc: TestCase) => {
    setEditingCaseId(tc.id);
    setEditingCaseData({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      passCriteria: tc.passCriteria,
      behaviorTags: tc.behaviorTags,
    });
  };

  const saveCase = async (id: string) => {
    setSavingCaseId(id);
    try {
      await api.cases.update(id, {
        input: editingCaseData.input,
        expectedOutput: editingCaseData.expectedOutput,
        passCriteria: editingCaseData.passCriteria,
        behaviorTags: editingCaseData.behaviorTags,
      });
      setCases(cs => cs.map(c => c.id === id ? { ...c, ...editingCaseData } : c));
      setEditingCaseId(null);
    } finally {
      setSavingCaseId(null);
    }
  };

  const saveName = async () => {
    if (!editName.trim() || editName === suite.name) { setEditing(false); return; }
    setSavingName(true);
    try {
      await api.suites.update(suite.id, { name: editName.trim() });
      suite.name = editName.trim();
    } finally {
      setSavingName(false);
      setEditing(false);
    }
  };

  const caseCount = casesLoaded ? cases.length : (suite._count?.cases ?? 0);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: C.blueDim, border: `1px solid ${C.blue}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.blue, flexShrink: 0 }}>⬡</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false); }}
                autoFocus style={{ ...inp({ padding: "4px 8px", fontSize: 13, width: "auto", flex: 1 }) }} />
              <button onClick={saveName} disabled={savingName} style={{ background: savingName ? C.muted : C.amber, border: `1px solid ${C.amber}40`, borderRadius: 6, color: savingName ? C.textDim : "#ffffff", padding: "6px 12px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}>
                {savingName ? "Saving..." : "✓ Save"}
              </button>
              <button onClick={() => setEditing(false)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSub, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>✕</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: C.text, fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{suite.name}</span>
              <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 11, padding: "0 4px" }} title="Rename">✎</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {suite.tags.map(t => <Tag key={t} label={t} color={C.blue} bg={C.blueDim} />)}
            <Tag label={`${caseCount} cases`} />
            {agentName && <Tag label={agentName} color={agentColor} bg={`${agentColor}15`} />}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button onClick={toggle} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSub, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            {expanded ? "▲ Hide" : "▼ Cases"}
          </button>
          <button onClick={() => onRunClick(suite)} style={{ background: C.blueDim, border: `1px solid ${C.blue}40`, color: C.blue, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            Run →
          </button>
          <button onClick={() => { if (confirm(`Delete suite "${suite.name}" and all its test cases?`)) onDelete(suite.id); }}
            style={{ background: C.redDim, border: `1px solid ${C.red}30`, color: C.red, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            Del
          </button>
        </div>
      </div>

      {/* Expanded: cases list + add form */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 18px" }}>
          {cases.length === 0 && !addingCase && (
            <div style={{ fontSize: 11, color: C.textDim, textAlign: "center", padding: "12px 0" }}>
              No test cases yet. Click "+ Add Test Case" to get started.
            </div>
          )}

          {cases.map((tc, i) => {
            const isEditing = editingCaseId === tc.id;
            return (
              <div key={tc.id} style={{ display: "flex", gap: 10, padding: "9px 12px", borderRadius: 7, background: C.surface, marginBottom: 6, alignItems: isEditing ? "stretch" : "flex-start", flexDirection: isEditing ? "column" : "row" }}>
                {!isEditing && <div style={{ width: 20, height: 20, borderRadius: 4, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: C.textDim, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>}

                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 4 }}>INPUT *</label>
                      <textarea rows={2} value={editingCaseData.input || ""} onChange={e => setEditingCaseData(d => ({ ...d, input: e.target.value }))}
                        style={{ ...inp(), resize: "vertical" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 4 }}>EXPECTED OUTPUT</label>
                        <input value={editingCaseData.expectedOutput || ""} onChange={e => setEditingCaseData(d => ({ ...d, expectedOutput: e.target.value }))} style={inp()} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 4 }}>PASS CRITERIA</label>
                        <input value={editingCaseData.passCriteria || ""} onChange={e => setEditingCaseData(d => ({ ...d, passCriteria: e.target.value }))} style={inp()} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 4 }}>BEHAVIOR TAGS (comma-separated)</label>
                      <input value={(editingCaseData.behaviorTags || []).join(", ")} onChange={e => setEditingCaseData(d => ({ ...d, behaviorTags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} style={inp()} />
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => setEditingCaseId(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSub, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
                        Cancel
                      </button>
                      <button onClick={() => saveCase(tc.id)} disabled={savingCaseId === tc.id} style={{ background: savingCaseId === tc.id ? C.muted : C.green, border: `1px solid ${C.green}40`, borderRadius: 6, color: savingCaseId === tc.id ? C.textDim : "#ffffff", padding: "8px 16px", cursor: savingCaseId === tc.id ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {savingCaseId === tc.id ? "Saving..." : "✓ Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: C.text, marginBottom: tc.expectedOutput || tc.passCriteria ? 4 : 0, wordBreak: "break-word" }}>{tc.input}</div>
                      {tc.expectedOutput && (
                        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2 }}>
                          <span style={{ color: C.amber }}>Expected:</span> {tc.expectedOutput}
                        </div>
                      )}
                      {tc.passCriteria && (
                        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2 }}>
                          <span style={{ color: C.green }}>Criteria:</span> {tc.passCriteria}
                        </div>
                      )}
                      {tc.behaviorTags.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                          {tc.behaviorTags.map(t => <Tag key={t} label={t} />)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => startEditCase(tc)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14, padding: "2px 4px" }} title="Edit test case">✎</button>
                      <button onClick={() => deleteCase(tc.id)} disabled={deletingId === tc.id}
                        style={{ background: "none", border: "none", color: C.textDim, cursor: deletingId === tc.id ? "not-allowed" : "pointer", fontSize: 14, padding: "2px 4px", flexShrink: 0 }}
                        title="Delete test case">✕</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {addingCase
            ? <AddCaseForm suiteId={suite.id} onAdded={handleCaseAdded} onCancel={() => setAddingCase(false)} />
            : (
              <button onClick={() => setAddingCase(true)}
                style={{ marginTop: cases.length > 0 ? 6 : 0, width: "100%", padding: "8px", borderRadius: 7, border: `1px dashed ${C.border}`, background: "none", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.color = C.amber; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}>
                + Add Test Case
              </button>
            )
          }
        </div>
      )}
    </div>
  );
}

// ─── TestSuites page ─────────────────────────────────────────────────────────

export function TestSuites() {
  const navigate = useNavigate();
  const { agents, fetchAgents } = useAgentStore();
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAgent, setNewAgent] = useState("");

  useEffect(() => {
    fetchAgents();
    loadSuites();
  }, []);

  const loadSuites = async () => {
    setLoading(true);
    try {
      const res = await api.suites.list();
      setSuites(res.data);
    } finally { setLoading(false); }
  };

  const createSuite = async () => {
    if (!newName.trim() || !newAgent) return;
    const res = await api.suites.create(newName.trim(), newAgent);
    setSuites(s => [res.data, ...s]);
    setNewName(""); setNewAgent(""); setCreating(false);
  };

  const deleteSuite = async (id: string) => {
    try {
      await api.suites.delete(id);
      setSuites(s => s.filter(suite => suite.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete suite");
    }
  };

  return (
    <div className="animate-fadeUp">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700 }}>Test Suites</h1>
          <p style={{ fontSize: 11, color: C.textSub, marginTop: 3 }}>Manage test case collections — expand a suite to add, view, or delete cases</p>
        </div>
        <button onClick={() => setCreating(c => !c)}
          style={{ background: C.blueDim, border: `1px solid ${C.blue}50`, color: C.blue, padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>
          + New Suite
        </button>
      </div>

      {creating && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.textSub, letterSpacing: "0.08em", marginBottom: 10 }}>CREATE NEW SUITE</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createSuite()}
              placeholder="Suite name..."
              style={{ flex: 1, minWidth: 180, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
            <select value={newAgent} onChange={e => setNewAgent(e.target.value)}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: newAgent ? C.text : C.textDim, fontSize: 12, fontFamily: "inherit", outline: "none" }}>
              <option value="">Select agent...</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button onClick={createSuite} disabled={!newName.trim() || !newAgent}
              style={{ background: !newName.trim() || !newAgent ? C.muted : C.amberDim, border: `1px solid ${C.amber}50`, color: !newName.trim() || !newAgent ? C.textDim : C.amber, padding: "8px 16px", borderRadius: 8, cursor: !newName.trim() || !newAgent ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "inherit" }}>
              Create
            </button>
            <button onClick={() => setCreating(false)}
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, padding: "8px 14px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <div style={{ fontSize: 12, color: C.textDim, padding: "24px 0", textAlign: "center" }}>Loading...</div>}

      {!loading && suites.length === 0 && (
        <EmptyState icon="⬡" title="No test suites yet"
          subtitle="Create a suite then expand it to add test cases."
          action={{ label: "+ New Suite", onClick: () => setCreating(true) }} />
      )}

      {suites.map(s => {
        const ag = agents.find((a: Agent) => a.id === s.agentId);
        const agColor = ag ? (AGENT_TYPE_COLORS[ag.type] ?? C.textSub) : C.textSub;
        return (
          <SuiteCard
            key={s.id}
            suite={s}
            agentName={ag?.name}
            agentColor={agColor}
            onDelete={deleteSuite}
            onRunClick={(suite) => { navigate("/run"); }}
          />
        );
      })}
    </div>
  );
}
