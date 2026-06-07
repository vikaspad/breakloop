import { useState } from "react";
import { C } from "../../theme";
import { AgentType, ConnType, AuthType, CreateAgentDto } from "../../types";
import { StepIdentity } from "./StepIdentity";
import { StepConnection } from "./StepConnection";
import { StepSchema } from "./StepSchema";
import { StepCriteria } from "./StepCriteria";
import { StepReview } from "./StepReview";

const STEPS = ["Identity", "Connection", "Schema", "Eval Criteria", "Review"];

interface FormState {
  name: string;
  type: AgentType;
  description: string;
  tags: string;
  connType: ConnType;
  endpoint: string;
  authType: AuthType;
  authToken: string;
  inputSchema: string;
  outputSchema: string;
  systemPrompt: string;
  evalCriteria: string[];
}

interface Props {
  onSave: (dto: CreateAgentDto) => Promise<void>;
  onClose: () => void;
}

export function OnboardWizard({ onSave, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    name: "", type: "CONVERSATIONAL", description: "", tags: "",
    connType: "MOCK", endpoint: "", authType: "NONE", authToken: "",
    inputSchema: "{}", outputSchema: '{"response":"string"}',
    systemPrompt: "", evalCriteria: ["goal_completion", "no_hallucination"],
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleCriteria = (c: string) =>
    setForm(f => ({ ...f, evalCriteria: f.evalCriteria.includes(c) ? f.evalCriteria.filter(x => x !== c) : [...f.evalCriteria, c] }));

  const canNext = () => {
    if (step === 0 && !form.name.trim()) return false;
    if (step === 1 && !form.connType) return false;
    if (step === 3 && form.evalCriteria.length === 0) return false;
    return true;
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Agent name is required";
    if (form.connType !== "MOCK" && !form.endpoint.trim()) return "Endpoint is required";
    if (form.connType !== "MOCK" && form.endpoint.trim()) {
      try {
        new URL(form.endpoint.trim());
      } catch {
        return `Invalid endpoint URL. Use format: http://localhost:3002/api/run or https://example.com/api`;
      }
    }
    if (form.authType !== "NONE" && !form.authToken.trim()) return "Auth token/key is required";
    if (form.evalCriteria.length === 0) return "At least one eval criterion is required";

    // Validate JSON schemas if provided
    if (form.inputSchema.trim() && form.inputSchema.trim() !== "{}") {
      try { JSON.parse(form.inputSchema); } catch { return "Input schema must be valid JSON"; }
    }
    if (form.outputSchema.trim() && form.outputSchema.trim() !== "{}") {
      try { JSON.parse(form.outputSchema); } catch { return "Output schema must be valid JSON"; }
    }

    return null;
  };

  const handleSave = async () => {
    setError("");

    // Validate before attempting to save
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      let outputSchema: Record<string, unknown> | undefined;
      try { outputSchema = JSON.parse(form.outputSchema) as Record<string, unknown>; } catch { /* keep undefined */ }

      const dto: CreateAgentDto = {
        name: form.name.trim(),
        description: form.description || undefined,
        type: form.type,
        connType: form.connType,
        endpoint: form.endpoint || undefined,
        authType: form.authType,
        authToken: form.authToken || undefined,
        outputSchema,
        evalCriteria: form.evalCriteria,
        systemPrompt: form.systemPrompt || undefined,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      console.log("[ONBOARD] Saving agent:", dto.name);
      await onSave(dto);
      console.log("[ONBOARD] Agent saved successfully");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[ONBOARD] Save failed:", errMsg);
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000090", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 560, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 15, color: C.text, fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>Onboard New Agent</div>
            <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        <div style={{ display: "flex", gap: 4, padding: "14px 24px 0" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? C.amber : C.border, transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ padding: "20px 24px", minHeight: 260, maxHeight: "60vh", overflowY: "auto" }}>
          {error && (
            <div style={{
              background: C.redDim,
              border: `1px solid ${C.red}40`,
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              fontSize: 11,
              color: C.red,
            }}>
              ❌ {error}
            </div>
          )}
          {step === 0 && <StepIdentity form={form} update={update} />}
          {step === 1 && <StepConnection form={form} update={update} />}
          {step === 2 && <StepSchema form={form} update={update} />}
          {step === 3 && <StepCriteria criteria={form.evalCriteria} toggle={toggleCriteria} />}
          {step === 4 && <StepReview form={form} />}
        </div>

        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, padding: "8px 20px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          <button onClick={() => step < 4 ? setStep(s => s + 1) : handleSave()}
            disabled={!canNext() || saving}
            style={{ background: canNext() && !saving ? C.amber : C.muted, border: "none", borderRadius: 8, color: canNext() && !saving ? "#000" : C.textDim, padding: "8px 24px", cursor: canNext() && !saving ? "pointer" : "not-allowed", fontSize: 12, fontFamily: "inherit", fontWeight: 700 }}>
            {saving ? "Saving..." : step === 4 ? "✓ Save Agent" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
