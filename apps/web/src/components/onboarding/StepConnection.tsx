import { C } from "../../theme";
import { ConnType, AuthType } from "../../types";

const CONN_TYPES: { id: ConnType; label: string; icon: string; desc: string }[] = [
  { id: "REST", label: "REST API", icon: "🔌", desc: "HTTP endpoint — any agent with a POST/GET API" },
  { id: "CLAUDE_API", label: "Claude API", icon: "◈", desc: "Anthropic Claude models via API key" },
  { id: "OPENAI", label: "OpenAI API", icon: "⬡", desc: "GPT-4, GPT-4o, or custom fine-tunes" },
  { id: "LANGCHAIN", label: "LangChain", icon: "🔗", desc: "LangChain agent executor or chain" },
  { id: "WEBSOCKET", label: "WebSocket", icon: "⚡", desc: "Streaming agent over WebSocket connection" },
  { id: "MOCK", label: "Mock / Sandbox", icon: "🧪", desc: "Simulate an agent for test development" },
];

const AUTH_TYPES: AuthType[] = ["BEARER", "API_KEY", "BASIC", "NONE"];

const inp = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", outline: "none", width: "100%" };

interface Props {
  form: { connType: ConnType; endpoint: string; authType: AuthType; authToken: string };
  update: (k: string, v: string) => void;
}

export function StepConnection({ form, update }: Props) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em", marginBottom: 12 }}>SELECT CONNECTION TYPE</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {CONN_TYPES.map(ct => (
          <div key={ct.id} onClick={() => update("connType", ct.id)} style={{
            padding: "12px", borderRadius: 8, cursor: "pointer",
            border: `1px solid ${form.connType === ct.id ? C.amber : C.border}`,
            background: form.connType === ct.id ? C.amberDim : C.card, transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{ct.icon}</div>
            <div style={{ fontSize: 12, color: form.connType === ct.id ? C.amber : C.text, fontWeight: 600 }}>{ct.label}</div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 3, lineHeight: 1.4 }}>{ct.desc}</div>
          </div>
        ))}
      </div>

      {form.connType && form.connType !== "MOCK" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>ENDPOINT / BASE URL</label>
          <input value={form.endpoint} onChange={e => update("endpoint", e.target.value)}
            placeholder={form.connType === "WEBSOCKET" ? "wss://your-agent.com/ws" : "https://your-agent.com/api/run"}
            style={inp} />
          <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>AUTH TYPE</label>
          <div style={{ display: "flex", gap: 8 }}>
            {AUTH_TYPES.map(a => (
              <div key={a} onClick={() => update("authType", a)} style={{
                padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11,
                border: `1px solid ${form.authType === a ? C.amber : C.border}`,
                background: form.authType === a ? C.amberDim : C.card,
                color: form.authType === a ? C.amber : C.textSub,
              }}>{a.toLowerCase()}</div>
            ))}
          </div>
          {form.authType !== "NONE" && (
            <>
              <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>AUTH TOKEN / KEY</label>
              <input type="password" value={form.authToken} onChange={e => update("authToken", e.target.value)}
                placeholder="sk-..." style={inp} />
            </>
          )}
        </div>
      )}

      {form.connType === "MOCK" && (
        <div style={{ padding: "12px 14px", background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 8, fontSize: 12, color: C.green }}>
          ✓ Mock mode — BreakLoop will simulate agent responses via Claude. No endpoint needed.
        </div>
      )}
    </div>
  );
}
