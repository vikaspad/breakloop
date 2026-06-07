import { EvalStatus } from "@prisma/client";
import { EvalResult } from "./evaluator";

export interface ScoreResult {
  status: EvalStatus;
  overallScore: number;
}

export function score(evalResult: EvalResult): ScoreResult {
  const values = Object.values(evalResult.scores);
  const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  let status: EvalStatus;
  if (evalResult.overallStatus === "fail" || avg < 50) status = EvalStatus.FAIL;
  else if (evalResult.overallStatus === "warn" || avg < 75) status = EvalStatus.WARN;
  else status = EvalStatus.PASS;

  return { status, overallScore: avg };
}
