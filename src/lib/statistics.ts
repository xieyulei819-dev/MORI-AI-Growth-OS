import { safeDivide } from "@/lib/metrics";

/**
 * Two-proportion z-test used by the Experiment Lab to decide whether a
 * difference between variants is meaningful or still inside noise.
 */
export type ProportionTest = {
  rateA: number;
  rateB: number;
  lift: number;
  zScore: number;
  pValue: number;
  significant: boolean;
  confidence: number;
  winner: "A" | "B" | "tie";
  note: string;
};

export function twoProportionZTest(
  successesA: number,
  trialsA: number,
  successesB: number,
  trialsB: number,
  alpha = 0.05,
): ProportionTest {
  const rateA = safeDivide(successesA, trialsA);
  const rateB = safeDivide(successesB, trialsB);
  const pool = safeDivide(successesA + successesB, trialsA + trialsB);

  if (trialsA === 0 || trialsB === 0) {
    return {
      rateA,
      rateB,
      lift: 0,
      zScore: 0,
      pValue: 1,
      significant: false,
      confidence: 0,
      winner: "tie",
      note: "样本不足，无法判断显著性（存在 0 曝光变体）。",
    };
  }

  const standardError = Math.sqrt(pool * (1 - pool) * (1 / trialsA + 1 / trialsB));
  const zScore = standardError === 0 ? 0 : (rateB - rateA) / standardError;
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const significant = pValue < alpha && Number.isFinite(pValue);
  const lift = rateA === 0 ? 0 : ((rateB - rateA) / rateA) * 100;

  let winner: ProportionTest["winner"] = "tie";
  if (significant) winner = rateB > rateA ? "B" : "A";

  return {
    rateA,
    rateB,
    lift,
    zScore,
    pValue,
    significant,
    confidence: Number(((1 - pValue) * 100).toFixed(1)),
    winner,
    note: significant
      ? `差异显著（p=${pValue.toFixed(4)}），可以按 ${winner} 变体进入下一阶段。`
      : `差异未达显著（p=${pValue.toFixed(4)}），需要更多样本再判断。`,
  };
}

/** Abramowitz & Stegun 7.1.26 approximation of the error function. */
function erf(x: number) {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * absX);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function normalCdf(x: number) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/** Minimum sample size per variant for a detectable relative lift. */
export function requiredSampleSize(baselineRate: number, relativeLift: number, power = 0.8, alpha = 0.05) {
  if (baselineRate <= 0 || relativeLift <= 0) return null;
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + relativeLift);
  const zAlpha = alpha === 0.05 ? 1.959964 : 1.644854;
  const zBeta = power === 0.8 ? 0.841621 : 1.281552;
  const pooled = (p1 + p2) / 2;
  const numerator = (zAlpha * Math.sqrt(2 * pooled * (1 - pooled)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2;
  const denominator = (p2 - p1) ** 2;
  return Math.ceil(numerator / denominator);
}
