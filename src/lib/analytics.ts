import { calcCpa, calcCpc, calcCtr, calcCvr, calcRoas, computeMetrics } from "@/lib/metrics";
import { dayKey, round, safeJsonArray } from "@/lib/utils";
import type {
  CreativeScorecard,
  DailyPoint,
  DerivedMetrics,
  GroupedPerformance,
  MetricRow,
  Signal,
  SignalBundle,
} from "@/types";

export function dailySeries(rows: MetricRow[]): DailyPoint[] {
  const buckets = new Map<string, MetricRow[]>();
  rows.forEach((row) => {
    const key = dayKey(row.date);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  });

  return Array.from(buckets.entries())
    .map(([date, bucketRows]) => ({ date, ...computeMetrics(bucketRows) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function groupPerformance(
  rows: MetricRow[],
  key: "platform" | "campaign" | "creative",
): GroupedPerformance[] {
  const buckets = new Map<string, MetricRow[]>();
  rows.forEach((row) => {
    const name = row[key];
    const bucket = buckets.get(name);
    if (bucket) bucket.push(row);
    else buckets.set(name, [row]);
  });

  const totalSpend = rows.reduce((acc, row) => acc + row.spend, 0);
  const totalConversions = rows.reduce((acc, row) => acc + row.conversions, 0);

  return Array.from(buckets.entries())
    .map(([name, bucketRows]) => {
      const metrics = computeMetrics(bucketRows);
      const sample = bucketRows[0];
      return {
        name,
        ...metrics,
        share: totalConversions > 0 ? metrics.conversions / totalConversions : 0,
        spendShare: totalSpend > 0 ? metrics.spend / totalSpend : 0,
        platform: sample?.platform,
        campaign: sample?.campaign,
        creative: sample?.creative,
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

export function creativeScorecard(rows: MetricRow[]): CreativeScorecard[] {
  const creatives = groupPerformance(rows, "creative");
  const benchmarks = computeMetrics(rows);

  const scorecards: CreativeScorecard[] = creatives.map((item) => ({
    ...item,
    ctrIndex: benchmarks.ctr > 0 ? item.ctr / benchmarks.ctr : 0,
    roasIndex: benchmarks.roas > 0 ? item.roas / benchmarks.roas : 0,
  }));

  return scorecards.sort((a, b) => b.roas - a.roas);
}

export type WindowComparison = {
  windowDays: number;
  current: DerivedMetrics;
  previous: DerivedMetrics;
  currentRange: { start: string; end: string };
  previousRange: { start: string; end: string };
  deltas: Record<keyof DerivedMetrics, number>;
};

export function compareWindows(rows: MetricRow[], windowDays = 7): WindowComparison | null {
  const series = dailySeries(rows);
  if (series.length === 0) return null;

  const days = series.map((point) => point.date);
  const currentDates = new Set(days.slice(-windowDays));
  const previousDates = new Set(days.slice(-windowDays * 2, -windowDays));

  const currentRows = rows.filter((row) => currentDates.has(dayKey(row.date)));
  const previousRows = rows.filter((row) => previousDates.has(dayKey(row.date)));

  const current = computeMetrics(currentRows);
  const previous = computeMetrics(previousRows);
  const deltaOf = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100);

  const currentSorted = Array.from(currentDates).sort();
  const previousSorted = Array.from(previousDates).sort();

  return {
    windowDays,
    current,
    previous,
    currentRange: {
      start: currentSorted[0] ?? "",
      end: currentSorted[currentSorted.length - 1] ?? "",
    },
    previousRange: {
      start: previousSorted[0] ?? "",
      end: previousSorted[previousSorted.length - 1] ?? "",
    },
    deltas: {
      spend: deltaOf(current.spend, previous.spend),
      impressions: deltaOf(current.impressions, previous.impressions),
      clicks: deltaOf(current.clicks, previous.clicks),
      conversions: deltaOf(current.conversions, previous.conversions),
      revenue: deltaOf(current.revenue, previous.revenue),
      ctr: deltaOf(current.ctr, previous.ctr),
      cpc: deltaOf(current.cpc, previous.cpc),
      cvr: deltaOf(current.cvr, previous.cvr),
      cpa: deltaOf(current.cpa, previous.cpa),
      roas: deltaOf(current.roas, previous.roas),
    },
  };
}

export type AudienceSegmentSummary = GroupedPerformance & {
  segment: string;
  age: string;
  gender: string;
  cvrIndex: number;
  ctrIndex: number;
};

export type AudienceSegmentRow = MetricRow & {
  segment: string;
  age: string;
  gender: string;
  personaCode?: string;
};

export function audienceBreakdown(rows: AudienceSegmentRow[]): AudienceSegmentSummary[] {
  const buckets = new Map<string, AudienceSegmentRow[]>();
  rows.forEach((row) => {
    const bucket = buckets.get(row.segment);
    if (bucket) bucket.push(row);
    else buckets.set(row.segment, [row]);
  });

  const account = computeMetrics(rows);
  const totalConversions = rows.reduce((acc, row) => acc + row.conversions, 0);
  const totalSpend = rows.reduce((acc, row) => acc + row.spend, 0);

  return Array.from(buckets.entries())
    .map(([segment, segmentRows]) => {
      const metrics = computeMetrics(segmentRows);
      const sample = segmentRows[0];
      const enriched: AudienceSegmentSummary = {
        name: segment,
        segment,
        age: sample.age,
        gender: sample.gender,
        ...metrics,
        share: totalConversions > 0 ? metrics.conversions / totalConversions : 0,
        spendShare: totalSpend > 0 ? metrics.spend / totalSpend : 0,
        ctrIndex: account.ctr > 0 ? metrics.ctr / account.ctr : 0,
        cvrIndex: account.cvr > 0 ? metrics.cvr / account.cvr : 0,
      };
      return enriched;
    })
    .sort((a, b) => b.impressions - a.impressions);
}

/**
 * Rule-based growth signals computed from the actual metric rows.
 * The AI agents receive these signals as evidence, so the narrative can never
 * drift away from the underlying (simulated) data.
 */
export function deriveSignals(rows: MetricRow[], audienceRows: MetricRow[] = []): SignalBundle {
  const account = computeMetrics(rows);
  const creatives = groupPerformance(rows, "creative");
  const platforms = groupPerformance(rows, "platform");
  const comparison = compareWindows(rows, 7);

  const insights: Signal[] = [];
  const opportunities: Signal[] = [];
  const risks: Signal[] = [];
  const recommendations: Signal[] = [];

  if (account.impressions === 0) {
    return {
      insights: [
        {
          title: "暂无可用投放数据",
          body: "当前数据集为空，请先运行 seed 或上传 CSV。",
          evidence: "Metric 表 0 行",
          confidence: 100,
        },
      ],
      opportunities: [],
      risks: [],
      recommendations: [],
    };
  }

  // 1. Best / worst creative by ROAS with real index maths.
  const ranked = [...creatives].filter((item) => item.spend > 0).sort((a, b) => b.roas - a.roas);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  if (best) {
    const ctrIndex = account.ctr > 0 ? (best.ctr / account.ctr - 1) * 100 : 0;
    const roasIndex = account.roas > 0 ? (best.roas / account.roas - 1) * 100 : 0;
    insights.push({
      title: `“${best.name}”是当前效率最高的素材`,
      body: `“${best.name}”贡献 ¥${Math.round(best.spend).toLocaleString("zh-CN")} 花费、ROAS ${best.roas.toFixed(2)}，高于账户均值 ${roasIndex.toFixed(0)}%；CTR ${(best.ctr * 100).toFixed(2)}% 高于账户均值 ${ctrIndex.toFixed(0)}%。该素材同时具备“高点击 + 高转化”，是本周期可放量的首要候选。`,
      evidence: `creative=${best.name}; spend=${best.spend.toFixed(0)}; CTR=${(best.ctr * 100).toFixed(2)}%; ROAS=${best.roas.toFixed(2)}; 账户均值 ROAS=${account.roas.toFixed(2)}`,
      confidence: 88,
    });
  }

  if (best) {
    recommendations.push({
      title: `下一周期把预算向“${best.name}”主题倾斜`,
      body: `建议将“${best.name}”的预算占比从 ${((best.spend / account.spend) * 100).toFixed(1)}% 提升到 ${Math.min(45, (best.spend / account.spend) * 100 + 12).toFixed(0)}% 左右，并用同一主题生产 3 条新素材做横向测试，验证是“主题红利”还是单条素材偶然胜出。`,
      evidence: `当前 spend share=${((best.spend / account.spend) * 100).toFixed(1)}%, ROAS=${best.roas.toFixed(2)}`,
      confidence: 82,
    });
  }

  if (worst && worst.spend > 0 && worst.roas < account.roas) {
    const gap = account.roas > 0 ? (1 - worst.roas / account.roas) * 100 : 0;
    risks.push({
      title: `“${worst.name}”持续拉低整体效率`,
      body: `“${worst.name}”的 ROAS 为 ${worst.roas.toFixed(2)}，比账户均值低 ${gap.toFixed(0)}%，却仍占用 ${((worst.spend / account.spend) * 100).toFixed(1)}% 预算（¥${Math.round(worst.spend).toLocaleString("zh-CN")}）。若维持现状，将按当前 CPA ¥${worst.cpa.toFixed(2)} 持续消耗预算。`,
      evidence: `creative=${worst.name}; ROAS=${worst.roas.toFixed(2)}; CPA=${worst.cpa.toFixed(2)}; spend share=${((worst.spend / account.spend) * 100).toFixed(1)}%`,
      confidence: 85,
    });
    recommendations.push({
      title: `对“${worst.name}”执行止损式优化`,
      body: `两种处理方式：① 立刻将该素材预算下调 50%，把释放预算转移到高效率素材；② 保留最低测试预算，但替换 Hook 与开头 3 秒，做一次“素材诊断实验”。建议先执行 ①，避免继续以 CPA ¥${worst.cpa.toFixed(2)} 获取低质流量。`,
      evidence: `CPA=${worst.cpa.toFixed(2)} vs 账户均价 ${account.cpa.toFixed(2)}`,
      confidence: 80,
    });
  }

  // 2. Platform efficiency comparison.
  const platformByCpc = [...platforms].filter((item) => item.clicks > 0).sort((a, b) => a.cpc - b.cpc);
  const cheapest = platformByCpc[0];
  const mostExpensive = platformByCpc[platformByCpc.length - 1];
  if (cheapest && mostExpensive && cheapest.name !== mostExpensive.name) {
    const conversionShare = new Map(platforms.map((item) => [item.name, item.share]));
    const cheapShare = (conversionShare.get(cheapest.name) ?? 0) * 100;
    const expensiveShare = (conversionShare.get(mostExpensive.name) ?? 0) * 100;
    insights.push({
      title: `${cheapest.name} 流量成本更低，但转化贡献不成比例`,
      body: `${cheapest.name} 的 CPC 为 ¥${cheapest.cpc.toFixed(2)}，比 ${mostExpensive.name}（¥${mostExpensive.cpc.toFixed(2)}）低 ${(
        (1 - cheapest.cpc / mostExpensive.cpc) * 100
      ).toFixed(0)}%；但 ${cheapest.name} 只贡献 ${cheapShare.toFixed(1)}% 的转化，而 ${mostExpensive.name} 贡献 ${expensiveShare.toFixed(1)}%。说明 ${cheapest.name} 目前更偏“低意向流量”，需要提高高意向内容占比。`,
      evidence: `${cheapest.name}: CPC=¥${cheapest.cpc.toFixed(2)}, CVR=${(cheapest.cvr * 100).toFixed(2)}%; ${mostExpensive.name}: CPC=¥${mostExpensive.cpc.toFixed(2)}, CVR=${(mostExpensive.cvr * 100).toFixed(2)}%`,
      confidence: 84,
    });
    opportunities.push({
      title: `把 ${mostExpensive.name} 的高转化结构复制到 ${cheapest.name}`,
      body: `${mostExpensive.name} 的 CVR 为 ${(mostExpensive.cvr * 100).toFixed(2)}%，是 ${cheapest.name}（${(cheapest.cvr * 100).toFixed(2)}%）的 ${(
        mostExpensive.cvr / Math.max(cheapest.cvr, 0.0001)
      ).toFixed(1)} 倍。建议把 ${mostExpensive.name} 中表现最好的内容结构（真实使用场景 + 评价证据）改写为适配 ${cheapest.name} 的版本，用更低 CPC 的流量测试更高 CVR 的内容。`,
      evidence: `CVR 差异 ${(mostExpensive.cvr * 100).toFixed(2)}% vs ${(cheapest.cvr * 100).toFixed(2)}%`,
      confidence: 76,
    });
  }

  // 3. Weekly efficiency change (drives the AI Advisor narrative).
  if (comparison && comparison.previous.spend > 0) {
    const roasDelta = comparison.deltas.roas;
    const cvrDelta = comparison.deltas.cvr;
    const ctrDelta = comparison.deltas.ctr;
    const direction = roasDelta >= 0 ? "上升" : "下降";
    insights.push({
      title: `最近 ${comparison.windowDays} 天 ROAS ${direction} ${Math.abs(roasDelta).toFixed(1)}%`,
      body: `ROAS 从 ${comparison.previous.roas.toFixed(2)} 变化到 ${comparison.current.roas.toFixed(2)}；同期 CTR 变化 ${ctrDelta.toFixed(1)}%，CVR 从 ${(
        comparison.previous.cvr * 100
      ).toFixed(2)}% 变化到 ${(comparison.current.cvr * 100).toFixed(2)}%（${cvrDelta.toFixed(1)}%）。${
        Math.abs(ctrDelta) < Math.abs(cvrDelta)
          ? "点击效率基本稳定，效率变化主要来自后端转化环节，而不是素材吸引力。"
          : "点击效率同时发生变化，需要同时检查素材与落地页。"
      }`,
      evidence: `current ROAS=${comparison.current.roas.toFixed(2)}, previous ROAS=${comparison.previous.roas.toFixed(2)}, dCTR=${ctrDelta.toFixed(1)}%, dCVR=${cvrDelta.toFixed(1)}%`,
      confidence: 90,
    });

    if (roasDelta < 0) {
      risks.push({
        title: "转化环节效率下滑是当前最大的增长风险",
        body: `CPA 从 ¥${comparison.previous.cpa.toFixed(2)} 上升到 ¥${comparison.current.cpa.toFixed(2)}（${
          comparison.deltas.cpa >= 0 ? "+" : ""
        }${comparison.deltas.cpa.toFixed(1)}%）。若流量成本（CPC ¥${comparison.current.cpc.toFixed(2)}）保持稳定，说明问题更可能出在承接环节：落地页一致性、价格解释与信任证据。`,
        evidence: `CPA ${comparison.previous.cpa.toFixed(2)} → ${comparison.current.cpa.toFixed(2)}; CPC ${comparison.previous.cpc.toFixed(2)} → ${comparison.current.cpc.toFixed(2)}`,
        confidence: 87,
      });

      recommendations.push({
        title: "优先修复“承诺一致性”，而不是继续加预算",
        body: `在 CVR 修复前不建议放量：先对齐素材承诺与落地页首屏信息，再叠加真实使用场景与用户评价模块，观察 7 天 CVR 是否回到 ${(
          comparison.previous.cvr * 100
        ).toFixed(1)}% 以上，再决定放量节奏。`,
        evidence: `目标 CVR ≥ ${(comparison.previous.cvr * 100).toFixed(1)}%；当前 ${(comparison.current.cvr * 100).toFixed(2)}%`,
        confidence: 83,
      });
    }
  }

  // 4. Audience-level signals (when audience rows exist).
  if (audienceRows.length > 0) {
    const segments = groupPerformance(audienceRows, "creative");
    const bestCtrSegment = [...segments].sort((a, b) => b.ctr - a.ctr)[0];
    const bestCvrSegment = [...segments].sort((a, b) => b.cvr - a.cvr)[0];
    if (bestCtrSegment && bestCvrSegment && bestCtrSegment.name !== bestCvrSegment.name) {
      insights.push({
        title: `${bestCtrSegment.name} 点击意愿最强，但付费转化落后`,
        body: `${bestCtrSegment.name} 的 CTR 为 ${(bestCtrSegment.ctr * 100).toFixed(2)}%（全账户最高），但 CVR 仅 ${(
          bestCtrSegment.cvr * 100
        ).toFixed(2)}%，低于 ${bestCvrSegment.name} 的 ${(bestCvrSegment.cvr * 100).toFixed(2)}%。这说明年轻用户对内容有兴趣，但对“是否值得现在购买”仍有顾虑。`,
        evidence: `${bestCtrSegment.name}: CTR=${(bestCtrSegment.ctr * 100).toFixed(2)}%, CVR=${(bestCtrSegment.cvr * 100).toFixed(2)}%; ${bestCvrSegment.name}: CVR=${(bestCvrSegment.cvr * 100).toFixed(2)}%`,
        confidence: 86,
      });
      opportunities.push({
        title: `${bestCtrSegment.name} 需要“信任 + 价格解释”型内容`,
        body: `该人群点击成本低、兴趣高，缺的是购买理由。建议补充三类内容：① 30 天使用记录；② 成分与安全性说明；③ 单次使用成本换算（把 ¥169 拆解到每天）。同时用学生优惠 / 小规格试用降低首单门槛。`,
        evidence: `CTR=${(bestCtrSegment.ctr * 100).toFixed(2)}% 但 CVR=${(bestCtrSegment.cvr * 100).toFixed(2)}%`,
        confidence: 81,
      });
    }
  }

  return {
    insights: dedupe(insights),
    opportunities: dedupe(opportunities),
    risks: dedupe(risks),
    recommendations: dedupe(recommendations),
  };
}

function dedupe(signals: Signal[]) {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = `${signal.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function signalsFromInsightRows(
  rows: Array<{ category: string; title: string; body: string; evidence: string; confidence: number }>,
): SignalBundle {
  const bundle: SignalBundle = { insights: [], opportunities: [], risks: [], recommendations: [] };
  rows.forEach((row) => {
    const signal: Signal = {
      title: row.title,
      body: row.body,
      evidence: row.evidence,
      confidence: row.confidence,
    };
    if (row.category === "insight") bundle.insights.push(signal);
    else if (row.category === "opportunity") bundle.opportunities.push(signal);
    else if (row.category === "risk") bundle.risks.push(signal);
    else bundle.recommendations.push(signal);
  });
  return bundle;
}

export function personaParsed<T extends { painPoints: string }>(row: T) {
  return safeJsonArray(row.painPoints);
}

export function efficiencyQuadrant(item: GroupedPerformance, benchmarks: DerivedMetrics) {
  const ctrOk = item.ctr >= benchmarks.ctr;
  const roasOk = item.roas >= benchmarks.roas;
  if (ctrOk && roasOk) return { code: "scale", label: "放量", tone: "good" as const };
  if (!ctrOk && roasOk) return { code: "optimize_hook", label: "优化 Hook", tone: "info" as const };
  if (ctrOk && !roasOk) return { code: "fix_funnel", label: "修复承接", tone: "warn" as const };
  return { code: "pause", label: "暂停", tone: "bad" as const };
}

export function roundMetrics(metrics: DerivedMetrics): DerivedMetrics {
  return {
    spend: round(metrics.spend, 2),
    impressions: round(metrics.impressions, 0),
    clicks: round(metrics.clicks, 0),
    conversions: round(metrics.conversions, 0),
    revenue: round(metrics.revenue, 2),
    ctr: metrics.ctr,
    cpc: metrics.cpc,
    cvr: metrics.cvr,
    cpa: metrics.cpa,
    roas: metrics.roas,
  };
}

export function metricFromParts(parts: {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}): DerivedMetrics {
  return {
    ...parts,
    ctr: calcCtr(parts.clicks, parts.impressions),
    cpc: calcCpc(parts.spend, parts.clicks),
    cvr: calcCvr(parts.conversions, parts.clicks),
    cpa: calcCpa(parts.spend, parts.conversions),
    roas: calcRoas(parts.revenue, parts.spend),
  };
}
