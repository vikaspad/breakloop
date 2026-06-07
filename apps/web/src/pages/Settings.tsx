import { useState, useEffect } from "react";
import { C } from "../theme";
import { api } from "../api/client";

interface EvaluatorConfig {
  evaluatorType: "BUILTIN" | "OPENAI" | "CLAUDE";
  model: string;
  isEnabled: boolean;
}

export function Settings() {
  const [config, setConfig] = useState<EvaluatorConfig>({
    evaluatorType: "BUILTIN",
    model: "gpt-4o-mini",
    isEnabled: false,
  });
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.config.getEvaluator();
      setConfig(res.data as EvaluatorConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Auto-enable custom evaluator if it has all required fields
      let shouldEnable = config.isEnabled;
      if (config.evaluatorType !== "BUILTIN" && apiKey) {
        shouldEnable = true;
      }

      if (config.evaluatorType !== "BUILTIN" && !apiKey) {
        throw new Error(`API key is required for ${config.evaluatorType}`);
      }

      await api.config.updateEvaluator({
        evaluatorType: config.evaluatorType,
        model: config.model,
        apiKey: apiKey || undefined,
        isEnabled: shouldEnable,
      });

      if (shouldEnable && config.evaluatorType !== "BUILTIN") {
        setSuccess(`Custom ${config.evaluatorType} evaluator enabled!`);
      } else {
        setSuccess("Configuration saved successfully!");
      }
      if (shouldEnable) {
        setApiKey("");
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    setSaving(true);
    try {
      await api.config.updateEvaluator({
        isEnabled: false,
      });
      setConfig(c => ({ ...c, isEnabled: false }));
      setSuccess("Evaluator disabled. Using built-in evaluator.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: C.textDim, fontSize: 12 }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div className="animate-fadeUp">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700 }}>
          Settings
        </h1>
        <p style={{ fontSize: 11, color: C.textSub, marginTop: 3 }}>
          Configure evaluator LLM and other workspace settings
        </p>
      </div>

      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 24,
        maxWidth: 600,
      }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Evaluator LLM
          </h2>
          <p style={{ fontSize: 11, color: C.textSub, marginBottom: 16 }}>
            Choose which LLM to use for evaluating test results. The built-in evaluator uses Claude Sonnet.
          </p>

          {/* Evaluator Type Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 8, letterSpacing: "0.08em" }}>
              EVALUATOR TYPE
            </label>
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              {[
                {
                  value: "BUILTIN",
                  label: "Built-in (Claude Sonnet)",
                  desc: "No setup required, included with BreakLoop",
                },
                {
                  value: "OPENAI",
                  label: "OpenAI",
                  desc: "Use your own OpenAI account (gpt-4o, gpt-4-turbo, etc.)",
                },
                {
                  value: "CLAUDE",
                  label: "Anthropic Claude",
                  desc: "Use your own Anthropic account (Claude Sonnet, Opus, Haiku)",
                },
              ].map(opt => (
                <label key={opt.value} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "10px 12px", borderRadius: 8, border: config.evaluatorType === opt.value ? `1px solid ${C.amber}` : `1px solid ${C.border}`, background: config.evaluatorType === opt.value ? `${C.amber}08` : "none" }}>
                  <input
                    type="radio"
                    name="evaluatorType"
                    value={opt.value}
                    checked={config.evaluatorType === opt.value}
                    onChange={e => setConfig(c => ({ ...c, evaluatorType: e.target.value as any }))}
                    style={{ marginTop: 3, cursor: "pointer" }}
                  />
                  <div>
                    <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: C.textSub, marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Model Selection (only for custom evaluators) */}
          {config.evaluatorType !== "BUILTIN" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 8, letterSpacing: "0.08em" }}>
                MODEL
              </label>
              <select
                value={config.model}
                onChange={e => setConfig(c => ({ ...c, model: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  background: C.surface,
                  color: C.text,
                  fontFamily: "inherit",
                  fontSize: 12,
                }}
              >
                {config.evaluatorType === "OPENAI" ? (
                  <>
                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                  </>
                ) : (
                  <>
                    <option value="claude-sonnet-4-20250514">Claude Sonnet (Recommended)</option>
                    <option value="claude-opus-4-20250805">Claude Opus</option>
                    <option value="claude-haiku-4-5-20251001">Claude Haiku</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* API Key (only for custom evaluators) */}
          {config.evaluatorType !== "BUILTIN" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 8, letterSpacing: "0.08em" }}>
                API KEY *
              </label>
              <input
                type="password"
                placeholder={config.isEnabled ? "••••••••••••••••" : `Enter your ${config.evaluatorType} API key`}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  background: C.surface,
                  color: C.text,
                  fontFamily: "inherit",
                  fontSize: 12,
                }}
              />
              <div style={{ fontSize: 9, color: C.textDim, marginTop: 6 }}>
                Your API key will be encrypted and never shared. Only used to evaluate test results.
              </div>
            </div>
          )}

          {/* Status & Actions */}
          {config.isEnabled ? (
            <div style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: `${C.green}08`,
              border: `1px solid ${C.green}25`,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, color: C.green, marginBottom: 10 }}>
                ✓ {config.evaluatorType === "BUILTIN" ? "Using built-in evaluator (Claude Sonnet)" : `Custom evaluator enabled (${config.evaluatorType} ${config.model})`}
              </div>
              <button
                onClick={handleDisable}
                disabled={saving}
                style={{
                  background: "none",
                  border: `1px solid ${C.green}40`,
                  color: C.green,
                  padding: "6px 12px",
                  borderRadius: 6,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: 11,
                  fontFamily: "inherit",
                  fontWeight: 600,
                }}
              >
                Disable Custom Evaluator
              </button>
            </div>
          ) : (
            <div style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: `${C.amber}08`,
              border: `1px solid ${C.amber}25`,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, color: C.amber }}>
                Using built-in evaluator (Claude Sonnet). Configure a custom evaluator above to use your own API key.
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: C.redDim,
              border: `1px solid ${C.red}30`,
              fontSize: 11,
              color: C.red,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: C.greenDim,
              border: `1px solid ${C.green}30`,
              fontSize: 11,
              color: C.green,
              marginBottom: 16,
            }}>
              {success}
            </div>
          )}

          {/* Save Button */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? C.muted : C.amberDim,
                border: `1px solid ${C.amber}50`,
                borderRadius: 8,
                color: saving ? C.textDim : C.amber,
                padding: "10px 20px",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 12,
                fontFamily: "inherit",
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: 24,
        padding: "16px 18px",
        background: `${C.blue}08`,
        border: `1px solid ${C.blue}25`,
        borderRadius: 8,
        fontSize: 11,
        color: C.textSub,
        lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 600, color: C.blue, marginBottom: 8 }}>ℹ About Custom Evaluators</div>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li>Custom evaluators let you use your own LLM for result scoring</li>
          <li>API keys are encrypted at rest and never exposed in the UI</li>
          <li>You pay for API usage according to your provider's pricing</li>
          <li>You can switch between evaluators anytime without losing test history</li>
        </ul>
      </div>
    </div>
  );
}
