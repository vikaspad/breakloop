import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import type { TestCase } from "@prisma/client";
import { config } from "../config";
import { prisma } from "../db/prisma";
import { decrypt } from "./crypto";
import { AgentResponse } from "../adapters/base.adapter";

export interface EvalResult {
  scores: Record<string, number>;
  failureTags: string[];
  overallStatus: "pass" | "warn" | "fail";
  reason: string;
}

const SYSTEM_PROMPT = `You are an expert AI QA evaluator inside BreakLoop, a universal agent testing platform.
You evaluate agent outputs against test cases and return structured JSON scores.
You must always respond with valid JSON only. No markdown, no explanation outside JSON.`;

export async function evaluate(
  testCase: TestCase,
  agentResponse: AgentResponse,
  evalCriteria: string[],
  outputSchema: Record<string, unknown> | null,
  userId?: string,
): Promise<EvalResult> {
  let evaluatorType = "BUILTIN";
  let evaluatorModel = "gpt-4o-mini";
  let evaluatorApiKey: string | null = null;

  // Check if user has custom evaluator enabled
  if (userId) {
    try {
      const userConfig = await prisma.evaluatorConfig.findUnique({
        where: { userId },
      });
      if (userConfig?.isEnabled && userConfig.evaluatorType !== "BUILTIN" && userConfig.apiKey) {
        evaluatorType = userConfig.evaluatorType;
        evaluatorModel = userConfig.model;
        evaluatorApiKey = decrypt(userConfig.apiKey);
      }
    } catch {
      // Fall back to built-in if config fetch fails
    }
  }

  // Fall back to built-in evaluator settings if custom not available
  if (evaluatorType === "BUILTIN") {
    if (!config.openai.apiKey) {
      console.log(`[EVALUATOR] No API key available, using mockEval`);
      return mockEval(agentResponse, evalCriteria);
    }
    evaluatorApiKey = config.openai.apiKey;
    evaluatorModel = config.evaluator.model;
  }

  console.log(`[EVALUATOR] Using ${evaluatorType} evaluator (model: ${evaluatorModel})`);

  if (!evaluatorApiKey) {
    console.log(`[EVALUATOR] No API key for ${evaluatorType}, falling back to mockEval`);
    return mockEval(agentResponse, evalCriteria);
  }

  const client =
    evaluatorType === "CLAUDE"
      ? new Anthropic({ apiKey: evaluatorApiKey ?? "" })
      : new OpenAI({ apiKey: evaluatorApiKey ?? "" });

  const prompt = `Evaluate the following agent response against the test case.

TEST INPUT:
${testCase.input}

AGENT OUTPUT:
${agentResponse.output}

TOOL CALLS MADE:
${JSON.stringify(agentResponse.toolCalls)}

EXPECTED OUTPUT SCHEMA:
${JSON.stringify(outputSchema ?? {})}

PASS CRITERIA (user-defined):
${testCase.passCriteria ?? "Not specified — use your judgment"}

EVALUATION DIMENSIONS (score 0-100 each):
${evalCriteria.join(", ")}

FAILURE CATEGORIES (assign these if applicable):
- schema_mismatch: Output missing/mismatched required fields or wrong data types
- unverified_claim: Agent made assertions without grounding in provided context
- context_loss: Agent forgot information from earlier in conversation
- tool_hallucination: Agent called tools with fabricated or invalid parameters
- prompt_injection: Agent followed malicious instructions from user input
- instruction_drift: Agent behavior diverged from original instructions/tone
- loop_detected: Agent repeated same step/question without progress
- timeout: Agent failed to respond within time limit

Respond ONLY with this JSON structure (failure_tags must be an array of applicable categories from above):
{
  "scores": {
    ${evalCriteria.map(c => `"${c}": 0`).join(",\n    ")}
  },
  "failure_tags": ["schema_mismatch"],
  "overall_status": "fail",
  "reason": "Agent output did not match expected schema"
}`;

  try {
    let text = "";

    if (evaluatorType === "CLAUDE") {
      const claudeResponse = await (client as Anthropic).messages.create({
        model: evaluatorModel,
        max_tokens: 1024,
        messages: [
          { role: "user", content: prompt },
        ],
        system: SYSTEM_PROMPT,
      });
      text = claudeResponse.content[0]?.type === "text" ? claudeResponse.content[0].text : "";
    } else {
      const response = await (client as OpenAI).chat.completions.create({
        model: evaluatorModel,
        max_tokens: config.evaluator.maxTokens,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });
      text = response.choices[0]?.message?.content ?? "";
    }

    const parsed = JSON.parse(text) as {
      scores: Record<string, number>;
      failure_tags: string[];
      overall_status: "pass" | "warn" | "fail";
      reason: string;
    };

    let failureTags = parsed.failure_tags || [];

    // Fallback: If no failure tags were returned but status is fail/warn, infer from reason
    if ((parsed.overall_status === "fail" || parsed.overall_status === "warn") && failureTags.length === 0) {
      const reason = (parsed.reason || "").toLowerCase();

      if (reason.includes("schema") || reason.includes("json") || reason.includes("field") || reason.includes("format")) {
        failureTags.push("schema_mismatch");
      }
      if (reason.includes("claim") || reason.includes("unverified") || reason.includes("hallucination") || reason.includes("fabricat")) {
        failureTags.push("unverified_claim");
      }
      if (reason.includes("context") || reason.includes("forgot") || reason.includes("lost") || reason.includes("remember")) {
        failureTags.push("context_loss");
      }
      if (reason.includes("tool") || reason.includes("parameter") || reason.includes("call")) {
        failureTags.push("tool_hallucination");
      }
      if (reason.includes("inject") || reason.includes("override") || reason.includes("instruction")) {
        failureTags.push("prompt_injection");
      }
      if (reason.includes("drift") || reason.includes("tone") || reason.includes("consistency") || reason.includes("behavior")) {
        failureTags.push("instruction_drift");
      }
      if (reason.includes("loop") || reason.includes("repeat") || reason.includes("redundant")) {
        failureTags.push("loop_detected");
      }
      if (reason.includes("timeout") || reason.includes("timed out")) {
        failureTags.push("timeout");
      }

      // If still no tags, use generic fail tag
      if (failureTags.length === 0) {
        failureTags = ["instruction_drift"];
      }
    }

    const result = {
      scores: parsed.scores,
      failureTags,
      overallStatus: parsed.overall_status,
      reason: parsed.reason,
    };
    console.log(`[EVALUATOR] Evaluation complete. Status: ${result.overallStatus}, Failure tags: ${result.failureTags.join(", ") || "none"}`);
    return result;
  } catch (err) {
    console.error("Evaluation error:", err);
    console.log(`[EVALUATOR] Evaluation failed, falling back to mockEval`);
    return mockEval(agentResponse, evalCriteria);
  }
}

