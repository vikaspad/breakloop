import { C } from "../../theme";

interface MiniBarProps {
  value: number;
  color: string;
}

export function MiniBar({ value, color }: MiniBarProps) {
  return (
    <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2, transition: "width 1s ease" }} />
    </div>
  );
}
