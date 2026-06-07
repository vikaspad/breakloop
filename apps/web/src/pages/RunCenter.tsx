import { useState, useEffect } from "react";
import { C, AGENT_TYPE_COLORS } from "../theme";
import { Tag } from "../components/shared/Tag";
import { AgentSelector } from "../components/run/AgentSelector";
import { SuiteSelector } from "../components/run/SuiteSelector";
import { TraceConsole } from "../components/run/TraceConsole";
import { useAgentStore } from "../store/agentStore";
import { useRunStore } from "../store/runStore";
import { useRunSocket } from "../hooks/useRunSocket";
import { api } from "../api/client";
import { exportRunToExcel } from "../utils/excelExport";
import type { TestSuite, Run } from "../types";

const CONN_LABELS: Record<string, string> = {
  REST: "REST API", CLAUDE_API: "Claude API", OPENAI: "OpenAI",
  LANGCHAIN: "LangChain", WEBSOCKET: "WebSocket", MOCK: "Mock",
};

export function RunCenter() {
  const { agents, fetchAgents, selectedAgent, setSelectedAgent } = useAgentStore();
  const { isRunning, activeRunId, triggerRun, cancelRun, clearTrace, traceEvents } = useRunStore();
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [currentRunData, setCurrentRunData] = useState<Run | null>(null);

  useRunSocket(activeRunId);

  useEffect(() => {
    // Load current run details if activeRunId exists
    if (activeRunId) {
      api.runs.get(activeRunId)
        .then(r => setCurrentRunData(r.data as Run))
        .catch(() => {});
    }
  }, [activeRunId]);

  useEffect(() => {
    fetchAgents();
    api.suites.list().then(r => setSuites(r.data)).catch(() => {});
  }, []);

  const handleRun = async () => {
    if (!selectedAgent || !selectedSuite) return;
    clearTrace();
    const runId = await triggerRun(selectedAgent.id, selectedSuite.id);
    // activeRunId is set in store; useRunSocket picks it up via the state change
    void runId;
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelRun();
    } finally {
      setCancelling(false);
    }
  };

  const canRun = !isRunning && !!selectedAgent && !!selectedSuite;
  const agentColor = selectedAgent ? (AGENT_TYPE_COLORS[selectedAgent.type] ?? C.textSub) : C.textSub;

  return (
    <div className="animate-fadeUp">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700 }}>Run Center</h1>
          <p style={{ fontSize: 11, color: C.textSub, marginTop: 3 }}>Select any agent + test suite and execute</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {/* Stop button — only visible while a run is active */}
          {isRunning && (
            <button onClick={handleCancel} disabled={cancelling}
              style={{
                background: C.redDim, border: `1px solid ${C.red}60`,
                color: cancelling ? C.textDim : C.red,
                padding: "10px 18px", borderRadius: 8,
                cursor: cancelling ? "not-allowed" : "pointer",
                fontSize: 12, fontFamily: "inherit", fontWeight: 700,
                letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6,
              }}>
              <span style={{ fontSize: 10 }}>■</span>
              {cancelling ? "Stopping…" : "Stop Run"}
            </button>
          )}

          {/* Run button */}
          <button onClick={handleRun} disabled={!canRun}
            style={{
              background: canRun ? C.amberDim : C.muted,
              border: `1px solid ${canRun ? C.amber : C.border}`,
              color: canRun ? C.amber : C.textDim,
              padding: "10px 22px", borderRadius: 8,
              cursor: canRun ? "pointer" : "not-allowed",
              fontSize: 12, fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.08em",
            }}>
            {isRunning ? "⟳ RUNNING…" : "▶ RUN NOW"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <AgentSelector agents={agents} selected={selectedAgent} onSelect={setSelectedAgent} />
        <SuiteSelector suites={suites} selected={selectedSuite} onSelect={setSelectedSuite} />
      </div>

      {selectedAgent && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em" }}>RUNNING AGAINST</div>
          <Tag label={selectedAgent.name} color={agentColor} bg={`${agentColor}18`} />
          <Tag label={CONN_LABELS[selectedAgent.connType] ?? selectedAgent.connType} />
          {selectedSuite && <Tag label={selectedSuite.name} color={C.blue} bg={C.blueDim} />}
          <div style={{ marginLeft: "auto", fontSize: 10, color: C.textDim }}>claude-sonnet evaluator</div>
        </div>
      )}

      <TraceConsole />

      {/* Snapshot Button — visible when run is complete */}
      {currentRunData && currentRunData.status === "COMPLETE" && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              exportRunToExcel({
                run: currentRunData,
                selectedAgent,
                selectedSuite,
              });
            }}
            style={{
              background: C.greenDim,
              border: `1px solid ${C.green}40`,
              color: C.green,
              padding: "10px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            📊 Export to Excel
          </button>
        </div>
      )}
    </div>
  );
}
