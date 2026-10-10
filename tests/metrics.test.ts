import { describe, expect, it } from "vitest";

import {
  calcCpa,
  calcCpc,
  calcCtr,
  calcCvr,
  calcRoas,
  computeMetrics,
  formatMetricValue,
  safeDivide,
} from "@/lib/metrics";
import type { MetricRow } from "@/types";

const rows: MetricRow[] = [
  {
    date: "2026-09-01",
    platform: "抖音",
    campaign: "A",
    creative: "C1",
    spend: 1000,
    impressions: 100_000,
    clicks: 2000,
    conversions: 80,
    revenue: 3200,
  },
  {
    date: "2026-09-02",
    platform: "小红书",
    campaign: "B",
    creative: "C2",
    spend: 500,
    impressions: 50_000,
    clicks: 900,
    conversions: 27,
    revenue: 1200,
  },
];

describe("KPI formulas", () => {
  it("computes CTR, CPC, CVR, CPA and ROAS with the documented formulas", () => {
    expect(calcCtr(2000, 100_000)).toBeCloseTo(0.02, 8);
    expect(calcCpc(1000, 2000)).toBeCloseTo(0.5, 8);
    expect(calcCvr(80, 2000)).toBeCloseTo(0.04, 8);
    expect(calcCpa(1000, 80)).toBeCloseTo(12.5, 8);
    expect(calcRoas(3200, 1000)).toBeCloseTo(3.2, 8);
  });

  it("guards every division against zero instead of returning NaN or Infinity", () => {
    expect(calcCtr(10, 0)).toBe(0);
    expect(calcCpc(10, 0)).toBe(0);
    expect(calcCvr(10, 0)).toBe(0);
    expect(calcCpa(10, 0)).toBe(0);
    expect(calcRoas(10, 0)).toBe(0);
    expect(safeDivide(1, 0, -1)).toBe(-1);
  });

  it("handles non numeric / non finite input", () => {
    expect(safeDivide(Number.NaN, 2)).toBe(0);
    expect(safeDivide(2, Number.NaN)).toBe(0);
    expect(safeDivide(Number.POSITIVE_INFINITY, 2)).toBe(0);
    expect(calcRoas(100, Number.NaN)).toBe(0);
  });

  it("aggregates rows and derives metrics from the aggregated totals", () => {
    const metrics = computeMetrics(rows);
    expect(metrics.spend).toBe(1500);
    expect(metrics.impressions).toBe(150_000);
    expect(metrics.clicks).toBe(2900);
    expect(metrics.conversions).toBe(107);
    expect(metrics.revenue).toBe(4400);
    expect(metrics.ctr).toBeCloseTo(2900 / 150_000, 10);
    expect(metrics.cpc).toBeCloseTo(1500 / 2900, 10);
    expect(metrics.cvr).toBeCloseTo(107 / 2900, 10);
    expect(metrics.cpa).toBeCloseTo(1500 / 107, 10);
    expect(metrics.roas).toBeCloseTo(4400 / 1500, 10);
  });

  it("returns zeroed metrics for an empty dataset", () => {
    const metrics = computeMetrics([]);
    expect(metrics).toMatchObject({ spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });
    expect(Object.values(metrics).every((value) => Number.isFinite(value))).toBe(true);
  });

  it("formats metric values for the UI", () => {
    expect(formatMetricValue("ctr", 0.0177)).toBe("1.77%");
    expect(formatMetricValue("cpc", 1.4916)).toBe("¥1.49");
    expect(formatMetricValue("roas", 3.12)).toBe("3.12");
    expect(formatMetricValue("spend", 128_600)).toBe("¥128,600");
    expect(formatMetricValue("impressions", 4_860_000)).toBe("486.0万");
  });
});
