import { describe, expect, it } from "vitest";

import { contextToPromptPayload } from "@/lib/ai/context";
import { demoFor } from "@/lib/ai/runner";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";
import { buildDemoExperiments } from "@/lib/demo-data";
import { evaluateExperiment, type VariantMetrics } from "@/lib/experiments";
import { PROMPT_LIBRARY } from "@/lib/prompts";
import type { AgentId } from "@/types";

import { buildTestContext } from "./helpers/context";

const context = buildTestContext();
const AGENTS = Object.keys(AGENT_SCHEMAS) as AgentId[];

/** 把模拟数据说成既成事实的表述，任何 AI 输出里都不允许出现。 */
const BANNED_PHRASES = [
  "已完成实验",
  "实验已完成",
  "已验证",
  "实测验证",
  "实际提升",
  "真实投放验证",
  "真实用户实验",
  "收入增长",
  "营收提升",
  "带来 ",
];

const DEMO_QUALIFIERS = ["模拟", "Demo", "demo"];

function payloadFor(agent: AgentId) {
  return demoFor(agent, {
    context,
    question: "最近 ROAS 为什么下降？",
    contentSelection: {
      platform: "小红书",
      contentType: "种草",
      goal: "转化",
      topic: "熬夜修护",
      audience: context.personas[0]?.name ?? "熬夜型都市新人",
    },
    creativeSelection: { platform: "抖音", objective: "转化", audience: "23 岁熬夜女性", theme: "夜间修护" },
  });
}

describe("prompt 层：模拟数据表述规范", () => {
  it("把数据真实性规范追加到全部 7 个 Agent 的 Prompt", () => {
    expect(PROMPT_LIBRARY).toHaveLength(7);
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.body).toContain("数据真实性与表述规范");
      expect(template.body).toContain("模拟实验结果");
      expect(template.body).toContain("Demo 数据显示");
      expect(template.body).toContain("基于模拟数据推演");
      expect(template.body).toContain("已完成实验");
      expect(template.body).toContain("需要真实数据验证");
      expect(template.body).toContain("基于上传的投放数据");
    });
  });

  it("禁止 AI 声称真实商业成绩与真实实验结论", () => {
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.body).toMatch(/禁止[\s\S]*真实投放/);
      expect(template.body).toMatch(/禁止[\s\S]*收入增长|禁止[\s\S]*真实商业成绩/);
      expect(template.body).toContain("running / completed");
    });
  });
});

describe("Demo 引擎输出：不能把模拟说成既成事实", () => {
  it("7 个 Agent 的输出都带模拟数据口径，且不含风险表述", () => {
    AGENTS.forEach((agent) => {
      const text = JSON.stringify(payloadFor(agent));
      expect(DEMO_QUALIFIERS.some((qualifier) => text.includes(qualifier))).toBe(true);
      BANNED_PHRASES.forEach((phrase) => {
        expect(text, `${agent} 不应包含「${phrase}」`).not.toContain(phrase);
      });
    });
  });

  it("投放分析与增长顾问结论以数据口径前缀开头", () => {
    const campaign = payloadFor("performance_analyst") as { diagnosis: string; mainReason: string };
    expect(campaign.diagnosis.startsWith("（Demo / 模拟业务数据）")).toBe(true);
    expect(campaign.mainReason.startsWith("（Demo / 模拟业务数据）")).toBe(true);

    const advice = payloadFor("growth_advisor") as { diagnosis: string; mainReason: string };
    expect(advice.diagnosis.startsWith("（Demo / 模拟业务数据）")).toBe(true);
    expect(advice.mainReason.startsWith("（Demo / 模拟业务数据）")).toBe(true);
  });

  it("周报每个章节都标明 Demo 口径", () => {
    const report = payloadFor("report_writer") as {
      executiveSummary: string;
      performance: string;
      audience: string;
      content: string;
      campaign: string;
      outlook: string;
    };
    [report.executiveSummary, report.performance, report.audience, report.content, report.campaign].forEach(
      (section) => {
        expect(section.startsWith("（Demo / 模拟业务数据）")).toBe(true);
      },
    );
    expect(report.outlook).toContain("模拟业务数据");
  });
});

describe("实验数据字段与结论表述", () => {
  it("预置实验文案改写为模拟口径，但实验数据本身保留不变", () => {
    const experiments = buildDemoExperiments();
    expect(experiments).toHaveLength(3);

    experiments.forEach((experiment) => {
      const text = `${experiment.summary} ${experiment.aiRecommendation}`;
      expect(DEMO_QUALIFIERS.some((qualifier) => text.includes(qualifier))).toBe(true);
      BANNED_PHRASES.forEach((phrase) => {
        expect(text).not.toContain(phrase);
      });
      // 数据没有被删除：A/B 变体的指标仍然完整
      expect(experiment.variants).toHaveLength(2);
      experiment.variants.forEach((variant) => {
        expect(variant.impressions).toBeGreaterThan(0);
        expect(variant.clicks).toBeGreaterThan(0);
      });
    });

    // 之前会误导的那条文案的具体指标必须保持原值（只改表述，不改数据）
    const priceExperiment = experiments.find((experiment) => experiment.name.includes("价格解释"));
    expect(priceExperiment?.variants[1].conversions).toBe(214);
    expect(priceExperiment?.variants[0].conversions).toBe(176);
  });

  it("统计检验生成的结论带模拟口径，且不再出现「实际提升」", () => {
    const [a, b] = buildDemoExperiments()[0].variants;
    const toVariant = (label: string, variant: typeof a): VariantMetrics => ({
      label,
      name: variant.name,
      description: variant.description,
      impressions: variant.impressions,
      clicks: variant.clicks,
      conversions: variant.conversions,
      spend: variant.spend,
      revenue: variant.revenue,
    });

    const evaluation = evaluateExperiment(toVariant("A", a), toVariant("B", b), "cvr");
    expect(evaluation.recommendation).toContain("基于模拟数据（Demo 数据集）");
    expect(evaluation.recommendation).toContain("模拟实验");
    expect(evaluation.recommendation).not.toContain("实际提升");
    BANNED_PHRASES.forEach((phrase) => {
      expect(evaluation.recommendation).not.toContain(phrase);
    });
  });

  it("送进模型的业务上下文显式标注了数据来源与模拟属性", () => {
    const payload = contextToPromptPayload({ context, question: "test" }) as unknown as {
      dataSource: { kind: string; simulated: boolean; notice: string };
      experiments: Array<{ simulated: boolean; statusNote: string; summary: string }>;
    };

    expect(payload.dataSource.kind).toBe("demo");
    expect(payload.dataSource.simulated).toBe(true);
    expect(payload.dataSource.notice).toContain("模拟");
    expect(payload.experiments.length).toBeGreaterThan(0);
    payload.experiments.forEach((experiment) => {
      expect(experiment.simulated).toBe(true);
      expect(experiment.statusNote).toContain("模拟实验");
    });
  });

  it("上传数据集时改用「基于上传的投放数据」口径", () => {
    const uploadContext = {
      ...context,
      dataSource: { kind: "upload" as const, label: "上传数据集：demo.csv", rows: 120 },
    };
    const payload = contextToPromptPayload({ context: uploadContext }) as unknown as {
      dataSource: { simulated: boolean; notice: string };
    };
    expect(payload.dataSource.simulated).toBe(false);
    expect(payload.dataSource.notice).toContain("基于上传的投放数据");
  });
});
