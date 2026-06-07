import { C } from "../../theme";

interface TagProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Tag({ label, color = C.textDim, bg = C.muted }: TagProps) {
  return (
    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: bg, color, letterSpacing: "0.04em", fontFamily: "inherit" }}>
      {label}
    </span>
  );
}
