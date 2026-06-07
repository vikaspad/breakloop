import { C } from "../../theme";

interface StatusDotProps {
  status: string;
}

const MAP: Record<string, string> = {
  pass: C.green, warn: C.amber, fail: C.red,
  HEALTHY: C.green, WARN: C.amber, FAIL: C.red,
  healthy: C.green, PENDING: C.textDim, new: C.textDim,
};

export function StatusDot({ status }: StatusDotProps) {
  const c = MAP[status] ?? C.textDim;
  return (
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block", flexShrink: 0, boxShadow: `0 0 5px ${c}` }} />
  );
}
