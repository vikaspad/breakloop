import { C } from "../../theme";
import { useAgentStore } from "../../store/agentStore";
import { useAuthStore } from "../../store/authStore";

export function TopBar() {
  const { agents } = useAgentStore();
  const { logout, user } = useAuthStore();
  const healthy = agents.filter(a => a.status === "HEALTHY").length;

  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: C.amberDim, border: `1px solid ${C.amber}50`, display: "flex", alignItems: "center", justifyContent: "center", color: C.amber, fontSize: 13 }}>⟳</div>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: C.amber, letterSpacing: "0.14em" }}>BREAKLOOP</span>
        <span style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", paddingTop: 1 }}>UNIVERSAL AGENT TESTING</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 10, color: C.textSub }}>{agents.length} agents registered</div>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <div style={{ fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          {healthy}/{agents.length} HEALTHY
        </div>
        <div style={{ width: 1, height: 16, background: C.border }} />
        {user && <span style={{ fontSize: 10, color: C.textDim }}>{user.email}</span>}
        <button onClick={logout} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, fontSize: 10, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
