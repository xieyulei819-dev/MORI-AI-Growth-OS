import { describe, expect, it } from "vitest";

import { compareWindows, creativeScorecard, dailySeries, deriveSignals, efficiencyQuadrant, groupPerformance } from "@/lib/analytics";
import { buildDemoMetrics, DEMO_TARGETS } from "@/lib/demo-data";
import { computeMetrics } from "@/lib/metrics";

const rows = buildDemoMetrics();

describe("analytics engine", () => {
  it("groups rows into a dense daily series", () => {
    const series = dailySeries(rows);
    expect(series).toHaveLength(30);
    expect(series[0].date < series[series.length - 1].date).toBe(true);
    const totalSpend = series.reduce((acc, point) => acc + point.spend, 0);
    expect(Math.round(totalSpend)).toBe(DEMO_TARGETS.spend);
  });

  it("aggregates by platform and creative with consistent totals", () => {
    const platforms = groupPerformance(rows, "platform");
    const creatives = groupPerformance(rows, "creative");
    expect(platforms).toHaveLength(3);
    expect(creatives).toHaveLength(10);
    expect(platforms.reduce((acc, item) => acc + item.impressions, 0)).toBe(DEMO_TARGETS.impressions);
    expect(Math.round(platforms.reduce((acc, item) => acc + item.share, 0) * 100)).toBe(100);
  });

  it("compares the latest window against the previous one", () => {
    const comparison = compareWindows(rows, 7);
    expect(comparison).not.toBeNull();
    if (!comparison) return;
    expect(comparison.currentRange.start).toBe("2026-09-09");
    expect(comparison.previousRange.end).toBe("2026-09-08");
    expect(comparison.current.spend).toBeGreaterThan(0);
    expect(Object.keys(comparison.deltas)).toContain("roas");
  });

  it("classifies creatives into efficiency quadrants", () => {
    const benchmarks = computeMetrics(rows);
    const scorecards = creativeScorecard(rows);
    const best = scorecards[0];
    const worst = scorecards[scorecards.length - 1];
    expect(efficiencyQuadrant(best, benchmarks).code).toBe("scale");
    expect(efficiencyQuadrant(worst, benchmarks).code).toBe("pause");
  });

  it("derives signals whose evidence quotes the real account metrics", () => {
    const signals = deriveSignals(rows);
    const joined = [...signals.insights, ...signals.opportunities, ...signals.risks, ...signals.recommendations]
      .map((signal) => signal.body + signal.evidence)
      .join(" ");
    expect(joined).toContain("ROAS");
    expect(joined).toContain("CTR");
    expect(signals.insights.length).toBeGreaterThanOrEqual(3);
  });

  it("returns an explicit empty-state signal when there is no data", () => {
    const signals = deriveSignals([]);
    expect(signals.insights).toHaveLength(1);
    expect(signals.insights[0].title).toContain("暂无可用投放数据");
    expect(signals.risks).toHaveLength(0);
  });
});
