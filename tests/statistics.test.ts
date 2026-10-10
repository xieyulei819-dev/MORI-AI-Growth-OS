import { describe, expect, it } from "vitest";

import { requiredSampleSize, twoProportionZTest } from "@/lib/statistics";

describe("experiment statistics", () => {
  it("detects a significant difference between two rates", () => {
    const test = twoProportionZTest(600, 10_000, 780, 10_000);
    expect(test.significant).toBe(true);
    expect(test.winner).toBe("B");
    expect(test.lift).toBeCloseTo(30, 0);
    expect(test.pValue).toBeLessThan(0.01);
  });

  it("treats a small difference as noise", () => {
    const test = twoProportionZTest(500, 10_000, 520, 10_000);
    expect(test.significant).toBe(false);
    expect(test.winner).toBe("tie");
    expect(test.note).toContain("未达显著");
  });

  it("never divides by zero when a variant has no traffic", () => {
    const test = twoProportionZTest(0, 0, 10, 100);
    expect(test.rateA).toBe(0);
    expect(Number.isFinite(test.pValue)).toBe(true);
    expect(test.significant).toBe(false);
    expect(test.note).toContain("样本不足");
  });

  it("computes a required sample size for a detectable lift", () => {
    const size = requiredSampleSize(0.04, 0.15);
    expect(size).toBeGreaterThan(5_000);
    expect(requiredSampleSize(0, 0.1)).toBeNull();
    expect(requiredSampleSize(0.04, 0)).toBeNull();
  });
});
