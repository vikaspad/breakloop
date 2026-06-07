import { CSSProperties } from "react";
import { C } from "../../theme";

const PRESETS = ['{"response":string}', '{"answer":string,"sources":[]}', '{"action":string,"params":{}}'];

interface Props {
  form: { inputSchema: string; outputSchema: string; systemPrompt: string };
  update: (k: string, v: string) => void;
}

const ta: CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.amber, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", outline: "none", resize: "none", width: "100%" };

export function StepSchema({ form, update }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>
        Define the expected I/O contract. BreakLoop uses this to auto-validate agent responses.
      </div>

      <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>OUTPUT SCHEMA (JSON)</label>
      <textarea rows={5} value={form.outputSchema} onChange={e => update("outputSchema", e.target.value)} style={ta} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PRESETS.map(t => (
          <div key={t} onClick={() => update("outputSchema", t)} style={{ padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10, background: C.card, border: `1px solid ${C.border}`, color: C.textSub, fontFamily: "'JetBrains Mono',monospace" }}>
            {t}
          </div>
        ))}
      </div>

      <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.08em" }}>SYSTEM PROMPT (optional)</label>
      <textarea rows={4} value={form.systemPrompt} onChange={e => update("systemPrompt", e.target.value)}
        placeholder="You are a helpful assistant..." style={{ ...ta, color: C.text }} />
    </div>
  );
}
