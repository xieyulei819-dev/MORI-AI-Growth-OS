import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { callStructured, getAiConfig } from "@/lib/ai/client";
import { jsonSchemaPromptHint, zodToJsonSchema } from "@/lib/ai/json-schema";

// 运行时拼接，避免仓库出现完整 Key 形态（内容依旧是假值）
const DEEPSEEK_KEY = ["sk", "deepseek", "test", "not", "a", "real", "key"].join("-");
const OPENAI_KEY = ["sk", "openai", "test", "not", "a", "real", "key"].join("-");

const ProbeSchema = z.object({ ok: z.boolean() });

function mockFetch(responder: (call: { body: Record<string, unknown> }, index: number) => { status?: number; json?: unknown; text?: string }) {
  const calls: Array<{ body: Record<string, unknown>; headers: Record<string, string> }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      calls.push({ body, headers: (init?.headers ?? {}) as Record<string, string> });
      const result = responder({ body }, calls.length - 1);
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

function completion(content: string) {
  return { choices: [{ message: { content }, finish_reason: "stop" }] };
}

function clearAiEnv() {
  [
    "AI_PROVIDER",
    "AI_API_KEY",
    "DEEPSEEK_API_KEY",
    "OPENAI_API_KEY",
    "AI_BASE_URL",
    "AI_MODEL",
    "OPENAI_BASE_URL",
    "OPENAI_MODEL",
    "DEMO_MODE",
  ].forEach((name) => delete process.env[name]);
}

beforeEach(() => {
  clearAiEnv();
  process.env.DEMO_MODE = "false";
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearAiEnv();
});

describe("DeepSeek provider preset", () => {
  it("sends the DeepSeek key in the Authorization header (not a leftover OPENAI_API_KEY)", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    process.env.OPENAI_API_KEY = OPENAI_KEY; // stale value from another provider
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));

    await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(calls[0].headers.Authorization).toBe(`Bearer ${DEEPSEEK_KEY}`);
    expect(calls[0].headers.Authorization).not.toContain(OPENAI_KEY);
  });

  it("uses the OpenAI key when the OpenAI preset is active", async () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = OPENAI_KEY;
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));

    await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(calls[0].headers.Authorization).toBe(`Bearer ${OPENAI_KEY}`);
  });

  it("never sends an empty bearer token when no key is configured", async () => {
    process.env.AI_PROVIDER = "deepseek";
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));
    await expect(
      callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" }),
    ).rejects.toMatchObject({ code: "MISSING_API_KEY" });
    expect(calls).toHaveLength(0);
  });

  it("resolves base URL, model and key env var from AI_PROVIDER=deepseek", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;

    const config = getAiConfig();

    expect(config.providerId).toBe("deepseek");
    expect(config.provider).toBe("DeepSeek");
    expect(config.baseUrl).toBe("https://api.deepseek.com");
    expect(config.model).toBe("deepseek-flash");
    expect(config.enabled).toBe(true);
    expect(config.keySource).toBe("DEEPSEEK_API_KEY");
    expect(config.supportsJsonSchema).toBe(false);
    expect(config.reason).toContain("DeepSeek");
  });

  it("infers the DeepSeek preset when only DEEPSEEK_API_KEY is configured", () => {
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;

    const config = getAiConfig();

    expect(config.providerId).toBe("deepseek");
    expect(config.baseUrl).toBe("https://api.deepseek.com");
    expect(config.keySource).toBe("DEEPSEEK_API_KEY");
  });

  it("ignores stale OPENAI_* values once AI_PROVIDER is set", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    process.env.OPENAI_BASE_URL = "http://127.0.0.1:8787/v1";
    process.env.OPENAI_MODEL = "gpt-4o-mini";

    const config = getAiConfig();

    expect(config.baseUrl).toBe("https://api.deepseek.com");
    expect(config.model).toBe("deepseek-flash");
  });

  it("lets AI_BASE_URL / AI_MODEL override the preset", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    process.env.AI_BASE_URL = "https://api.deepseek.com/v1";
    process.env.AI_MODEL = "deepseek-chat";

    const config = getAiConfig();

    expect(config.baseUrl).toBe("https://api.deepseek.com/v1");
    expect(config.model).toBe("deepseek-chat");
  });

  it("prefers DEEPSEEK_API_KEY over OPENAI_API_KEY, and AI_API_KEY over both", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.OPENAI_API_KEY = OPENAI_KEY;
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    expect(getAiConfig().keySource).toBe("DEEPSEEK_API_KEY");

    process.env.AI_API_KEY = "generic-key-value";
    expect(getAiConfig().keySource).toBe("AI_API_KEY");
  });

  it("falls back to demo when no key is configured", () => {
    process.env.AI_PROVIDER = "deepseek";
    const config = getAiConfig();
    expect(config.enabled).toBe(false);
    expect(config.reason).toContain("DEEPSEEK_API_KEY");
  });

  it("never exposes the key value through the config object", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const serialized = JSON.stringify(getAiConfig());
    expect(serialized).not.toContain(DEEPSEEK_KEY);
    expect(serialized).not.toContain("sk-");
  });

  it("keeps real AI enabled under DEMO_MODE=true when a key exists (public quota handled separately)", () => {
    process.env.DEMO_MODE = "true";
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const config = getAiConfig();
    expect(config.demoMode).toBe(true);
    expect(config.enabled).toBe(true);
  });
});

