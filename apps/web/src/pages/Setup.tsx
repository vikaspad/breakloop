import { useState } from "react";
import { C } from "../theme";
import { api } from "../api/client";

export function Setup() {
  const [step, setStep] = useState<"info" | "form" | "complete">("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    adminEmail: "",
    adminPassword: "",
    adminName: "",
    jwtSecret: generateSecret(32),
    encryptionKey: generateEncryptionKey(),
  });

  function generateSecret(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function generateEncryptionKey(): string {
    const hex = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < 64; i++) {
      result += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return result;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate encryption key format
      if (!/^[0-9a-f]{64}$/i.test(formData.encryptionKey)) {
        throw new Error("Encryption key must be 64 hexadecimal characters");
      }

      const res = await api.setup.complete({
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminName: formData.adminName,
        jwtSecret: formData.jwtSecret,
        encryptionKey: formData.encryptionKey,
      });

      // Save token
      localStorage.setItem("bl_token", res.data.token);
      localStorage.setItem("bl_user", JSON.stringify(res.data.user));

      setStep("complete");
      // Reload page after 2 seconds to trigger setup check
      setTimeout(() => {
        console.log("[SETUP] Reloading page to check setup status...");
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  const regenerateSecrets = () => {
    setFormData(d => ({
      ...d,
      jwtSecret: generateSecret(32),
      encryptionKey: generateEncryptionKey(),
    }));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 500,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 40,
      }}>
        {step === "info" && (
          <div>
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <h1 style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: C.text,
                marginBottom: 8,
              }}>
                🚀 Welcome to BreakLoop
              </h1>
              <p style={{ fontSize: 12, color: C.textSub }}>
                Let's set up your AI agent testing platform
              </p>
            </div>

            <div style={{
              background: `${C.blue}08`,
              border: `1px solid ${C.blue}25`,
              borderRadius: 10,
              padding: 16,
              marginBottom: 24,
              fontSize: 11,
              color: C.textSub,
              lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 600, color: C.blue, marginBottom: 8 }}>
                First-Time Setup
              </div>
              <ul style={{ marginLeft: 20, margin: 0 }}>
                <li>Create admin account with your credentials</li>
                <li>Generate secure JWT secret for authentication</li>
                <li>Generate encryption key for storing sensitive credentials</li>
                <li>All credentials are UI-driven, not hardcoded</li>
              </ul>
            </div>

            <button
              onClick={() => setStep("form")}
              style={{
                width: "100%",
                background: C.amberDim,
                border: `1px solid ${C.amber}50`,
                color: C.amber,
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Continue to Setup →
            </button>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <h2 style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: C.text,
              }}>
                System Setup
              </h2>
            </div>

            {error && (
              <div style={{
                background: C.redDim,
                border: `1px solid ${C.red}30`,
                borderRadius: 8,
                padding: 10,
                fontSize: 11,
                color: C.red,
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {/* Admin Account Section */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>
                ADMIN ACCOUNT
              </label>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: C.textSub, display: "block", marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={e => setFormData(d => ({ ...d, adminEmail: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    background: C.surface,
                    color: C.text,
                    fontSize: 11,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  placeholder="admin@breakloop.dev"
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: C.textSub, display: "block", marginBottom: 4 }}>Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.adminPassword}
                  onChange={e => setFormData(d => ({ ...d, adminPassword: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    background: C.surface,
                    color: C.text,
                    fontSize: 11,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label style={{ fontSize: 10, color: C.textSub, display: "block", marginBottom: 4 }}>Name</label>
                <input
                  type="text"
                  required
                  value={formData.adminName}
                  onChange={e => setFormData(d => ({ ...d, adminName: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    background: C.surface,
                    color: C.text,
                    fontSize: 11,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  placeholder="Your Name"
                />
              </div>
            </div>

            {/* Secrets Section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.08em" }}>
                  GENERATED SECRETS
                </label>
                <button
                  type="button"
                  onClick={regenerateSecrets}
                  style={{
                    background: "none",
                    border: `1px solid ${C.amber}30`,
                    color: C.amber,
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 9,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  🔄 Regenerate
                </button>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: C.textSub, display: "block", marginBottom: 4 }}>JWT Secret</label>
                <div style={{
                  padding: "8px 10px",
                  background: C.surface,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  fontSize: 9,
                  color: C.textDim,
                  fontFamily: "'JetBrains Mono',monospace",
                  wordBreak: "break-all",
                  maxHeight: 60,
                  overflowY: "auto",
                }}>
                  {formData.jwtSecret}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10, color: C.textSub, display: "block", marginBottom: 4 }}>Encryption Key (64 hex)</label>
                <div style={{
                  padding: "8px 10px",
                  background: C.surface,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  fontSize: 9,
                  color: C.textDim,
                  fontFamily: "'JetBrains Mono',monospace",
                  wordBreak: "break-all",
                  maxHeight: 60,
                  overflowY: "auto",
                }}>
                  {formData.encryptionKey}
                </div>
              </div>
            </div>

            {/* Info */}
            <div style={{
              background: `${C.green}08`,
              border: `1px solid ${C.green}25`,
              borderRadius: 8,
              padding: 10,
              marginBottom: 16,
              fontSize: 10,
              color: C.textSub,
              lineHeight: 1.5,
            }}>
              ✓ These secrets will be securely stored in the database
              <br />✓ Never hardcoded or exposed in source code
              <br />✓ Used for authentication and credential encryption
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setStep("info")}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "none",
                  border: `1px solid ${C.border}`,
                  color: C.textSub,
                  padding: 10,
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? C.muted : C.amberDim,
                  border: `1px solid ${C.amber}50`,
                  color: loading ? C.textDim : C.amber,
                  padding: 10,
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                }}
              >
                {loading ? "Setting up..." : "Complete Setup"}
              </button>
            </div>
          </form>
        )}

        {step === "complete" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: C.green,
              marginBottom: 8,
            }}>
              Setup Complete!
            </h2>
            <p style={{ fontSize: 11, color: C.textSub, marginBottom: 20 }}>
              BreakLoop is ready to use. Redirecting to dashboard...
            </p>
            <div style={{
              background: `${C.green}08`,
              border: `1px solid ${C.green}25`,
              borderRadius: 8,
              padding: 12,
              fontSize: 10,
              color: C.green,
            }}>
              Admin account created and secrets securely stored
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
