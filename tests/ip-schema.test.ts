import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { requiredFieldChecklist, stripUnsupportedForStrict, zodToJsonSchema, zodToStructuredOutputFormat } from "@/lib/ai/json-schema";
import { demoContentPlan, demoIpAnalysis, demoScriptBundle, demoShotPlan, demoTopicStrategy, demoTrendResearch } from "@/lib/ip/demo-engine";
import { normalizeIpInput, resolveIndustry } from "@/lib/ip/input";
import { runIpAgent } from "@/lib/ip/runner";
import { IP_AGENT_SCHEMAS, type IpAgentId } from "@/lib/ip/schemas";
import type { TrendSearchStatus } from "@/lib/ip/search";

const IP_AGENTS = Object.keys(IP_AGENT_SCHEMAS) as IpAgentId[];

const NO_SEARCH: TrendSearchStatus = {
  performed: false,
  provider: "none",
  queries: [],
  resultCount: 0,
  note: "未配置联网搜索。",
};

describe("IP agent schemas — 与 MORI 主体一致的严格结构化输出", () => {
  it("发给 provider 的 JSON Schema 不含 strict 模式不支持的字段", () => {
    IP_AGENTS.forEach((agent) => {
      const payload = JSON.stringify(zodToStructuredOutputFormat(IP_AGENT_SCHEMAS[agent], agent));
      ["minimum", "maximum", "minLength", "maxLength", "pattern", "format", "default"].forEach((keyword) => {
        expect(payload).not.toContain(`"${keyword}"`);
      });
      expect(payload).toContain('"additionalProperties":false');
      expect(payload).toContain('"strict":true');
    });
  });

  it("必填字段清单覆盖嵌套结构，保证 DeepSeek 的 json_object 模式也能拿到完整契约", () => {
    const checklist = requiredFieldChecklist(IP_AGENT_SCHEMAS.ip_topic_strategist);
    const joined = checklist.join("\n");
    expect(joined).toContain("topics");
    expect(joined).toContain("scores");
    expect(joined).toContain("scoreBasis");
    expect(checklist.length).toBeGreaterThan(10);
  });

  it("stripUnsupportedForStrict 会移除约束但保留结构与描述", () => {
    const stripped = stripUnsupportedForStrict({ type: "number", minimum: 0, maximum: 100, description: "keep" });
    expect(stripped).toEqual({ type: "number", description: "keep" });
    const topicSchema = zodToJsonSchema(IP_AGENT_SCHEMAS.ip_topic_strategist) as { required: string[] };
    expect(topicSchema.required).toContain("topics");
  });
});

describe("IP demo outputs — 全部通过各自的 zod 校验", () => {
  const input = normalizeIpInput({ name: "伊宁房产王总" });
  const industryKey = resolveIndustry(input);
  const analysis = demoIpAnalysis(input, industryKey);
  const trends = demoTrendResearch(input, industryKey, [], NO_SEARCH);
  const strategy = demoTopicStrategy(input, industryKey, analysis, trends);
  const script = demoScriptBundle(input, industryKey, strategy.topics[0]);
  const shot = demoShotPlan(input, industryKey, strategy.topics[0], script);
  const plan = demoContentPlan(input, industryKey, strategy.topics);

  const cases: Array<[IpAgentId, unknown]> = [
    ["ip_analyst", analysis],
    ["ip_trend_researcher", trends],
    ["ip_topic_strategist", strategy],
    ["ip_script_writer", script],
    ["ip_shot_planner", shot],
    ["ip_content_planner", plan],
  ];

  cases.forEach(([agent, data]) => {
    it(`${agent} 输出符合 ${IP_AGENT_SCHEMAS[agent].constructor.name}`, () => {
      const parsed = IP_AGENT_SCHEMAS[agent].safeParse(data);
      expect(parsed.success).toBe(true);
    });
  });
});

describe("IP runner — 无 API Key 时回退到本地结构化引擎", () => {
  const originalDemoMode = process.env.DEMO_MODE;

  beforeEach(() => {
    process.env.DEMO_MODE = "true";
  });

  afterEach(() => {
    if (originalDemoMode === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = originalDemoMode;
  });

  it("runIpAgent 在 Demo 模式下返回 mode=demo 且结构合法", async () => {
    const input = normalizeIpInput({ name: "健身新手女生" });
    const industryKey = resolveIndustry(input);
    const result = await runIpAgent("ip_analyst", { input, industryKey });

    expect(result.meta.mode).toBe("demo");
    expect(result.meta.agent).toBe("ip_analyst");
    expect(IP_AGENT_SCHEMAS.ip_analyst.safeParse(result.data).success).toBe(true);
  });
});
