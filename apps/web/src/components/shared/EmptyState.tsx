import { C } from "../../theme";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = "◈", title, subtitle, action }: EmptyStateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 12 }}>
      <div style={{ fontSize: 36, color: C.textDim }}>{icon}</div>
      <div style={{ fontSize: 14, color: C.text, fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.textDim, textAlign: "center", maxWidth: 300 }}>{subtitle}</div>}
      {action && (
        <button onClick={action.onClick} style={{ marginTop: 8, background: C.amberDim, border: `1px solid ${C.amber}50`, color: C.amber, padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
