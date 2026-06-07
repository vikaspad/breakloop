import { useState } from "react";
import { C } from "../../theme";
import { StatusDot } from "../shared/StatusDot";
import { MiniBar } from "../shared/MiniBar";
import { Tag } from "../shared/Tag";
import { useRunStore } from "../../store/runStore";

interface Step {
  step: string;
  status: "pass" | "warn" | "fail";
  msg: string;
  ms: string;
}

interface CaseResult {
  caseId: string;
  input?: string;
  agentOutput?: string;
  agentError?: string | null;
  status: string;
  score: number;
  scores?: Record<string, number>;
  failureTags?: string[];
  evalReason?: string;
  latencyMs?: number;
  steps?: Step[];
}

function CaseCard({ result, index }: { result: CaseResult; index: number }) {
  const [open, setOpen] = useState(false);
  const statusColor = result.status === "PASS" ? C.green : result.status === "WARN" ? C.amber : C.red;
  const scoreEntries = Object.entries(result.scores ?? {});

  return (
    <div style={{
      border: `1px solid ${statusColor}30`, borderLeft: `3px solid ${statusColor}`,
      borderRadius: "0 8px 8px 0", marginBottom: 8, background: C.surface, overflow: "hidden",
    }}>
      {/* ── Always-visible summary ── */}
      <div style={{ padding: "10px 14px" }}>

        {/* Header row: index · status · score · latency · toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: C.textDim, flexShrink: 0 }}>
            {index + 1}
          </div>
          <StatusDot status={result.status.toLowerCase()} />
          <span style={{ fontSize: 10, color: statusColor, fontWeight: 700, flexShrink: 0 }}>{result.status}</span>
          <span style={{ fontSize: 10, color: C.textDim, flexShrink: 0 }}>{result.score}/100</span>
          {result.latencyMs !== undefined && (
            <span style={{ fontSize: 10, color: C.textDim, flexShrink: 0 }}>{result.latencyMs}ms</span>
          )}
          {result.failureTags && result.failureTags.length > 0 && (
            <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
              {result.failureTags.map(t => <Tag key={t} label={t} color={C.red} bg={C.redDim} />)}
            </div>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            style={{ marginLeft: "auto", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.textDim, fontSize: 10, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
            {open ? "▲ less" : "▼ more"}
          </button>
        </div>

        {/* INPUT — always visible, truncated */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.07em", marginBottom: 4 }}>INPUT</div>
            <div style={{ fontSize: 11, color: C.textSub, background: C.card, padding: "7px 10px", borderRadius: 6, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {result.input ?? "—"}
            </div>
          </div>

          {/* AGENT RESPONSE — always visible, with scroll if needed */}
          <div>
            <div style={{ fontSize: 9, color: result.agentError ? C.red : C.blue, letterSpacing: "0.07em", marginBottom: 4 }}>
              AGENT RESPONSE
            </div>
            {result.agentError ? (
              <div style={{ fontSize: 11, color: C.red, background: C.redDim, border: `1px solid ${C.red}30`, padding: "7px 10px", borderRadius: 6, lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}>
                ⚠ {result.agentError}
              </div>
            ) : result.agentOutput ? (
              <div style={{ fontSize: 11, color: C.text, background: `${C.blue}0A`, border: `1px solid ${C.blue}25`, padding: "7px 10px", borderRadius: 6, lineHeight: 1.5, maxHeight: 120, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {result.agentOutput}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: C.textDim, background: C.surface, border: `1px solid ${C.border}`, padding: "7px 10px", borderRadius: 6 }}>
                No output
              </div>
            )}
          </div>
        </div>

        {/* EVALUATOR VERDICT — always visible */}
        {result.evalReason && (
          <div style={{ marginTop: 8, padding: "8px 10px", background: `${statusColor}08`, border: `1px solid ${statusColor}25`, borderRadius: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 9, color: statusColor, letterSpacing: "0.07em", flexShrink: 0, paddingTop: 1 }}>VERDICT</span>
            <span style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>{result.evalReason}</span>
          </div>
        )}
      </div>

      {/* ── Expanded details ── */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Full agent response / error */}
          {(result.agentOutput || result.agentError) && (
            <div>
              <div style={{ fontSize: 9, color: result.agentError ? C.red : C.blue, letterSpacing: "0.07em", marginBottom: 5 }}>
                FULL AGENT RESPONSE
              </div>
              {result.agentError ? (
                <div style={{ fontSize: 11, color: C.red, background: C.redDim, border: `1px solid ${C.red}30`, padding: "10px 12px", borderRadius: 7, lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Connection / Adapter Error</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>{result.agentError}</div>
                  <div style={{ marginTop: 8, fontSize: 10, color: `${C.red}CC` }}>
                    Make sure the agent endpoint is reachable and the sample agent is running (node sample-agent/agent.js).
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: C.text, background: `${C.blue}0A`, border: `1px solid ${C.blue}20`, padding: "10px 12px", borderRadius: 7, lineHeight: 1.7, maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                  {result.agentOutput}
                </div>
              )}
            </div>
          )}

          {/* Score breakdown */}
          {scoreEntries.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.07em", marginBottom: 8 }}>SCORE BREAKDOWN</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                {scoreEntries.map(([criterion, val]) => {
                  const sc = val as number;
                  const bc = sc >= 75 ? C.green : sc >= 50 ? C.amber : C.red;
                  return (
                    <div key={criterion}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: C.textSub }}>{criterion.replace(/_/g, " ")}</span>
                        <span style={{ fontSize: 10, color: bc, fontWeight: 600 }}>{sc}</span>
                      </div>
                      <MiniBar value={sc} color={bc} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Execution steps */}
          {result.steps && result.steps.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.07em", marginBottom: 6 }}>EXECUTION STEPS</div>
              {result.steps.map((s, i) => {
                const sc = s.status === "pass" ? C.green : s.status === "warn" ? C.amber : C.red;
                return (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 10, padding: "5px 0", borderBottom: `1px solid ${C.border}`, alignItems: "baseline" }}>
                    <StatusDot status={s.status} />
                    <span style={{ color: C.textDim, width: 130, flexShrink: 0 }}>{s.step}</span>
                    <span style={{ color: C.textSub, flex: 1 }}>{s.msg}</span>
                    <span style={{ color: sc, flexShrink: 0 }}>{s.ms}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TraceConsole() {
  const { traceEvents, isRunning } = useRunStore();

  const runStarted = traceEvents.some(e => e.type === "RUN_STARTED");
  const runComplete = traceEvents.find(e => e.type === "RUN_COMPLETE");
  const runError = traceEvents.find(e => e.type === "RUN_ERROR");
  const runCancelled = traceEvents.find(e => e.type === "RUN_CANCELLED");

  const caseResults: CaseResult[] = traceEvents
    .filter(e => e.type === "CASE_COMPLETE")
    .map(e => e.data as CaseResult);

  const isEmpty = !isRunning && !runComplete && !runError && !runCancelled && traceEvents.length === 0;
  const isConnecting = isRunning && !runStarted && caseResults.length === 0;
  const isWaitingForCase = isRunning && runStarted && caseResults.length === 0;

  const summary = runComplete?.data as {
    overallScore?: number;
    summary?: { pass: number; warn: number; fail: number };
  } | undefined;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", minHeight: 160 }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 12 }}>EXECUTION TRACE</div>

      {isEmpty && (
        <div style={{ color: C.textDim, fontSize: 12, textAlign: "center", padding: "24px 0" }}>
          Select an agent + suite above, then press RUN NOW
        </div>
      )}

      {isConnecting && (
        <div style={{ color: C.amber, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="animate-blink">█</span> Connecting to agent…
        </div>
      )}

      {isWaitingForCase && (
        <div style={{ color: C.blue, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="animate-blink">█</span> Run started — executing test cases…
        </div>
      )}

      {/* Live progress while running */}
      {isRunning && caseResults.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.08em", marginBottom: 6 }}>IN PROGRESS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {caseResults.map((r, i) => {
              const c = r.status === "PASS" ? C.green : r.status === "WARN" ? C.amber : C.red;
              return (
                <div key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
                  {i + 1}: {r.status} · {r.score}
                </div>
              );
            })}
            <div style={{ fontSize: 10, color: C.amber, display: "flex", alignItems: "center", gap: 4 }}>
              <span className="animate-blink">█</span>
            </div>
          </div>
        </div>
      )}

      {/* Full case report */}
      {caseResults.length > 0 && (
        <div>
          {!isRunning && (
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.08em", marginBottom: 8 }}>
              CASE RESULTS — input · response · verdict always shown · click ▼ for scores & steps
            </div>
          )}
          {caseResults.map((r, i) => <CaseCard key={r.caseId} result={r} index={i} />)}
        </div>
      )}

      {/* Terminal banners */}
      {runComplete && summary && (
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: C.greenDim, border: `1px solid ${C.green}30`, fontSize: 12, color: C.green }}>
          ✓ RUN COMPLETE — Pass: {summary.summary?.pass ?? 0} · Warn: {summary.summary?.warn ?? 0} · Fail: {summary.summary?.fail ?? 0} · Overall: {summary.overallScore ?? 0}/100
        </div>
      )}

      {runCancelled && (
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: `${C.amber}12`, border: `1px solid ${C.amber}30`, fontSize: 12, color: C.amber }}>
          ■ RUN CANCELLED — {caseResults.length} case{caseResults.length !== 1 ? "s" : ""} completed before stop
        </div>
      )}

      {runError && !runCancelled && (
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: C.redDim, border: `1px solid ${C.red}30`, fontSize: 12, color: C.red }}>
          ⚠ RUN ERROR — {(runError.data as { message?: string }).message ?? "Unknown error"}
        </div>
      )}
    </div>
  );
}
