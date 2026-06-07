import { useState, useEffect } from "react";
import { C, AGENT_TYPE_COLORS, STATUS_COLORS } from "../theme";
import { Tag } from "../components/shared/Tag";
import { StatusDot } from "../components/shared/StatusDot";
import { EmptyState } from "../components/shared/EmptyState";
import { api } from "../api/client";
import { exportRunToExcel } from "../utils/excelExport";
import type { Run, CaseResult } from "../types";

interface RunWithDetails extends Run {
  caseResults?: CaseResult[];
  agent?: { id: string; name: string; type: string };
  suite?: { id: string; name: string };
}

export function History() {
  const [runs, setRuns] = useState<RunWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.runs.list();
      const runsWithDetails = await Promise.all(
        res.data.map(async (run) => {
          try {
            const detail = await api.runs.get(run.id);
            return detail.data as RunWithDetails;
          } catch {
            return run as RunWithDetails;
          }
        })
      );
      setRuns(runsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRuns = runs.filter(r => {
    if (filterAgent !== "all" && r.agentId !== filterAgent) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const agents = [...new Set(runs.map(r => r.agentId))].map(id => runs.find(r => r.agentId === id));

  if (loading) {
    return (
      <div className="animate-fadeUp">
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Test History</h1>
        <div style={{ fontSize: 12, color: C.textDim, padding: "48px 0", textAlign: "center" }}>Loading history…</div>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="animate-fadeUp">
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Test History</h1>
        <p style={{ fontSize: 11, color: C.textSub, marginBottom: 24 }}>Complete audit of all test runs with failure details and snapshots</p>
        <EmptyState icon="📋" title="No test runs yet"
          subtitle="Run a test suite to see historical data here." />
      </div>
    );
  }

  return (
    <div className="animate-fadeUp">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Test History</h1>
          <p style={{ fontSize: 11, color: C.textSub }}>
            {runs.length} total run{runs.length !== 1 ? "s" : ""} · {runs.filter(r => r.status === "COMPLETE").length} completed
          </p>
        </div>
        <button
          onClick={loadHistory}
          style={{
            background: C.amberDim,
            border: `1px solid ${C.amber}40`,
            color: C.amber,
            padding: "8px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "inherit",
            fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          style={{
            padding: "8px 12px",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            background: C.surface,
            color: C.text,
            fontFamily: "inherit",
            fontSize: 11,
          }}
        >
          <option value="all">All Agents</option>
          {agents.map(a => a && (
            <option key={a.agentId} value={a.agentId}>
              {a.agent?.name || a.agentId}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            background: C.surface,
            color: C.text,
            fontFamily: "inherit",
            fontSize: 11,
          }}
        >
          <option value="all">All Statuses</option>
          <option value="COMPLETE">Complete</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
          <option value="RUNNING">Running</option>
        </select>
      </div>

      {/* History Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {filteredRuns.map(run => {
          const isExpanded = expandedRunId === run.id;
          const failedCases = run.caseResults?.filter(r => r.status === "FAIL").length ?? 0;
          const warnedCases = run.caseResults?.filter(r => r.status === "WARN").length ?? 0;
          const passedCases = run.caseResults?.filter(r => r.status === "PASS").length ?? 0;
          const color = AGENT_TYPE_COLORS[run.agent?.type as any] ?? C.textSub;

          return (
            <div key={run.id} style={{ borderBottom: `1px solid ${C.border}` }}>
              {/* Row Header */}
              <div
                onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                style={{
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: isExpanded ? `${C.border}20` : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 12, color: C.textDim, minWidth: 20 }}>{isExpanded ? "▼" : "▶"}</span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color, fontWeight: 600 }}>{run.agent?.name}</span>
                    <span style={{ fontSize: 10, color: C.textDim }}>→</span>
                    <span style={{ fontSize: 12, color: C.text }}>{run.suite?.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <StatusDot status={run.status.toLowerCase()} />
                    <span style={{ fontSize: 10, color: C.textSub }}>
                      {new Date(run.createdAt).toLocaleString()}
                    </span>
                    {run.overallScore !== undefined && (
                      <>
                        <span style={{ fontSize: 10, color: C.textDim }}>•</span>
                        <span style={{ fontSize: 10, color: C.text, fontWeight: 600 }}>Score: {run.overallScore}/100</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: C.green }}>✓ {passedCases}</div>
                    <div style={{ fontSize: 10, color: C.amber }}>⚠ {warnedCases}</div>
                    <div style={{ fontSize: 10, color: C.red }}>✗ {failedCases}</div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 18px", background: C.surface }}>
                  {/* Summary */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.08em", marginBottom: 8 }}>SUMMARY</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                      <div style={{ padding: "8px 10px", background: C.card, borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: C.textDim }}>Overall Score</div>
                        <div style={{ fontSize: 14, color: C.text, fontWeight: 700, marginTop: 4 }}>{run.overallScore ?? 0}/100</div>
                      </div>
                      <div style={{ padding: "8px 10px", background: C.card, borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: C.green }}>Passed</div>
                        <div style={{ fontSize: 14, color: C.green, fontWeight: 700, marginTop: 4 }}>{passedCases}</div>
                      </div>
                      <div style={{ padding: "8px 10px", background: C.card, borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: C.amber }}>Warned</div>
                        <div style={{ fontSize: 14, color: C.amber, fontWeight: 700, marginTop: 4 }}>{warnedCases}</div>
                      </div>
                      <div style={{ padding: "8px 10px", background: C.card, borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: C.red }}>Failed</div>
                        <div style={{ fontSize: 14, color: C.red, fontWeight: 700, marginTop: 4 }}>{failedCases}</div>
                      </div>
                    </div>
                  </div>

                  {/* Case Results */}
                  {run.caseResults && run.caseResults.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.08em", marginBottom: 8 }}>TEST CASES ({run.caseResults.length})</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {run.caseResults.map((result, idx) => (
                          <div key={result.id} style={{
                            padding: "10px 12px",
                            background: C.card,
                            borderRadius: 6,
                            borderLeft: `3px solid ${result.status === "PASS" ? C.green : result.status === "WARN" ? C.amber : C.red}`,
                            fontSize: 11,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, color: C.text }}>Case {idx + 1}</span>
                              <span style={{ color: result.status === "PASS" ? C.green : result.status === "WARN" ? C.amber : C.red, fontWeight: 600 }}>
                                {result.status} ({result.scores && Object.values(result.scores)[0] ? Math.round(Object.values(result.scores)[0] as number) : result.status === "PASS" ? 100 : 0}/100)
                              </span>
                            </div>
                            <div style={{ color: C.textSub, marginBottom: 4 }}>{result.case?.input || "No input recorded"}</div>
                            {result.evalReason && (
                              <div style={{ fontSize: 10, color: C.textDim, marginBottom: 4, fontStyle: "italic" }}>
                                Reason: {result.evalReason}
                              </div>
                            )}
                            {result.failureTags && result.failureTags.length > 0 && (
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {result.failureTags.map(tag => (
                                  <Tag key={tag} label={tag} color={C.red} bg={C.redDim} />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Snapshot Button */}
                  <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        exportRunToExcel({
                          run,
                          selectedAgent: run.agent,
                          selectedSuite: run.suite,
                        });
                      }}
                      style={{
                        background: C.greenDim,
                        border: `1px solid ${C.green}40`,
                        color: C.green,
                        padding: "6px 14px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 10,
                        fontFamily: "inherit",
                        fontWeight: 600,
                      }}
                    >
                      📊 Export to Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