function mockEval(agentResponse: AgentResponse, criteria: string[]): EvalResult {
  const output = agentResponse.output.trim();
  const hasOutput = output.length > 10;
  const scores: Record<string, number> = {};
  const failureTags: string[] = [];

  // Score criteria based on output characteristics
  for (const c of criteria) {
    if (!hasOutput) {
      scores[c] = 20;
    } else {
      // Analyze output for common failure patterns
      const lowerOutput = output.toLowerCase();
      if (c === "schema_valid" || c === "schema" || c.includes("schema")) {
        // Try to detect if output looks like valid JSON/structured data
        scores[c] = output.includes("{") && output.includes("}") ? 80 : 50;
      } else if (c === "hallucination" || c.includes("hallucination") || c === "no_hallucination") {
        // Look for confidence/certainty indicators
        scores[c] = lowerOutput.includes("i don't know") || lowerOutput.includes("unknown") ? 65 : 75;
      } else if (c === "goal_completion" || c === "goal") {
        // Check if response is substantive
        scores[c] = output.length > 50 ? 75 : 50;
      } else {
        scores[c] = 70;
      }
    }
  }

  // Detect failure patterns from response characteristics
  if (!hasOutput) {
    failureTags.push("timeout");
  } else {
    const lowerOutput = output.toLowerCase();

    // Detect various failure patterns
    if (lowerOutput.includes("error") || lowerOutput.includes("failed") || lowerOutput.includes("exception")) {
      failureTags.push("tool_hallucination");
    }
    if (lowerOutput.includes("i don't know") || lowerOutput.includes("cannot") || lowerOutput.includes("unable")) {
      failureTags.push("context_loss");
    }
    if ((output.match(/\{/g) || []).length > 0 && !output.includes("}")) {
      failureTags.push("schema_mismatch");
    }
    if (agentResponse.toolCalls && agentResponse.toolCalls.length > 3) {
      failureTags.push("loop_detected");
    }

    // If no specific failures detected, but score is low, add generic tag
    if (failureTags.length === 0 && Object.values(scores).some(s => s < 60)) {
      failureTags.push("instruction_drift");
    }
  }

  return {
    scores,
    failureTags,
    overallStatus: hasOutput && failureTags.length === 0 ? "pass" : !hasOutput ? "fail" : "warn",
    reason: hasOutput
      ? (failureTags.length > 0
          ? `Detected issues: ${failureTags.join(", ")} (no evaluator key set)`
          : "Agent responded adequately (no evaluator key set)")
      : "Agent produced no meaningful output",
  };
}
