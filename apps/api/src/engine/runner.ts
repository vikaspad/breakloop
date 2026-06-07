import { EvalStatus } from "@prisma/client";
import { prisma } from "../db/prisma";
import { getAdapter } from "../adapters";
import { evaluate } from "./evaluator";
import { score } from "./scorer";
import { emit, closeStream } from "../websocket/traceEmitter";
import { v4 as uuid } from "uuid";

export async function executeRun(runId: string): Promise<void> {
  const run = await prisma.run.findUniqueOrThrow({
    where: { id: runId },
    include: { agent: true, suite: { include: { cases: true } } },
  });

  await prisma.run.update({ where: { id: runId }, data: { status: "RUNNING", startedAt: new Date() } });
  emit(runId, "RUN_STARTED", { runId });

  const adapter = getAdapter(run.agent.connType);
  const outputSchema = run.agent.outputSchema as Record<string, unknown> | null;
  const scores: number[] = [];
  const caseStatuses: EvalStatus[] = [];   // track real statuses for accurate summary

  try {
    for (const testCase of run.suite.cases) {
      const current = await prisma.run.findUnique({ where: { id: runId }, select: { status: true } });
      if (current?.status !== "RUNNING") return;

      const sessionId = uuid();

      const agentResponse = await adapter.run({
        input: testCase.input,
        sessionId,
        agent: run.agent,
        systemPrompt: run.agent.systemPrompt ?? undefined,
      });

      const afterCall = await prisma.run.findUnique({ where: { id: runId }, select: { status: true } });
      if (afterCall?.status !== "RUNNING") return;

      const traceSteps = agentResponse.steps.map(s => ({ ...s }));

      // If the adapter returned an error (connection failure, no endpoint, bad auth),
      // skip the LLM evaluator entirely — it would generate misleading verdicts on empty output.
      if (agentResponse.error || agentResponse.output.trim() === "") {
        let reason = "";
        let failureTags: string[] = [];

        if (agentResponse.error) {
          reason = `Agent connection error: ${agentResponse.error}`;
          // Classify the error type
          if (agentResponse.error.includes("timeout") || agentResponse.error.includes("timed out")) {
            failureTags = ["timeout"];
          } else if (agentResponse.error.includes("ECONNREFUSED") || agentResponse.error.includes("Cannot reach")) {
            failureTags = ["timeout"]; // Connection refused is a timeout-like issue
          } else if (agentResponse.error.includes("401") || agentResponse.error.includes("403") || agentResponse.error.includes("Unauthorized")) {
            failureTags = ["context_loss"]; // Auth failure
          } else {
            failureTags = ["timeout"]; // Default to timeout for connection issues
          }
        } else {
          reason = "Agent returned no output.";
          failureTags = ["timeout"];
        }

        await prisma.caseResult.create({
          data: {
            runId, caseId: testCase.id, status: EvalStatus.FAIL,
            agentOutput: "", latencyMs: agentResponse.latencyMs,
            scores: {}, failureTags,
            evalReason: reason, traceSteps,
          },
        });

        scores.push(0);
        caseStatuses.push(EvalStatus.FAIL);

        emit(runId, "CASE_COMPLETE", {
          caseId: testCase.id,
          input: testCase.input,
          agentOutput: "",
          agentError: agentResponse.error ?? "No output returned",
          status: "FAIL",
          score: 0,
          scores: {},
          failureTags,
          evalReason: reason,
          latencyMs: agentResponse.latencyMs,
          steps: traceSteps,
        });
        continue;
      }

      // Normal path — agent returned output, run the evaluator
      const evalResult = await evaluate(testCase, agentResponse, run.agent.evalCriteria, outputSchema, run.agent.userId);
      const { status, overallScore } = score(evalResult);
      scores.push(overallScore);
      caseStatuses.push(status);

      await prisma.caseResult.create({
        data: {
          runId, caseId: testCase.id, status,
          agentOutput: agentResponse.output,
          latencyMs: agentResponse.latencyMs,
          scores: evalResult.scores,
          failureTags: evalResult.failureTags,
          evalReason: evalResult.reason,
          traceSteps,
        },
      });

      emit(runId, "CASE_COMPLETE", {
        caseId: testCase.id,
        input: testCase.input,
        agentOutput: agentResponse.output,
        agentError: null,
        status,
        score: overallScore,
        scores: evalResult.scores,
        failureTags: evalResult.failureTags,
        evalReason: evalResult.reason,
        latencyMs: agentResponse.latencyMs,
        steps: traceSteps,
      });
    }

    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Count using actual case statuses, not score thresholds
    const pass = caseStatuses.filter(s => s === EvalStatus.PASS).length;
    const warn = caseStatuses.filter(s => s === EvalStatus.WARN).length;
    const fail = caseStatuses.filter(s => s === EvalStatus.FAIL).length;

    await prisma.run.update({
      where: { id: runId },
      data: { status: "COMPLETE", overallScore, completedAt: new Date(), summary: { pass, warn, fail } },
    });

    await prisma.agent.update({
      where: { id: run.agentId },
      data: { status: overallScore >= 75 ? "HEALTHY" : overallScore >= 50 ? "WARN" : "FAIL" },
    });

    emit(runId, "RUN_COMPLETE", { runId, overallScore, summary: { pass, warn, fail } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await prisma.run.update({ where: { id: runId }, data: { status: "FAILED" } });
    emit(runId, "RUN_ERROR", { message: msg });
  } finally {
    setTimeout(() => closeStream(runId), 2000);
  }
}
