import { C } from "../../theme";

interface ScoreRingProps {
  score: number;       // 0-100, controls the arc length
  size?: number;
  colorOverride?: string;  // bypasses the score-based colour logic
  label?: string;          // bypasses the score number shown in the centre
}

export function ScoreRing({ score, size = 72, colorOverride, label }: ScoreRingProps) {
  const r = 28, cx = 36, cy = 36, circ = 2 * Math.PI * r;
  const c = colorOverride ?? (score >= 80 ? C.green : score >= 60 ? C.amber : C.red);
  const displayLabel = label ?? (score > 0 ? String(score) : "—");
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth="5"
        strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="36" y="40" textAnchor="middle" fill={c} fontSize="13" fontWeight="700"
        fontFamily="'JetBrains Mono',monospace">{displayLabel}</text>
    </svg>
  );
}
