import { C } from "../../theme";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 11,
      color: C.textDim,
      gap: 16,
    }}>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <span>
          Copyright © {currentYear} <strong style={{ color: C.text }}>AssureFlow Technologies, Inc.</strong>
        </span>
        <span style={{ color: C.border }}>•</span>
        <span>All rights reserved.</span>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: C.textSub, textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}>
          Privacy Policy
        </a>
        <span style={{ color: C.border }}>•</span>
        <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: C.textSub, textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}>
          Terms of Service
        </a>
        <span style={{ color: C.border }}>•</span>
        <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: C.textSub, textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}>
          Support
        </a>
      </div>
    </footer>
  );
}
