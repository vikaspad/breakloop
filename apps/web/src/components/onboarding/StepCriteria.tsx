import { C } from "../../theme";

const OPTIONS = ["goal_completion", "no_hallucination", "schema_valid", "tool_accuracy", "instruction_fidelity", "latency_ok", "no_pii_leak", "safety_pass"];

interface Props {
  criteria: string[];
  toggle: (c: string) => void;
}

export function StepCriteria({ criteria, toggle }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>
        Choose which dimensions BreakLoop should automatically score for this agent.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {OPTIONS.map(c => {
          const on = criteria.includes(c);
          return (
            <div key={c} onClick={() => toggle(c)} style={{
              padding: "10px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              border: `1px solid ${on ? C.amber : C.border}`,
              background: on ? C.amberDim : C.card, transition: "all 0.2s",
            }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${on ? C.amber : C.textDim}`, background: on ? C.amber : "none", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {on && <span style={{ fontSize: 9, color: "#000" }}>✓</span>}
              </div>
              <span style={{ fontSize: 11, color: on ? C.amber : C.textSub }}>{c}</span>
            </div>
          );
        })}
      </div>
      {criteria.length === 0 && <div style={{ fontSize: 11, color: C.red }}>Select at least one criterion.</div>}
    </div>
  );
}