describe("DeepSeek request compatibility", () => {
  it("starts at json_object (no wasted strict json_schema attempt) and injects the schema into the prompt", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.mode).toBe("json_object");
    expect(calls).toHaveLength(1);
    expect((calls[0].body.response_format as { type: string }).type).toBe("json_object");
    const systemPrompt = (calls[0].body.messages as Array<{ content: string }>)[0].content;
    expect(systemPrompt).toContain("json");
    expect(systemPrompt).toContain("additionalProperties");
    // DeepSeek 官方支持 temperature(0-2)，首个请求会带上配置值；
    // 一旦上游报错，降级重试会自动去掉这些可选参数（见下一个用例）。
    expect(calls[0].body.temperature).toBe(0.4);
  });

  it("keeps the json_schema-first behaviour for providers that support it", async () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = OPENAI_KEY;
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.mode).toBe("json_schema");
    expect((calls[0].body.response_format as { type: string }).type).toBe("json_schema");
  });

  it("recovers when DeepSeek returns empty content once (known JSON Output quirk)", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const calls = mockFetch((_call, index) =>
      index === 0 ? { json: completion("") } : { json: completion('{"ok":true}') },
    );

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.output).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
    expect(calls[1].body.response_format).toBeUndefined();
  });

  it("degrades to a fully untyped request if json_object is rejected too", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const calls = mockFetch((_call, index) =>
      index === 0
        ? { status: 400, text: '{"error":{"message":"response_format is not supported"}}' }
        : { json: completion('{"ok":true}') },
    );

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.mode).toBe("plain");
    expect(calls).toHaveLength(2);
    expect(calls[1].body.response_format).toBeUndefined();
  });
});

describe("DeepSeek prompt hint", () => {
  it("contains the literal word json and the strict-safe schema", () => {
    const hint = jsonSchemaPromptHint(ProbeSchema, "mori_connectivity_probe");
    expect(hint).toContain("json");
    expect(hint).toContain("mori_connectivity_probe");
    expect(hint).toContain("additionalProperties");
    expect(hint).not.toContain('"minimum"');
  });

  it("still produces a schema that zod can validate against", () => {
    const schema = zodToJsonSchema(ProbeSchema) as { required: string[] };
    expect(schema.required).toEqual(["ok"]);
    expect(ProbeSchema.safeParse({ ok: "yes" }).success).toBe(false);
  });
});
