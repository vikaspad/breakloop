import { C } from "../../theme";
import { ConnType } from "../../types";

const CONN_LABELS: Record<ConnType, string> = {
  REST: "REST API", CLAUDE_API: "Claude API", OPENAI: "OpenAI API",
  LANGCHAIN: "LangChain", WEBSOCKET: "WebSocket", MOCK: "Mock / Sandbox",
};

interface FormData {
  name: string;
  type: string;
  connType: ConnType;
  endpoint: string;
  authType: string;
  evalCriteria: string[];
  description: string;
}

interface Props { form: FormData }

export function StepReview({ form }: Props) {
  const rows: [string, string][] = [
    ["Agent Name", form.name || "(unnamed)"],
    ["Type", form.type],
    ["Connection", CONN_LABELS[form.connType] ?? form.connType],
    ["Endpoint", form.endpoint || (form.connType === "MOCK" ? "Mock Sandbox" : "—")],
    ["Auth", form.authType],
    ["Eval Criteria", form.evalCriteria.join(", ") || "None selected"],
    ["Description", form.description || "—"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em", marginBottom: 4 }}>REVIEW CONFIGURATION</div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: C.card, borderRadius: 6, gap: 12 }}>
          <span style={{ fontSize: 11, color: C.textSub, flexShrink: 0 }}>{k}</span>
          <span style={{ fontSize: 11, color: C.text, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
        </div>
      ))}
      <div style={{ padding: "10px 12px", background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 8, fontSize: 12, color: C.green, marginTop: 4 }}>
        ✓ Agent is ready to onboard. BreakLoop will run a connection test on save.
      </div>
    </div>
  );
}
