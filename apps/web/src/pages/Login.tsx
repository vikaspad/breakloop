import { useState, FormEvent } from "react";
import { C } from "../theme";
import { useAuthStore } from "../store/authStore";

export function Login() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState("admin@breakloop.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13,
    fontFamily: "inherit", outline: "none",
  };

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono','Courier New',monospace" }}>
      <div style={{ width: 380, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "28px 32px 20px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.amberDim, border: `1px solid ${C.amber}50`, display: "flex", alignItems: "center", justifyContent: "center", color: C.amber, fontSize: 14 }}>⟳</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: C.amber, letterSpacing: "0.14em" }}>BREAKLOOP</span>
          </div>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: "0.08em" }}>UNIVERSAL AGENT TESTING</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 32px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 10, color: C.textSub, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: C.textSub, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
          </div>

          {error && (
            <div style={{ padding: "8px 12px", background: C.redDim, border: `1px solid ${C.red}30`, borderRadius: 6, fontSize: 11, color: C.red }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ marginTop: 4, background: loading ? C.muted : C.amber, border: "none", borderRadius: 8, color: loading ? C.textDim : "#000", padding: "11px", cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.08em" }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div style={{ textAlign: "center", fontSize: 10, color: C.textDim, marginTop: 2 }}>
            Default: admin@breakloop.dev / password123
          </div>
        </form>
      </div>
    </div>
  );
}
