import { describe, expect, it } from "vitest";

import {
  allocateExact,
  balanceShares,
  buildDemoAudienceMetrics,
  buildDemoMetrics,
  DEMO_CREATIVE_SPECS,
  DEMO_TARGETS,
  solveCreativeShares,
  TARGET_CTR,
} from "@/lib/demo-data";
import { compareWindows, creativeScorecard, dailySeries, deriveSignals, groupPerformance } from "@/lib/analytics";
import { computeMetrics } from "@/lib/metrics";

const rows = buildDemoMetrics();
const totals = computeMetrics(rows);

describe("demo dataset", () => {
  it("hits every account-level KPI target quoted in the product brief", () => {
    expect(totals.spend).toBe(DEMO_TARGETS.spend);
    expect(totals.impressions).toBe(DEMO_TARGETS.impressions);
    expect(totals.clicks).toBe(DEMO_TARGETS.clicks);
    expect(totals.conversions).toBe(DEMO_TARGETS.conversions);
    expect(totals.revenue).toBe(DEMO_TARGETS.revenue);
    expect(totals.ctr).toBeCloseTo(0.0177, 4);
    expect(totals.cpc).toBeCloseTo(1.49, 2);
    expect(totals.cpa).toBeCloseTo(39.69, 2);
    expect(totals.roas).toBeCloseTo(3.12, 2);
  });

  it("covers 30 days, 10 creatives, 3 platforms and 5 campaigns", () => {
    expect(dailySeries(rows)).toHaveLength(30);
    expect(new Set(rows.map((row) => row.creative)).size).toBe(10);
    expect(new Set(rows.map((row) => row.platform)).size).toBe(3);
    expect(new Set(rows.map((row) => row.campaign)).size).toBe(5);
    expect(rows.length).toBeGreaterThanOrEqual(100);
  });

  it("reproduces the benchmark CTR / ROAS of the quoted creatives", () => {
    const scorecards = creativeScorecard(rows);
    const byName = new Map(scorecards.map((item) => [item.name, item]));

    const night = byName.get("熬夜党晚间修护");
    expect(night?.ctr).toBeCloseTo(0.0241, 3);
    expect(night?.roas).toBeCloseTo(4.26, 1);

    const student = byName.get("学生党护肤预算");
    expect(student?.ctr).toBeCloseTo(0.0218, 3);
    expect(student?.roas).toBeCloseTo(3.91, 1);

    const challenge = byName.get("30天肌肤稳定挑战");
    expect(challenge?.ctr).toBeCloseTo(0.0192, 3);
    expect(challenge?.roas).toBeCloseTo(3.64, 1);

    const ingredient = byName.get("成分党深度解析");
    expect(ingredient?.ctr).toBeCloseTo(0.0121, 3);
    expect(ingredient?.roas).toBeCloseTo(2.13, 1);
  });

  it("keeps the ranking realistic: best creative leads on both CTR and ROAS", () => {
    const scorecards = creativeScorecard(rows);
    expect(scorecards[0].name).toBe("熬夜党晚间修护");
    const worst = scorecards[scorecards.length - 1];
    expect(worst.roas).toBeLessThan(totals.roas);
  });

  it("builds the last-week efficiency drop the AI Advisor talks about", () => {
    const comparison = compareWindows(rows, 7);
    expect(comparison).not.toBeNull();
    if (!comparison) return;
    expect(comparison.current.roas).toBeLessThan(comparison.previous.roas);
    expect(comparison.deltas.roas).toBeLessThan(-5);
    expect(comparison.current.cvr).toBeLessThan(comparison.previous.cvr);
    expect(Math.abs(comparison.deltas.ctr)).toBeLessThan(Math.abs(comparison.deltas.cvr));
    expect(comparison.current.roas).toBeGreaterThan(2.3);
    expect(comparison.current.roas).toBeLessThan(3.2);
  });

  it("produces a genuine audience re-cut of the same totals", () => {
    const audienceRows = buildDemoAudienceMetrics();
    const audienceTotals = computeMetrics(
      audienceRows.map((row) => ({
        date: row.date,
        platform: "全渠道",
        campaign: "全渠道",
        creative: row.segment,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        revenue: row.revenue,
      })),
    );
    expect(audienceTotals.impressions).toBe(DEMO_TARGETS.impressions);
    expect(audienceTotals.clicks).toBe(DEMO_TARGETS.clicks);
    expect(audienceTotals.conversions).toBe(DEMO_TARGETS.conversions);
    expect(audienceTotals.revenue).toBeCloseTo(DEMO_TARGETS.revenue, -1);

    const segments = groupPerformance(
      audienceRows.map((row) => ({
        date: row.date,
        platform: "全渠道",
        campaign: "全渠道",
        creative: row.segment,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        revenue: row.revenue,
      })),
      "creative",
    );
    const young = segments.find((item) => item.name === "18–24 岁女性");
    const mature = segments.find((item) => item.name === "25–30 岁女性");
    expect(young && mature).toBeTruthy();
    expect(young!.ctr).toBeGreaterThan(mature!.ctr);
    expect(young!.cvr).toBeLessThan(mature!.cvr);
  });

  it("derives signals with concrete evidence strings", () => {
    const audienceRows = buildDemoAudienceMetrics().map((row) => ({
      date: row.date,
      platform: "全渠道",
      campaign: "全渠道",
      creative: row.segment,
      segment: row.segment,
      age: row.age,
      gender: row.gender,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      revenue: row.revenue,
    }));
    const signals = deriveSignals(rows, audienceRows);
    expect(signals.insights.length).toBeGreaterThanOrEqual(2);
    expect(signals.risks.length).toBeGreaterThanOrEqual(1);
    expect(signals.recommendations.length).toBeGreaterThanOrEqual(1);
    signals.insights.forEach((signal) => {
      expect(signal.evidence.length).toBeGreaterThan(5);
      expect(signal.confidence).toBeGreaterThan(0);
      expect(signal.confidence).toBeLessThanOrEqual(100);
    });
  });
});

describe("allocation helpers", () => {
  it("allocates integers that always sum to the requested total", () => {
    const parts = allocateExact(1000, [1, 1, 1, 7]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(parts[3]).toBe(700);

    const awkward = allocateExact(7, [0.333, 0.333, 0.334]);
    expect(awkward.reduce((a, b) => a + b, 0)).toBe(7);
  });

  it("returns zeroes instead of throwing on invalid input", () => {
    expect(allocateExact(100, [])).toEqual([]);
    expect(allocateExact(0, [1, 2])).toEqual([0, 0]);
    expect(allocateExact(10, [0, 0])).toEqual([0, 0]);
  });

  it("solves impression shares so the weighted CTR matches the account target", () => {
    const shares = solveCreativeShares();
    const weighted = DEMO_CREATIVE_SPECS.reduce((acc, spec, index) => acc + spec.ctr * shares[index], 0);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 8);
    expect(weighted).toBeCloseTo(TARGET_CTR, 6);
  });

  it("falls back to a proportional nudge when the closed form is infeasible", () => {
    const shares = balanceShares(
      [
        { key: "a", ctr: 0.05 },
        { key: "b", ctr: 0.04 },
        { key: "c", ctr: 0.03 },
      ],
      [0.34, 0.33, 0.33],
      0.01,
      "b",
      "c",
    );
    expect(shares.every((share) => Number.isFinite(share) && share > 0)).toBe(true);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });
});
