import { describe, expect, it } from "vitest";

import { fillTemplate, detectIndustry } from "@/lib/ip/knowledge";
import {
  computeOverallScore,
  estimateShootCost,
  explainScoreFormula,
  normalizeScores,
  pickTodayTopic,
  SCORE_KEYS,
  SCORE_WEIGHTS,
  starsForScore,
} from "@/lib/ip/scoring";

describe("IP 选题评分模型", () => {
  it("权重合计 100%，且综合分由固定公式计算", () => {
    const total = SCORE_KEYS.reduce((acc, key) => acc + SCORE_WEIGHTS[key], 0);
    expect(Number(total.toFixed(6))).toBe(1);

    const full = computeOverallScore({ hotspot: 100, pain: 100, ipFit: 100, differentiation: 100, spread: 100, commercial: 100 });
    expect(full).toBe(100);
    expect(computeOverallScore({ hotspot: 0, pain: 0, ipFit: 0, differentiation: 0, spread: 0, commercial: 0 })).toBe(0);

    // 手算一遍：热点80×0.15 + 痛点90×0.25 + 匹配85×0.2 + 差异化70×0.15 + 传播75×0.15 + 商业60×0.1 = 78.75 → 79
    const mixed = computeOverallScore({ hotspot: 80, pain: 90, ipFit: 85, differentiation: 70, spread: 75, commercial: 60 });
    expect(mixed).toBe(79);
    expect(explainScoreFormula()).toContain("用户痛点 × 25%");
  });

  it("分数会被限制在 0-100，非法值归零", () => {
    expect(normalizeScores({ hotspot: 999, pain: -50, ipFit: Number.NaN, differentiation: 50, spread: 50, commercial: 50 })).toEqual({
      hotspot: 100,
      pain: 0,
      ipFit: 0,
      differentiation: 50,
      spread: 50,
      commercial: 50,
    });
  });

  it("星级映射与传播潜力一致", () => {
    expect(starsForScore(90)).toBe(5);
    expect(starsForScore(75)).toBe(4);
    expect(starsForScore(60)).toBe(3);
    expect(starsForScore(45)).toBe(2);
    expect(starsForScore(10)).toBe(1);
  });
});

describe("行业识别与模板填充", () => {
  it("能根据 IP 名称识别行业族", () => {
    expect(detectIndustry({ name: "伊宁房产王总" })).toBe("realestate");
    expect(detectIndustry({ name: "上海咖啡店老板" })).toBe("cafe");
    expect(detectIndustry({ name: "健身新手女生" })).toBe("fitness");
    expect(detectIndustry({ name: "张三" })).toBe("generic");
    // 行业字段优先于名称
    expect(detectIndustry({ name: "王总", industry: "咖啡店" })).toBe("cafe");
  });

  it("模板占位符会被具体 IP 信息替换", () => {
    const text = fillTemplate("在{city}做{industry}，{name}给你算笔账", {
      name: "伊宁房产王总",
      city: "伊宁",
      industry: "房产",
      product: "二手房",
      customer: "首次购房者",
    });
    expect(text).toBe("在伊宁做房产，伊宁房产王总给你算笔账");
    expect(text).not.toContain("{");
  });
});

describe("今日推荐与拍摄成本", () => {
  const base = {
    id: "t",
    title: "选题",
    painScore: 85,
    ipFitScore: 85,
    hotspotScore: 60,
    commercialScore: 80,
    spreadScore: 75,
    isTop5: true,
  };

  it("拍摄成本依据取景关键词判断", () => {
    expect(estimateShootCost("人物近景口播，手机拍摄").level).toBe("低");
    expect(estimateShootCost("外景航拍城市多地").level).toBe("高");
  });

  it("在 TOP 5 里优先选综合分高、拍摄成本低的选题", () => {
    const topics = [
      { ...base, id: "a", title: "高分高成本", overallScore: 95, creative: "外景航拍多地带客户" },
      { ...base, id: "b", title: "次高分低成本", overallScore: 90, creative: "人物近景口播 手机拍摄" },
    ];
    const pick = pickTodayTopic(topics);
    expect(pick?.topic.id).toBe("b");
    expect(pick?.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it("没有选题时返回 null", () => {
    expect(pickTodayTopic([])).toBeNull();
  });
});
