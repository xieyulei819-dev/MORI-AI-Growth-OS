import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { callStructured } from "@/lib/ai/client";
import { jsonSchemaPromptHint, requiredFieldChecklist, zodToJsonSchema } from "@/lib/ai/json-schema";
import { ContentStrategySchema } from "@/lib/ai/schemas";
import { PROMPT_LIBRARY } from "@/lib/prompts";
import type { AgentId } from "@/types";

const KEY = ["sk", "test", "not", "a", "real", "key"].join("-");

/** Same shape as the field that broke in production (nested scores object). */
const MiniSchema = z.object({
  summary: z.string().describe("必填。摘要"),
  scores: z
    .object({
      hookScore: z.number().min(0).max(100).describe("必填。Hook 分"),
      whyTest: z.string().describe("必填。为什么值得测试"),
      howToImprove: z.string().describe("必填。怎么进一步优化，必须具体"),
    })
    .describe("评分模块，三个字段全部必填"),
});

type FetchCall = { body: Record<string, unknown>; systemPrompt: string };

function mockFetch(responder: (index: number) => { status?: number; json?: unknown; text?: string }) {
  const calls: FetchCall[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      const messages = (body.messages ?? []) as Array<{ role: string; content: string }>;
      calls.push({ body, systemPrompt: messages[0]?.content ?? "" });
      const result = responder(calls.length - 1);
      const status = result.status ?? 200;
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => result.json ?? {},
        text: async () => result.text ?? "{}",
      } as unknown as Response;
    }),
  );
  return calls;
}

function completion(content: string, finishReason = "stop") {
  return { choices: [{ message: { content }, finish_reason: finishReason }] };
}

beforeEach(() => {
  process.env.DEMO_MODE = "false";
  process.env.AI_PROVIDER = "deepseek";
  process.env.DEEPSEEK_API_KEY = KEY;
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
  ["DEMO_MODE", "AI_PROVIDER", "DEEPSEEK_API_KEY", "OPENAI_API_KEY", "AI_TEMPERATURE", "AI_MAX_TOKENS", "AI_MODEL"].forEach(
    (name) => delete process.env[name],
  );
});

describe("required field contract", () => {
  it("keeps scores.howToImprove required (validation is never relaxed)", () => {
    const withoutField = ContentStrategySchema.safeParse({
      summary: "s",
      xiaohongshu: { titles: [], body: "b" },
      douyin: { hook: "h", caption: "c", script: [] },
      scores: { hookScore: 80, relevanceScore: 80, conversionScore: 80, brandFitScore: 80, overallScore: 80, whyTest: "w" },
      keywords: [],
      insights: [],
      opportunities: [],
      risks: [],
      recommendations: [],
    });
    expect(withoutField.success).toBe(false);
    if (!withoutField.success) {
      expect(withoutField.error.issues.some((issue) => issue.path.join(".") === "scores.howToImprove")).toBe(true);
    }
  });

  it("lists every required leaf field, including nested array item fields", () => {
    const checklist = requiredFieldChecklist(MiniSchema).join("\n");
    expect(checklist).toContain("scores.howToImprove");
    expect(checklist).toContain("scores.whyTest");

    const contentChecklist = requiredFieldChecklist(ContentStrategySchema).join("\n");
    expect(contentChecklist).toContain("scores.howToImprove");
    expect(contentChecklist).toContain("douyin.script[]");
    expect(contentChecklist).toContain("xiaohongshu.titles[]");
  });

  it("emits descriptions into the JSON Schema so the model sees the explanation", () => {
    const json = JSON.stringify(zodToJsonSchema(MiniSchema));
    expect(json).toContain("必填。怎么进一步优化");
    expect(json).toContain("评分模块，三个字段全部必填");
  });

  it("injects the checklist and the schema name into the json_object prompt hint", () => {
    const hint = jsonSchemaPromptHint(MiniSchema, "mori_mini");
    expect(hint).toContain("必填字段清单");
    expect(hint).toContain("scores.howToImprove");
    expect(hint).toContain("mori_mini");
    expect(hint).toContain("json");
  });

  it("tells every agent (7/7) to return every field", () => {
    expect(PROMPT_LIBRARY).toHaveLength(7);
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.body).toContain("每一个字段都必须出现");
    });
    const content = PROMPT_LIBRARY.find((template) => template.agent === "content_strategist");
    expect(content?.body).toContain("scores.howToImprove");
    expect(content?.body).toContain("7 个字段");
  });
});

describe("repair retry instead of discarding a parseable answer", () => {
  it("asks again with the exact missing field when the model omits scores.howToImprove", async () => {
    const calls = mockFetch((index) =>
      index === 0
        ? { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w"}}') }
        : { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToImprove":"把开头 3 秒换成具体场景"}}') },
    );

    const result = await callStructured({
      schema: MiniSchema,
      schemaName: "mori_mini",
      systemPrompt: "S",
      userPrompt: "U",
    });

    expect(result.mode).toBe("json_object");
    expect(result.output.scores.howToImprove).toBe("把开头 3 秒换成具体场景");
    expect(calls).toHaveLength(2);
    // the repair request must state what was wrong, and stay in json_object mode
    expect(calls[1].systemPrompt).toContain("scores.howToImprove");
    expect(calls[1].systemPrompt).toContain("缺失");
    expect((calls[1].body.response_format as { type: string }).type).toBe("json_object");
  });

  it("treats null as invalid and asks again instead of filling the value itself", async () => {
    const calls = mockFetch((index) =>
      index === 0
        ? { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToImprove":null}}') }
        : { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToImprove":"来自模型的真实内容"}}') },
    );

    const result = await callStructured({
      schema: MiniSchema,
      schemaName: "mori_mini",
      systemPrompt: "S",
      userPrompt: "U",
    });

    expect(result.output.scores.howToImprove).toBe("来自模型的真实内容");
    expect(calls.length).toBe(2);
    expect(JSON.stringify(result.output)).not.toContain("null");
  });

  it("repairs trailing commas in model JSON without touching string content", async () => {
    mockFetch(() => ({ json: completion('{"summary":"含逗号, 的文本","scores":{"hookScore":80,"whyTest":"w","howToImprove":"a, b"},}') }));

    const result = await callStructured({
      schema: MiniSchema,
      schemaName: "mori_mini",
      systemPrompt: "S",
      userPrompt: "U",
    });

    expect(result.output.summary).toBe("含逗号, 的文本");
    expect(result.output.scores.howToImprove).toBe("a, b");
  });

  it("still falls back to an error (→ demo engine) when the model never completes the contract", async () => {
    const calls = mockFetch(() => ({ json: completion('{"summary":"x","scores":{"hookScore":80}}') }));

    await expect(
      callStructured({ schema: MiniSchema, schemaName: "mori_mini", systemPrompt: "S", userPrompt: "U" }),
    ).rejects.toMatchObject({ code: "INVALID_JSON" });

    // repairs are bounded: never an unbounded retry loop
    expect(calls.length).toBeLessThanOrEqual(7);
  });

  it("asks for a shorter answer when the output was truncated", async () => {
    const calls = mockFetch((index) =>
      index === 0
        ? { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToIm', "length") }
        : { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToImprove":"精简版建议"}}') },
    );

    const result = await callStructured({
      schema: MiniSchema,
      schemaName: "mori_mini",
      systemPrompt: "S",
      userPrompt: "U",
    });

    expect(result.output.scores.howToImprove).toBe("精简版建议");
    expect(calls[1].systemPrompt).toContain("被截断");
    expect(calls[1].systemPrompt).toContain("精简");
  });
});
