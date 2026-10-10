import { describe, expect, it } from "vitest";
import { z } from "zod";

import { zodToJsonSchema } from "@/lib/ai/json-schema";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";
import { demoFor, runAgent } from "@/lib/ai/runner";
import { AiProviderError } from "@/lib/ai/client";
import { PROMPT_LIBRARY } from "@/lib/prompts";
import type { AgentId } from "@/types";
import { buildTestContext } from "./helpers/context";

const context = buildTestContext();
const AGENTS = Object.keys(AGENT_SCHEMAS) as AgentId[];

describe("structured output contract", () => {
  it("defines a prompt template and a schema for every agent", () => {
    expect(PROMPT_LIBRARY).toHaveLength(AGENTS.length);
    AGENTS.forEach((agent) => {
      expect(PROMPT_LIBRARY.some((template) => template.agent === agent)).toBe(true);
    });
  });

  it("accepts the demo engine output for all 7 agents (structure test 1/7 → 7/7)", () => {
    AGENTS.forEach((agent) => {
      const output = demoFor(agent, {
        context,
        question: "最近 ROAS 为什么下降？",
        contentSelection: {
          platform: "小红书",
          contentType: "种草",
          goal: "转化",
          topic: "熬夜修护",
          audience: "熬夜型新人",
        },
        creativeSelection: { platform: "抖音", objective: "转化", audience: "23 岁熬夜女性", theme: "夜间修护" },
      });
      const parsed = AGENT_SCHEMAS[agent].safeParse(output);
      if (!parsed.success) {
        throw new Error(`${agent} demo output failed validation: ${parsed.error.message}`);
      }
      expect(parsed.success).toBe(true);
    });
  });

  it("produces OpenAI strict-compatible JSON Schema (additionalProperties, required)", () => {
    const schema = zodToJsonSchema(AGENT_SCHEMAS.market_analyst) as {
      type: string;
      additionalProperties: boolean;
      required: string[];
      properties: Record<string, { type: string; items?: { type: string } }>;
    };
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toContain("insights");
    expect(schema.required).toContain("recommendations");
    expect(schema.properties.insights.type).toBe("array");
    expect(schema.properties.insights.items?.type).toBe("object");
  });

  it("rejects invalid AI payloads instead of rendering them", () => {
    const invalidOutputs: Array<[AgentId, unknown]> = [
      ["market_analyst", { summary: "x" }],
      ["audience_analyst", { summary: "x", personas: [], opportunityCards: {} }],
      ["content_strategist", { summary: "x", xiaohongshu: { titles: "not-an-array" } }],
      ["creative_strategist", { summary: "x", directions: [{ code: "A" }] }],
      ["performance_analyst", { summary: "x", hypotheses: [{ hypothesis: "h", evidence: "e", confidence: "high" }] }],
      ["growth_advisor", { question: "q", diagnosis: "d" }],
      ["report_writer", { title: "t", executiveSummary: "s" }],
    ];

    invalidOutputs.forEach(([agent, payload]) => {
      const parsed = AGENT_SCHEMAS[agent].safeParse(payload);
      expect(parsed.success).toBe(false);
    });
  });

  it("rejects out-of-range confidence values", () => {
    const parsed = AGENT_SCHEMAS.growth_advisor.safeParse({
      ...demoFor("growth_advisor", { context, question: "test" }),
      hypotheses: [{ hypothesis: "h", evidence: "e", confidence: 999 }],
    });
    expect(parsed.success).toBe(false);
  });

  it("falls back to the demo engine when the provider throws", async () => {
    const failingProvider = async () => {
      throw new AiProviderError("HTTP_ERROR", "provider exploded", 500);
    };

    const previousDemoMode = process.env.DEMO_MODE;
    const previousKey = process.env.OPENAI_API_KEY;
    process.env.DEMO_MODE = "false";
    process.env.OPENAI_API_KEY = "test-key";

    try {
      const result = await runAgent(
        "performance_analyst",
        { context },
        { callProvider: failingProvider as never },
      );

      expect(result.meta.mode).toBe("fallback");
      expect(result.meta.warning).toContain("HTTP_ERROR");
      expect(AGENT_SCHEMAS.performance_analyst.safeParse(result.data).success).toBe(true);
    } finally {
      process.env.DEMO_MODE = previousDemoMode;
      process.env.OPENAI_API_KEY = previousKey;
    }
  });

  it("uses demo mode when no API key is configured, even with DEMO_MODE=false", async () => {
    const previousDemoMode = process.env.DEMO_MODE;
    const previousKey = process.env.OPENAI_API_KEY;
    process.env.DEMO_MODE = "false";
    process.env.OPENAI_API_KEY = "";

    try {
      const result = await runAgent("market_analyst", { context });
      expect(result.meta.mode).toBe("demo");
      expect(result.meta.warning).toContain("OPENAI_API_KEY");
    } finally {
      process.env.DEMO_MODE = previousDemoMode;
      process.env.OPENAI_API_KEY = previousKey;
    }
  });
});

describe("prompt library", () => {
  it("keeps the shared compliance rules inside every prompt", () => {
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.body).toContain("Demo / 模拟业务数据");
      expect(template.body).toContain("JSON Schema");
      expect(template.version).toMatch(/^v\d+\.\d+$/);
      expect(template.body.length).toBeGreaterThan(300);
    });
  });

  it("never advertises a single mega prompt", () => {
    const agents = new Set(PROMPT_LIBRARY.map((template) => template.agent));
    expect(agents.size).toBe(PROMPT_LIBRARY.length);
  });

  it("documents a schema name per agent", () => {
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.outputSchema).toMatch(/Schema$/);
    });
    expect(z.object({}).safeParse({}).success).toBe(true);
  });
});
