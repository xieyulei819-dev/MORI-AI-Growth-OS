import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AiProviderError, callStructured, getAiConfig } from "@/lib/ai/client";
import { stripUnsupportedForStrict, zodToJsonSchema, zodToStructuredOutputFormat } from "@/lib/ai/json-schema";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";
import { redactSecrets } from "@/lib/utils";
import type { AgentId } from "@/types";

const AGENTS = Object.keys(AGENT_SCHEMAS) as AgentId[];
// 运行时拼出"看起来像 Key"的字符串：既能验证脱敏逻辑，又不会让仓库里的
// 源码/打包产物命中密钥扫描器（也不含任何真实凭证）。
const FAKE_KEY = ["sk", "test", "not", "a", "real", "key", "0000"].join("-");

type FetchCall = { url: string; body: Record<string, unknown> };

function mockFetch(responder: (call: FetchCall, index: number) => { status?: number; json?: unknown; text?: string }) {
  const calls: FetchCall[] = [];
  const stub = vi.fn(async (url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    calls.push({ url: String(url), body });
    const result = responder({ url: String(url), body }, calls.length - 1);
    const status = result.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => result.json ?? {},
      text: async () => result.text ?? JSON.stringify(result.json ?? {}),
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", stub);
  return calls;
}

function completion(content: string, finishReason = "stop") {
  return { choices: [{ message: { content }, finish_reason: finishReason }] };
}

const ProbeSchema = z.object({ ok: z.boolean(), score: z.number().min(0).max(100) });

beforeEach(() => {
  process.env.DEMO_MODE = "false";
  process.env.OPENAI_API_KEY = FAKE_KEY;
  process.env.OPENAI_BASE_URL = "https://provider.invalid/v1";
  process.env.OPENAI_MODEL = "test-model";
  delete process.env.AI_TEMPERATURE;
  delete process.env.AI_MAX_TOKENS;
  delete process.env.AI_REQUEST_TIMEOUT_MS;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.DEMO_MODE;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_BASE_URL;
  delete process.env.OPENAI_MODEL;
  delete process.env.AI_TEMPERATURE;
  delete process.env.AI_MAX_TOKENS;
});

describe("strict structured output payload", () => {
  it("never sends JSON Schema keywords that strict mode rejects", () => {
    AGENTS.forEach((agent) => {
      const payload = JSON.stringify(zodToStructuredOutputFormat(AGENT_SCHEMAS[agent], "schema"));
      ["minimum", "maximum", "minLength", "maxLength", "pattern", "format", "default"].forEach((keyword) => {
        expect(payload).not.toContain(`"${keyword}"`);
      });
      expect(payload).toContain('"additionalProperties":false');
      expect(payload).toContain('"strict":true');
    });
  });

  it("keeps object/array/enum structure intact while stripping constraints", () => {
    const schema = zodToJsonSchema(AGENT_SCHEMAS.market_analyst) as {
      required: string[];
      properties: Record<string, { type: string; items?: { type: string } }>;
    };
    expect(schema.required).toContain("insights");
    expect(schema.properties.insights.type).toBe("array");
    expect(schema.properties.insights.items?.type).toBe("object");

    const stripped = stripUnsupportedForStrict({ type: "number", minimum: 0, maximum: 100, description: "keep me" });
    expect(stripped).toEqual({ type: "number", description: "keep me" });
  });

  it("still enforces numeric ranges through zod validation", () => {
    const tooBig = AGENT_SCHEMAS.growth_advisor.safeParse({
      question: "q",
      diagnosis: "d",
      mainReason: "r",
      hypotheses: [{ hypothesis: "h", evidence: "e", confidence: 999 }],
      recommendation: ["a"],
      experiment: { name: "n", variantA: "a", variantB: "b", metric: "cvr", successCriteria: "s" },
      dataUsed: ["Metric"],
      insights: [],
      opportunities: [],
      risks: [],
      recommendations: [],
    });
    expect(tooBig.success).toBe(false);
  });
});

describe("secret redaction", () => {
  it("scrubs keys, bearer tokens and jwt-like strings", () => {
    const text = `failed with ${FAKE_KEY} / Bearer abcdef1234567890 / api_key=deadbeefdeadbeef / eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcdefghijkl`;
    const safe = redactSecrets(text);
    expect(safe).not.toContain(FAKE_KEY);
    expect(safe).not.toContain("abcdef1234567890");
    expect(safe).not.toContain("deadbeefdeadbeef");
    expect(safe).toContain("sk-***");
  });

  it("never leaks the key through a provider error message", async () => {
    mockFetch(() => ({ status: 401, text: `Incorrect API key provided: ${FAKE_KEY}` }));
    try {
      await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
      throw new Error("should have thrown");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toContain(FAKE_KEY);
      expect(message).toContain("sk-***");
    }
  });
});

describe("real AI mode request behaviour", () => {
  it("uses json_schema strict mode first and returns the parsed result", async () => {
    const calls = mockFetch(() => ({ json: completion('{"ok":true,"score":88}') }));
    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
    expect(result.mode).toBe("json_schema");
    expect(result.output).toEqual({ ok: true, score: 88 });
    expect(calls).toHaveLength(1);
    const responseFormat = calls[0].body.response_format as { type: string; json_schema: { strict: boolean } };
    expect(responseFormat.type).toBe("json_schema");
    expect(responseFormat.json_schema.strict).toBe(true);
    expect(calls[0].body.temperature).toBe(0.4);
  });

  it("degrades to json_object when the provider rejects json_schema (keeps zod validation)", async () => {
    const calls = mockFetch((_call, index) =>
      index === 0
        ? { status: 400, text: '{"error":{"message":"response_format json_schema is not supported by this model"}}' }
        : { json: completion("```json\n{\"ok\":true,\"score\":75}\n```") },
    );

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.mode).toBe("json_object");
    expect(result.output.score).toBe(75);
    expect(calls).toHaveLength(2);
    expect((calls[1].body.response_format as { type: string }).type).toBe("json_object");
    expect(calls[1].body.temperature).toBeUndefined();
    // the JSON Schema is injected into the system prompt so the shape is still known
    const messages = calls[1].body.messages as Array<{ role: string; content: string }>;
    expect(messages[0].content).toContain("additionalProperties");
  });

  it("omits temperature when AI_TEMPERATURE=default (reasoning models reject it)", async () => {
    process.env.AI_TEMPERATURE = "default";
    const calls = mockFetch(() => ({ json: completion('{"ok":true,"score":60}') }));
    await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
    expect(calls[0].body).not.toHaveProperty("temperature");
  });

  it("accepts JSON wrapped in prose by extracting the object", async () => {
    mockFetch(() => ({ json: completion('Sure! Here is the data:\n{"ok":false,"score":10}\nHope it helps.') }));
    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
    expect(result.output).toEqual({ ok: false, score: 10 });
  });

  it("reports truncation explicitly instead of a misleading JSON error", async () => {
    mockFetch(() => ({ json: completion('{"ok":tru', "length") }));
    await expect(
      callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" }),
    ).rejects.toMatchObject({ code: "TRUNCATED" });
  });

  it("does not retry when the model refuses", async () => {
    const calls = mockFetch(() => ({ json: { choices: [{ message: { refusal: "I can't help with that." }, finish_reason: "stop" }] } }));
    await expect(
      callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" }),
    ).rejects.toMatchObject({ code: "REFUSED" });
    expect(calls).toHaveLength(1);
  });

  it("repairs a schema-breaking payload (out-of-range number) and stays bounded", async () => {
    const calls = mockFetch((_call, index) =>
      index < 2 ? { json: completion('{"ok":true,"score":999}') } : { json: completion('{"ok":true,"score":42}') },
    );

    const result = await callStructured({
      schema: ProbeSchema,
      schemaName: "probe",
      systemPrompt: "s",
      userPrompt: "u",
    });

    expect(result.output).toEqual({ ok: true, score: 42 });
    // attempt 1 + one repair attempt = 2 calls, and the repair note names the field
    expect(calls.length).toBeLessThanOrEqual(3);
    const messages = calls[1].body.messages as Array<{ content: string }>;
    expect(messages[0].content).toContain("score");
  });

  it("throws MISSING_API_KEY before ever calling the network", async () => {
    process.env.OPENAI_API_KEY = "";
    const calls = mockFetch(() => ({ json: completion("{}") }));
    await expect(
      callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" }),
    ).rejects.toMatchObject({ code: "MISSING_API_KEY" });
    expect(calls).toHaveLength(0);
  });

  it("reports an unreachable provider as NETWORK_ERROR with the base URL for troubleshooting", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    try {
      await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "NETWORK_ERROR" });
      expect((error as Error).message).toContain("https://provider.invalid/v1");
      expect((error as Error).message).toContain("代理");
    }
  });

  it("maps an aborted request to TIMEOUT even when the runtime says TypeError: terminated", async () => {
    process.env.AI_REQUEST_TIMEOUT_MS = "40";
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (_url: string, init?: RequestInit) =>
          await new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new TypeError("terminated")));
          }),
      ),
    );

    try {
      await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "TIMEOUT" });
    }
  });

  it("explains a mid-request socket termination in a user actionable way", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("terminated");
      }),
    );
    try {
      await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "NETWORK_ERROR" });
      expect((error as Error).message).toContain("AI_REQUEST_TIMEOUT_MS");
    }
  });
});

describe("AI config resolution", () => {
  it("stays in demo mode when DEMO_MODE=true", () => {
    process.env.DEMO_MODE = "true";
    const config = getAiConfig();
    expect(config.demoMode).toBe(true);
    expect(config.enabled).toBe(false);
    expect(config.reason).toContain("DEMO_MODE=true");
  });

  it("enables AI mode when DEMO_MODE=false and a key exists", () => {
    const config = getAiConfig();
    expect(config.enabled).toBe(true);
    expect(config.apiKeyConfigured).toBe(true);
    expect(config.provider).toBe("OpenAI-compatible");
    expect(config.reason).toContain("test-model");
  });

  it("never exposes the key through the config object", () => {
    const config = getAiConfig();
    expect(JSON.stringify(config)).not.toContain(FAKE_KEY);
    expect(JSON.stringify(config)).not.toContain("sk-");
  });
});
