import { useNavigate, useLocation } from "react-router-dom";
import { C } from "../../theme";
import { useUIStore } from "../../store/uiStore";

const NAV = [
  { path: "/", icon: "⬛", label: "Dashboard" },
  { path: "/agents", icon: "◈", label: "Agents" },
  { path: "/suites", icon: "⬡", label: "Test Suites" },
  { path: "/run", icon: "▶", label: "Run Center" },
  { path: "/history", icon: "📋", label: "History" },
  { path: "/reports", icon: "◇", label: "Reports" },
  { path: "/failures", icon: "⚠", label: "Failures" },
  { path: "/settings", icon: "⚙", label: "Settings" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { openWizard } = useUIStore();

  const active = (path: string) => path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <div style={{ width: 195, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "16px 10px", flex: 1 }}>
        {NAV.map(n => (
          <button key={n.path} onClick={() => navigate(n.path)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
              background: active(n.path) ? `${C.amber}12` : "transparent",
              borderLeft: active(n.path) ? `2px solid ${C.amber}` : "2px solid transparent",
              color: active(n.path) ? C.amber : C.textSub,
              fontSize: 11, letterSpacing: "0.06em", fontFamily: "inherit",
              transition: "all 0.18s", marginBottom: 2,
            }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.border}` }}>
        <button onClick={openWizard}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.amber}50`, background: C.amberDim, color: C.amber, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600, letterSpacing: "0.06em" }}>
          + Onboard Agent
        </button>
      </div>
    </div>
  );
}
