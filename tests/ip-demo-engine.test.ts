import { describe, expect, it } from "vitest";

import { demoContentPlan, demoIpAnalysis, demoScriptBundle, demoShotPlan, demoTopicStrategy, demoTrendResearch } from "@/lib/ip/demo-engine";
import { normalizeIpInput, resolveIndustry } from "@/lib/ip/input";
import { computeOverallScore } from "@/lib/ip/scoring";
import type { SearchResult, TrendSearchStatus } from "@/lib/ip/search";
import {
  ContentPlanSchema,
  IpAnalysisSchema,
  ScriptBundleSchema,
  ShotPlanSchema,
  TopicStrategySchema,
  TrendResearchSchema,
} from "@/lib/ip/schemas";

const CASES = [
  { raw: { name: "伊宁房产王总" }, expected: "realestate" as const },
  { raw: { name: "上海咖啡店老板" }, expected: "cafe" as const },
  { raw: { name: "健身新手女生" }, expected: "fitness" as const },
];

const NO_SEARCH: TrendSearchStatus = {
  performed: false,
  provider: "none",
  queries: [],
  resultCount: 0,
  note: "未配置联网搜索。",
};

describe("IP demo engine — 三个不同领域必须产出明显不同的内容", () => {
  it("行业识别与 IP 分析随输入改变", () => {
    const identities = CASES.map((item) => {
      const input = normalizeIpInput(item.raw);
      const industryKey = resolveIndustry(input);
      expect(industryKey).toBe(item.expected);
      const analysis = demoIpAnalysis(input, industryKey);
      expect(IpAnalysisSchema.safeParse(analysis).success).toBe(true);
      return analysis.identity;
    });

    // 三个 IP 的身份描述必须互不相同
    expect(new Set(identities).size).toBe(3);
  });

  it("选题池 / Hook / 脚本 / 内容矩阵在三个 IP 之间互不相同", () => {
    const signatures = CASES.map((item) => {
      const input = normalizeIpInput(item.raw);
      const key = resolveIndustry(input);
      const analysis = demoIpAnalysis(input, key);
      const trends = demoTrendResearch(input, key, [], NO_SEARCH);
      const strategy = demoTopicStrategy(input, key, analysis, trends);
      const script = demoScriptBundle(input, key, strategy.topics[0]);
      const plan = demoContentPlan(input, key, strategy.topics);
      return {
        topics: strategy.topics.map((topic) => topic.title).join("|"),
        hook: strategy.topics[0].hook,
        scriptHook: script.hooks[0].text,
        columns: plan.matrix.map((column) => column.column).join("|"),
      };
    });

    expect(new Set(signatures.map((item) => item.topics)).size).toBe(3);
    expect(new Set(signatures.map((item) => item.hook)).size).toBe(3);
    expect(new Set(signatures.map((item) => item.scriptHook)).size).toBe(3);
    expect(new Set(signatures.map((item) => item.columns)).size).toBe(3);
  });

  it("选题池 ≥ 10、评分可复核、TOP 5 由系统计算", () => {
    CASES.forEach((item) => {
      const input = normalizeIpInput(item.raw);
      const key = resolveIndustry(input);
      const analysis = demoIpAnalysis(input, key);
      const trends = demoTrendResearch(input, key, [], NO_SEARCH);
      const strategy = demoTopicStrategy(input, key, analysis, trends);

      expect(TopicStrategySchema.safeParse(strategy).success).toBe(true);
      expect(strategy.topics.length).toBeGreaterThanOrEqual(10);
      expect(strategy.top5.length).toBe(5);

      strategy.topics.forEach((topic) => {
        expect(computeOverallScore(topic.scores)).toBeGreaterThan(0);
        // 每个维度都要有依据，不能只给数字
        Object.values(topic.scoreBasis).forEach((basis) => expect(basis.length).toBeGreaterThan(0));
        expect(topic.potentialStars).toBeGreaterThanOrEqual(1);
        expect(topic.potentialStars).toBeLessThanOrEqual(5);
        // 禁止承诺效果：不得声称一定会爆
        expect(topic.potentialReason).not.toMatch(/一定爆|必爆|保证爆|必然爆|保证会火/);
      });

      // TOP 5 必须是选题池里真实存在的标题
      const titles = new Set(strategy.topics.map((topic) => topic.title));
      strategy.top5.forEach((entry) => expect(titles.has(entry.title)).toBe(true));
    });
  });

  it("脚本包含 3 个 Hook、30/60/90 秒版本、标题覆盖 5 类、封面与评论引导", () => {
    CASES.forEach((item) => {
      const input = normalizeIpInput(item.raw);
      const key = resolveIndustry(input);
      const analysis = demoIpAnalysis(input, key);
      const trends = demoTrendResearch(input, key, [], NO_SEARCH);
      const strategy = demoTopicStrategy(input, key, analysis, trends);
      const script = demoScriptBundle(input, key, strategy.topics[0]);

      expect(ScriptBundleSchema.safeParse(script).success).toBe(true);
      expect(script.hooks.length).toBeGreaterThanOrEqual(3);
      expect(script.scripts.s30.duration).toBe(30);
      expect(script.scripts.s60.duration).toBe(60);
      expect(script.scripts.s90.duration).toBe(90);
      expect(script.titles.length).toBeGreaterThanOrEqual(10);
      expect(new Set(script.titles.map((title) => title.type)).size).toBe(5);
      expect(script.covers.length).toBeGreaterThanOrEqual(5);
      expect(script.commentPrompts.length).toBeGreaterThanOrEqual(5);

      // 口播稿不能出现明显的 AI 文章语言
      const allLines = [
        ...script.scripts.s30.lines,
        ...script.scripts.s60.lines,
        ...script.scripts.s90.lines,
      ].map((line) => line.text).join("\n");
      ["首先", "其次", "综上所述", "总而言之"].forEach((word) => {
        expect(allLines).not.toContain(word);
      });
    });
  });

  it("镜头方案包含镜头表与拍摄清单", () => {
    const input = normalizeIpInput({ name: "伊宁房产王总" });
    const key = resolveIndustry(input);
    const analysis = demoIpAnalysis(input, key);
    const trends = demoTrendResearch(input, key, [], NO_SEARCH);
    const strategy = demoTopicStrategy(input, key, analysis, trends);
    const script = demoScriptBundle(input, key, strategy.topics[0]);
    const shot = demoShotPlan(input, key, strategy.topics[0], script);

    expect(ShotPlanSchema.safeParse(shot).success).toBe(true);
    expect(shot.shotList.length).toBeGreaterThanOrEqual(4);
    expect(shot.mustShoot.length).toBeGreaterThanOrEqual(5);
  });

  it("内容矩阵 ≥ 4 个栏目，每栏目 10 个选题；7 天计划混合内容类型", () => {
    CASES.forEach((item) => {
      const input = normalizeIpInput(item.raw);
      const key = resolveIndustry(input);
      const analysis = demoIpAnalysis(input, key);
      const trends = demoTrendResearch(input, key, [], NO_SEARCH);
      const strategy = demoTopicStrategy(input, key, analysis, trends);
      const plan = demoContentPlan(input, key, strategy.topics);

      expect(ContentPlanSchema.safeParse(plan).success).toBe(true);
      expect(plan.matrix.length).toBeGreaterThanOrEqual(4);
      plan.matrix.forEach((column) => expect(column.topics.length).toBe(10));
      expect(plan.sevenDay.length).toBe(7);
      // 7 天不能全是同一种内容
      expect(new Set(plan.sevenDay.map((day) => day.bucket)).size).toBeGreaterThan(1);
    });
  });

  it("没有联网来源时明确说明，且不把推测写成事实", () => {
    const input = normalizeIpInput({ name: "上海咖啡店老板" });
    const key = resolveIndustry(input);
    const trends = demoTrendResearch(input, key, [], NO_SEARCH);

    expect(TrendResearchSchema.safeParse(trends).success).toBe(true);
    expect(trends.reliabilityNote).toContain("当前没有找到足够可靠的热点信息");
    expect(trends.hotTopics.length).toBeGreaterThan(0);
    trends.hotTopics.forEach((topic) => {
      expect(topic.label).toBe("AI推测");
      expect(topic.sourceUrl).toBe("");
    });
  });

  it("有联网搜索结果时带上来源，并把有来源的信息标为事实", () => {
    const input = normalizeIpInput({ name: "上海咖啡店老板" });
    const key = resolveIndustry(input);
    const results: SearchResult[] = [
      { title: "上海咖啡市场观察", url: "https://example.com/a", snippet: "上海咖啡门店数量持续变化。", source: "Tavily" },
    ];
    const status: TrendSearchStatus = {
      performed: true,
      provider: "tavily",
      queries: ["上海 咖啡店 市场"],
      resultCount: 1,
      note: "已通过 tavily 联网搜索。",
    };
    const trends = demoTrendResearch(input, key, results, status);
    expect(trends.searchPerformed).toBe(true);
    const factual = trends.hotTopics.filter((topic) => topic.label === "事实");
    expect(factual.length).toBeGreaterThan(0);
    expect(factual[0].sourceUrl).toBe("https://example.com/a");
  });
});
