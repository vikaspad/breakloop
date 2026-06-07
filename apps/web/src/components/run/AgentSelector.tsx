import { C, AGENT_TYPE_COLORS } from "../../theme";
import { Tag } from "../shared/Tag";
import { StatusDot } from "../shared/StatusDot";
import { Agent } from "../../types";

interface Props {
  agents: Agent[];
  selected: Agent | null;
  onSelect: (a: Agent) => void;
}

export function AgentSelector({ agents, selected, onSelect }: Props) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 10 }}>TARGET AGENT</div>
      {agents.map(a => {
        const color = AGENT_TYPE_COLORS[a.type] ?? C.textSub;
        return (
          <div key={a.id} onClick={() => onSelect(a)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, cursor: "pointer",
            background: selected?.id === a.id ? `${color}12` : C.surface,
            border: `1px solid ${selected?.id === a.id ? color + "50" : C.border}`,
            marginBottom: 5, transition: "all 0.2s",
          }}>
            <StatusDot status={a.status} />
            <span style={{ fontSize: 11, color: selected?.id === a.id ? color : C.textSub, flex: 1 }}>{a.name}</span>
            <Tag label={a.type.replace("_", " ")} color={color} bg={`${color}15`} />
          </div>
        );
      })}
      {agents.length === 0 && <div style={{ fontSize: 11, color: C.textDim, padding: "12px 0", textAlign: "center" }}>No agents registered yet</div>}
    </div>
  );
}
