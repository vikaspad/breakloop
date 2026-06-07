import { C } from "../../theme";
import { AgentType } from "../../types";

const AGENT_TYPES: AgentType[] = ["CONVERSATIONAL", "TOOL_USING", "AUTONOMOUS", "MULTI_AGENT", "RAG_PIPELINE", "CUSTOM"];
const LABELS: Record<AgentType, string> = {
  CONVERSATIONAL: "Conversational", TOOL_USING: "Tool-Using", AUTONOMOUS: "Autonomous",
  MULTI_AGENT: "Multi-Agent", RAG_PIPELINE: "RAG Pipeline", CUSTOM: "Custom",
};

const inp = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" };

interface Props {
  form: { name: string; type: AgentType; description: string; tags: string };
  update: (k: string, v: string) => void;
}

export function StepIdentity({ form, update }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>AGENT NAME *</label>
      <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. CustomerSupportBot, ETLAgent..." style={inp} />

      <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>AGENT TYPE</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {AGENT_TYPES.map(t => (
          <div key={t} onClick={() => update("type", t)} style={{
            padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, textAlign: "center",
            border: `1px solid ${form.type === t ? C.amber : C.border}`,
            background: form.type === t ? C.amberDim : C.card,
            color: form.type === t ? C.amber : C.textSub, transition: "all 0.2s",
          }}>{LABELS[t]}</div>
        ))}
      </div>

      <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>DESCRIPTION (optional)</label>
      <input value={form.description} onChange={e => update("description", e.target.value)} placeholder="What does this agent do?" style={inp} />

      <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>TAGS (comma-separated)</label>
      <input value={form.tags} onChange={e => update("tags", e.target.value)} placeholder="e.g. nlp, rag, production" style={inp} />
    </div>
  );
}
