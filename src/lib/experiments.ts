import { twoProportionZTest, type ProportionTest } from "@/lib/statistics";

export type VariantMetrics = {
  label: string;
  name: string;
  description: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
};

export type ExperimentEvaluation = {
  primaryMetric: string;
  a: VariantMetrics;
  b: VariantMetrics;
  metrics: {
    a: { ctr: number; cvr: number; cpa: number; roas: number };
    b: { ctr: number; cvr: number; cpa: number; roas: number };
  };
  test: ProportionTest | null;
  liftPct: number;
  significant: boolean;
  winner: "A" | "B" | "tie";
  recommendation: string;
};

const METRIC_LABEL: Record<string, string> = {
  ctr: "CTR",
  cvr: "CVR",
  cpa: "CPA",
  roas: "ROAS",
};

/**
 * Evaluates an A/B test using a two-proportion z-test for rate metrics
 * (CTR / CVR) and lift comparison for ratio metrics (CPA / ROAS).
 *
 * Using statistics instead of an LLM opinion here is deliberate: the model is
 * good at interpreting *why*, but the "is this difference real" question must
 * be answered by maths.
 */
export function evaluateExperiment(
  a: VariantMetrics,
  b: VariantMetrics,
  primaryMetric: string,
): ExperimentEvaluation {
  const safe = (numerator: number, denominator: number) => (denominator > 0 ? numerator / denominator : 0);

  const metricsA = {
    ctr: safe(a.clicks, a.impressions),
    cvr: safe(a.conversions, a.clicks),
    cpa: safe(a.spend, a.conversions),
    roas: safe(a.revenue, a.spend),
  };
  const metricsB = {
    ctr: safe(b.clicks, b.impressions),
    cvr: safe(b.conversions, b.clicks),
    cpa: safe(b.spend, b.conversions),
    roas: safe(b.revenue, b.spend),
  };

  const metric = METRIC_LABEL[primaryMetric] ? primaryMetric : "cvr";
  let test: ProportionTest | null = null;

  if (metric === "ctr") {
    test = twoProportionZTest(a.clicks, a.impressions, b.clicks, b.impressions);
  } else if (metric === "cvr") {
    test = twoProportionZTest(a.conversions, a.clicks, b.conversions, b.clicks);
  }

  const valueA = metric === "cpa" ? metricsA.cpa : metric === "roas" ? metricsA.roas : metric === "ctr" ? metricsA.ctr : metricsA.cvr;
  const valueB = metric === "cpa" ? metricsB.cpa : metric === "roas" ? metricsB.roas : metric === "ctr" ? metricsB.ctr : metricsB.cvr;

  // For CPA, lower is better; for everything else, higher is better.
  const lowerIsBetter = metric === "cpa";
  const rawLift = valueA === 0 ? 0 : ((valueB - valueA) / Math.abs(valueA)) * 100;
  const liftPct = lowerIsBetter ? -rawLift : rawLift;

  const significant = test ? test.significant : Math.abs(liftPct) >= 15;
  let winner: "A" | "B" | "tie" = "tie";
  if (significant) winner = liftPct > 0 ? "B" : "A";
  else if (Math.abs(liftPct) < 5) winner = "tie";

  const label = METRIC_LABEL[metric];
  const metricText = metric === "cpa" || metric === "roas" ? valueB.toFixed(2) : `${(valueB * 100).toFixed(2)}%`;
  const metricTextA = metric === "cpa" || metric === "roas" ? valueA.toFixed(2) : `${(valueA * 100).toFixed(2)}%`;

  const scope = "基于模拟数据（Demo 数据集）的统计检验";
  let recommendation: string;
  if (winner === "B") {
    recommendation = `${scope}：建议在下一轮模拟实验中保留 B（${b.name}），并把预算向 B 倾斜 60/40。${label}：A ${metricTextA} → B ${metricText}（Demo 数据中差异 ${Math.abs(liftPct).toFixed(1)}%）。${
      test
        ? `显著性：p=${test.pValue.toFixed(4)}（${test.significant ? "显著" : "未达显著，建议继续收集样本"}）。`
        : "该指标为比率型指标，使用提升幅度判断，建议再用 CTR/CVR 交叉验证。"
    }该结论来自模拟数据，若要在真实投放中复现需要扩样验证。`;
  } else if (winner === "A") {
    recommendation = `${scope}：建议在下一轮模拟实验中保留 A（${a.name}），暂不把预算转向 B。${label}：A ${metricTextA} → B ${metricText}（Demo 数据中 B ${
      liftPct < 0 ? "下降" : "上升"
    } ${Math.abs(liftPct).toFixed(1)}%）。${test ? `显著性：p=${test.pValue.toFixed(4)}。` : ""}该结论来自模拟数据，需真实数据验证。`;
  } else {
    recommendation = `${scope}：当前差异不足以判断胜负（${label}：A ${metricTextA} vs B ${metricText}，差异 ${Math.abs(
      liftPct,
    ).toFixed(1)}%）。建议：① 在模拟实验中继续平量测试直到样本更充分；② 检查是否被落地页或人群差异干扰；③ 若仍无差异，改为测试新的角度族。以上均为模拟数据推演，不代表真实投放结果。`;
  }

  return {
    primaryMetric: metric,
    a,
    b,
    metrics: { a: metricsA, b: metricsB },
    test,
    liftPct,
    significant,
    winner,
    recommendation,
  };
}

export function experimentMetricTable(evaluation: ExperimentEvaluation) {
  return [
    { metric: "CTR %", A: Number((evaluation.metrics.a.ctr * 100).toFixed(2)), B: Number((evaluation.metrics.b.ctr * 100).toFixed(2)) },
    { metric: "CVR %", A: Number((evaluation.metrics.a.cvr * 100).toFixed(2)), B: Number((evaluation.metrics.b.cvr * 100).toFixed(2)) },
    { metric: "CPA ¥", A: Number(evaluation.metrics.a.cpa.toFixed(2)), B: Number(evaluation.metrics.b.cpa.toFixed(2)) },
    { metric: "ROAS", A: Number(evaluation.metrics.a.roas.toFixed(2)), B: Number(evaluation.metrics.b.roas.toFixed(2)) },
  ];
}
