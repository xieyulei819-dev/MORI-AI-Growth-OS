import { z, type ZodTypeAny } from "zod";

import { jsonSchemaPromptHint, zodToStructuredOutputFormat } from "@/lib/ai/json-schema";
import { redactSecrets } from "@/lib/utils";

export type AiConfig = {
  demoMode: boolean;
  enabled: boolean;
  providerId: AiProviderId;
  /** display label, e.g. "DeepSeek" */
  provider: string;
  model: string;
  baseUrl: string;
  apiKeyConfigured: boolean;
  /** name of the env var the key was read from (never the value itself) */
  keySource: string | null;
  /** whether the provider officially supports strict json_schema structured outputs */
  supportsJsonSchema: boolean;
  timeoutMs: number;
  /** human readable reason for the current mode */
  reason: string;
};

export type AiProviderId = "deepseek" | "openai" | "mock" | "custom";

type ProviderPreset = {
  id: AiProviderId;
  label: string;
  baseUrl: string;
  model: string;
  supportsJsonSchema: boolean;
  /** the provider specific env var holding the API key */
  apiKeyEnv: string;
};

/**
 * Provider presets. `AI_PROVIDER=deepseek` is all you need to switch to
 * DeepSeek: the base URL, model and key env var come from the preset, so a
 * leftover OPENAI_* value from another provider can never leak into the call.
 */
const PROVIDER_PRESETS: Record<AiProviderId, ProviderPreset> = {
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-flash",
    supportsJsonSchema: false,
    apiKeyEnv: "DEEPSEEK_API_KEY",
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    supportsJsonSchema: true,
    apiKeyEnv: "OPENAI_API_KEY",
  },
  mock: {
    id: "mock",
    label: "Local mock provider",
    baseUrl: "http://127.0.0.1:8787/v1",
    model: "mock-model",
    supportsJsonSchema: true,
    apiKeyEnv: "AI_API_KEY",
  },
  custom: {
    id: "custom",
    label: "OpenAI-compatible",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    supportsJsonSchema: true,
    apiKeyEnv: "AI_API_KEY",
  },
};

function readEnv(name: string) {
  return (process.env[name] ?? "").trim();
}

function firstConfigured(names: string[]): { name: string; value: string } | null {
  for (const name of names) {
    const value = readEnv(name);
    if (value.length > 0) return { name, value };
  }
  return null;
}

/**
 * Resolves the API key for a provider. The value is intentionally NOT part of
 * `AiConfig` (so it can never be serialised into a response or log by mistake);
 * only the name of the variable is exposed there.
 */
function resolveApiKey(providerId: AiProviderId): { name: string; value: string } | null {
  const preset = PROVIDER_PRESETS[providerId];
  const candidates = Array.from(new Set(["AI_API_KEY", preset.apiKeyEnv, "OPENAI_API_KEY", "DEEPSEEK_API_KEY"]));
  return firstConfigured(candidates);
}

function detectProviderId(explicit: string, baseUrl: string): AiProviderId {
  const normalized = explicit.toLowerCase();
  if (normalized === "deepseek" || normalized === "openai" || normalized === "mock" || normalized === "custom") {
    return normalized;
  }
  if (baseUrl.includes("api.deepseek.com")) return "deepseek";
  if (/127\.0\.0\.1|localhost/i.test(baseUrl)) return "mock";
  if (baseUrl.includes("api.openai.com")) return "openai";
  return "custom";
}

export type AiProviderErrorCode =
  | "MISSING_API_KEY"
  | "HTTP_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "EMPTY_RESPONSE"
  | "TRUNCATED"
  | "INVALID_JSON"
  | "REFUSED"
  | "UNKNOWN";

export class AiProviderError extends Error {
  code: AiProviderErrorCode;
  status?: number;

  constructor(code: AiProviderErrorCode, message: string, status?: number) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
    this.status = status;
  }
}

export function getAiConfig(): AiConfig {
  const demoModeRaw = (readEnv("DEMO_MODE") || "true").toLowerCase();
  const demoMode = demoModeRaw === "true" || demoModeRaw === "1" || demoModeRaw === "yes";

  const explicitProvider = readEnv("AI_PROVIDER");
  const aiBaseUrl = readEnv("AI_BASE_URL");
  const legacyBaseUrl = readEnv("OPENAI_BASE_URL");
  const providerId = detectProviderId(explicitProvider, aiBaseUrl || legacyBaseUrl || PROVIDER_PRESETS.openai.baseUrl);
  const preset = PROVIDER_PRESETS[providerId];

  // When AI_PROVIDER is set explicitly the preset wins, so stale OPENAI_* values
  // from a previous provider cannot silently override DeepSeek settings.
  const baseUrl = (aiBaseUrl || (explicitProvider ? preset.baseUrl : legacyBaseUrl) || preset.baseUrl).replace(
    /\/+$/,
    "",
  );
  const model = readEnv("AI_MODEL") || (explicitProvider ? preset.model : readEnv("OPENAI_MODEL")) || preset.model;

  const key = resolveApiKey(providerId);
  const apiKeyConfigured = key !== null;
  // DeepSeek + a ~29KB business context regularly takes 30-90s, and the largest
  // agent (campaign analysis) can exceed two minutes. 45s used to cut those
  // calls off, so the default is now 120s (override with AI_REQUEST_TIMEOUT_MS).
  const timeoutMs = Number(readEnv("AI_REQUEST_TIMEOUT_MS") || 120_000);

  let enabled = false;
  let reason = "";

  if (demoMode) {
    reason = `DEMO_MODE=true，使用本地结构化分析引擎（不调用外部模型）。`;
  } else if (!apiKeyConfigured) {
    reason = `未检测到 API Key（可设置 ${preset.apiKeyEnv}），已自动回退到 Demo Mode。`;
  } else {
    enabled = true;
    reason = `已启用 ${preset.label} 模式：${model} @ ${baseUrl}（密钥来源 ${key.name}）`;
  }

  return {
    demoMode,
    enabled,
    providerId,
    provider: preset.label,
    model,
    baseUrl,
    apiKeyConfigured,
    keySource: key?.name ?? null,
    supportsJsonSchema: preset.supportsJsonSchema,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 120_000,
    reason,
  };
}

export type StructuredCallInput<T extends ZodTypeAny> = {
  schema: T;
  schemaName: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  model?: string;
};

/** Which request shape the provider accepted (useful for Settings + tests). */
export type StructuredCallMode = "json_schema" | "json_object" | "plain";

export type StructuredCallResult<TOutput> = {
  raw: unknown;
  output: TOutput;
  model: string;
  latencyMs: number;
  mode: StructuredCallMode;
};

type ProviderAttempt = {
  mode: StructuredCallMode;
  responseFormat?: unknown;
  includeTemperature: boolean;
  includeMaxTokens: boolean;
  systemSuffix: string;
};

type AttemptOutcome =
  | { kind: "ok"; raw: unknown; mode: StructuredCallMode; latencyMs: number }
  /** request shape / truncation problem → try a lighter request shape */
  | { kind: "retry"; error: AiProviderError }
  /** valid JSON but failed zod → ask again with an explicit "what was missing" note */
  | { kind: "retry_parse"; error: AiProviderError; issues: string[] }
  /** must not be retried: refusal, timeout, network failure */
  | { kind: "fatal"; error: AiProviderError };

/** HTTP statuses that may simply mean "this request shape is not supported". */
const FORMAT_RELATED_STATUS = new Set([400, 404, 405, 415, 422]);

function providerError(code: AiProviderErrorCode, message: string, status?: number) {
  return new AiProviderError(code, redactSecrets(message), status);
}

function resolveTemperature(explicit?: number): number | undefined {
  if (typeof explicit === "number" && Number.isFinite(explicit)) return explicit;
  const raw = (process.env.AI_TEMPERATURE ?? "").trim().toLowerCase();
  if (raw === "default" || raw === "none" || raw === "omit") return undefined;
  if (raw === "") return 0.4;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0.4;
}

function resolveMaxTokens(): number | undefined {
  const raw = (process.env.AI_MAX_TOKENS ?? "").trim();
  if (raw === "" || raw === "0") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

/**
 * Removes trailing commas that models occasionally emit. Implemented with a
 * scanner so commas *inside* string values are never touched: we repair the
 * JSON syntax only, never the business data.
 */
function stripTrailingCommas(text: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      out += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
      continue;
    }
    if (char === ",") {
      let lookahead = index + 1;
      while (lookahead < text.length && /\s/.test(text[lookahead])) lookahead += 1;
      if (text[lookahead] === "}" || text[lookahead] === "]") continue;
    }
    out += char;
  }

  return out;
}

/** Tells the model exactly which required fields were missing or invalid. */
function repairSuffix(issues: string[]): string {
  return [
    "",
    "【上一次输出未通过结构校验，请修正后重新输出完整的 json 对象】",
    `校验未通过的原因：${issues.join("; ")}`,
    "必须满足：① 返回 Schema 中列出的每一个字段，一个都不能少；② 不允许用 null 代替字段；",
    "③ 数组没有内容时返回 []；④ 数字字段必须输出数字（不要加引号或单位）。",
  ].join("\n");
}

/** A truncated answer needs shorter wording, not a different schema. */
function concisionSuffix(): string {
  return [
    "",
    "【上一次输出因长度被截断，请重新输出】",
    "要求：仍然必须包含全部字段，但文字更精简（每个说明性字段 1–2 句，不要展开长段落）。",
  ].join("\n");
}

/** Providers often wrap JSON in ```json fences or add a sentence around it. */
function extractJson(content: string): unknown {
  const trimmed = content.trim();
  const unfenced = trimmed
    .replace(/^```(?:json|JSON)?\s*/, "")
    .replace(/```\s*$/, "")
    .trim();

  try {
    return JSON.parse(unfenced);
  } catch {
    // fall through to brace extraction
  }

  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const candidate = unfenced.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      try {
        return JSON.parse(stripTrailingCommas(candidate));
      } catch {
        // fall through to error
      }
    }
  }

  try {
    return JSON.parse(stripTrailingCommas(unfenced));
  } catch {
    // fall through to error
  }

  throw providerError("INVALID_JSON", "模型返回的内容不是合法 JSON（已尝试去除代码块并提取花括号内容）。");
}

async function attemptProviderCall<T extends ZodTypeAny>(
  input: StructuredCallInput<T>,
  attempt: ProviderAttempt,
  config: AiConfig,
  model: string,
  temperature: number | undefined,
  maxTokens: number | undefined,
): Promise<AttemptOutcome> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: input.systemPrompt + attempt.systemSuffix },
      { role: "user", content: input.userPrompt },
    ],
  };
  if (attempt.responseFormat) body.response_format = attempt.responseFormat;
  if (attempt.includeTemperature && temperature !== undefined) body.temperature = temperature;
  if (attempt.includeMaxTokens && maxTokens !== undefined) body.max_tokens = maxTokens;

  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    let response: Response;
    try {
      const apiKey = resolveApiKey(config.providerId);
      response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Must use the resolved provider key (DeepSeek / OpenAI / generic),
          // never a hard-coded env var name.
          Authorization: `Bearer ${apiKey?.value ?? ""}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      // undici sometimes reports an aborted request as `TypeError: terminated`
      // instead of an AbortError, so the signal state is the reliable signal.
      if ((error instanceof Error && error.name === "AbortError") || controller.signal.aborted) {
        return { kind: "fatal", error: providerError("TIMEOUT", `模型请求超时（>${config.timeoutMs}ms）。`) };
      }
      if (error instanceof Error && /terminated|UND_ERR_SOCKET|socket hang up/i.test(error.message)) {
        return {
          kind: "fatal",
          error: providerError(
            "NETWORK_ERROR",
            `与模型服务的连接被中断（${error.message}）。常见原因：本地代理/VPN 掐断长连接、` +
              `或请求耗时超过代理上限。可尝试把 api.deepseek.com 加入代理直连白名单，` +
              `或在 .env.local 调大 AI_REQUEST_TIMEOUT_MS。`,
          ),
        };
      }
      return {
        kind: "fatal",
        error: providerError(
          "NETWORK_ERROR",
          `无法连接模型服务 ${config.baseUrl}：${error instanceof Error ? error.message : "网络错误"}。` +
            "请检查网络、代理/VPN 设置与 Base URL 是否正确。",
        ),
      };
    }

    if (!response.ok) {
      const text = redactSecrets(await safeText(response));
      const error = providerError(
        "HTTP_ERROR",
        `模型接口返回 ${response.status}：${text.slice(0, 240)}`,
        response.status,
      );
      return FORMAT_RELATED_STATUS.has(response.status) ? { kind: "retry", error } : { kind: "fatal", error };
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: { content?: string | null; refusal?: string | null };
        finish_reason?: string;
      }>;
    };

    const choice = payload.choices?.[0];
    const message = choice?.message;

    if (message?.refusal) {
      return {
        kind: "fatal",
        error: providerError("REFUSED", `模型拒绝了该请求：${message.refusal.slice(0, 200)}`),
      };
    }

    if (choice?.finish_reason === "length") {
      return {
        kind: "retry",
        error: providerError("TRUNCATED", "模型输出被 token 上限截断（finish_reason=length），无法解析为完整 JSON。"),
      };
    }

    if (!message?.content) {
      return { kind: "retry", error: providerError("EMPTY_RESPONSE", "模型返回了空内容。") };
    }

    let parsed: unknown;
    try {
      parsed = extractJson(message.content);
    } catch (error) {
      const providerFailure =
        error instanceof AiProviderError ? error : providerError("INVALID_JSON", "模型返回的内容不是合法 JSON。");
      return { kind: "retry", error: providerFailure };
    }

    const validated = input.schema.safeParse(parsed);
    if (!validated.success) {
      const issues = validated.error.issues.slice(0, 8).map((issue) => {
        const path = issue.path.join(".") || "root";
        if (issue.code === "invalid_type") {
          const received = String((issue as { received?: unknown }).received ?? "unknown");
          if (received === "undefined") return `${path}: 缺失（Required）`;
          return `${path}: 类型错误（期望 ${String((issue as { expected?: unknown }).expected)}，实际 ${received}）`;
        }
        return `${path}: ${issue.message}`;
      });
      return {
        kind: "retry_parse",
        error: providerError("INVALID_JSON", `模型输出不符合结构约束：${issues.join("; ")}`),
        issues,
      };
    }

    return { kind: "ok", raw: parsed, mode: attempt.mode, latencyMs: Date.now() - startedAt };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Calls an OpenAI-compatible /chat/completions endpoint and validates the
 * payload with zod before returning it.
 *
 * Request shapes are tried from strongest to weakest so that any
 * OpenAI-compatible provider can work, never at the cost of validation:
 *   1. json_schema (official Structured Outputs, strict)
 *   2. json_object (+ JSON Schema injected into the prompt)
 *   3. plain JSON (+ JSON Schema injected into the prompt)
 * Providers that do not support strict json_schema (e.g. DeepSeek) start at
 * step 2 so every call does not waste a guaranteed 400 + a round trip.
 * Only a schema/format related failure degrades; refusals, timeouts and network
 * errors are surfaced immediately (the runner then falls back to the demo engine).
 */
export async function callStructured<T extends ZodTypeAny>(
  input: StructuredCallInput<T>,
): Promise<StructuredCallResult<z.infer<T>>> {
  const config = getAiConfig();
  if (!config.apiKeyConfigured) {
    throw providerError("MISSING_API_KEY", "缺少 OPENAI_API_KEY，无法调用外部模型。");
  }

  const model = (input.model ?? config.model).trim();
  const temperature = resolveTemperature(input.temperature);
  const maxTokens = resolveMaxTokens();

  const jsonSchemaAttempt: ProviderAttempt = {
    mode: "json_schema",
    responseFormat: zodToStructuredOutputFormat(input.schema, input.schemaName),
    includeTemperature: true,
    includeMaxTokens: true,
    systemSuffix: "",
  };
  const jsonObjectAttempt: ProviderAttempt = {
    mode: "json_object",
    responseFormat: { type: "json_object" },
    includeTemperature: true,
    includeMaxTokens: true,
    systemSuffix: jsonSchemaPromptHint(input.schema, input.schemaName),
  };
  const plainAttempt: ProviderAttempt = {
    mode: "plain",
    includeTemperature: true,
    includeMaxTokens: true,
    systemSuffix: jsonSchemaPromptHint(input.schema, input.schemaName),
  };

  const orderedAttempts: ProviderAttempt[] = config.supportsJsonSchema
    ? [jsonSchemaAttempt, jsonObjectAttempt, plainAttempt]
    : [jsonObjectAttempt, plainAttempt];

  // Only the primary attempt carries the configured sampling parameters:
  // whatever triggers a degradation may have been caused by exactly those
  // parameters, so the retries go out with the plainest possible request body.
  const attempts: ProviderAttempt[] = orderedAttempts.map((attempt, index) => ({
    ...attempt,
    includeTemperature: index === 0,
    includeMaxTokens: index === 0,
  }));

  let lastError: AiProviderError | null = null;
  let shapeIndex = 0;
  let repairsForShape = 0;
  let pendingRepair = "";
  let suffixAfterFailure = "";
  let totalCalls = 0;
  const MAX_REPAIRS_PER_SHAPE = 2;
  const MAX_TOTAL_CALLS = 7;

  while (shapeIndex < attempts.length && totalCalls < MAX_TOTAL_CALLS) {
    const baseAttempt = attempts[shapeIndex];
    const attempt: ProviderAttempt = {
      ...baseAttempt,
      systemSuffix: baseAttempt.systemSuffix + pendingRepair + suffixAfterFailure,
    };
    pendingRepair = "";
    suffixAfterFailure = "";

    const outcome = await attemptProviderCall(input, attempt, config, model, temperature, maxTokens);
    totalCalls += 1;

    if (outcome.kind === "ok") {
      return {
        raw: outcome.raw,
        output: input.schema.parse(outcome.raw) as z.infer<T>,
        model,
        latencyMs: outcome.latencyMs,
        mode: outcome.mode,
      };
    }

    if (outcome.kind === "fatal") throw outcome.error;

    lastError = outcome.error;

    // Fields missing / wrong type: ask again with the exact validation errors
    // instead of discarding a perfectly parseable answer.
    if (outcome.kind === "retry_parse") {
      if (repairsForShape < MAX_REPAIRS_PER_SHAPE) {
        repairsForShape += 1;
        pendingRepair = repairSuffix(outcome.issues);
        continue;
      }
      shapeIndex += 1;
      repairsForShape = 0;
      continue;
    }

    // Output cut off by the token limit: retry the same shape, but shorter.
    if (outcome.error.code === "TRUNCATED" && repairsForShape < MAX_REPAIRS_PER_SHAPE) {
      repairsForShape += 1;
      suffixAfterFailure = concisionSuffix();
      continue;
    }

    shapeIndex += 1;
    repairsForShape = 0;
  }

  throw lastError ?? providerError("UNKNOWN", "调用模型失败，且没有可用的降级请求。");
}

async function safeText(response: Response) {
  try {
    return await response.text();
  } catch {
    return "<no body>";
  }
}

/** Quick connectivity probe used by Settings → AI Status. */
export async function testAiConnection(): Promise<{
  ok: boolean;
  mode: "demo" | "ai";
  message: string;
  latencyMs: number;
  model: string;
}> {
  const config = getAiConfig();
  const startedAt = Date.now();

  if (!config.enabled) {
    return {
      ok: true,
      mode: "demo",
      message: config.reason,
      latencyMs: Date.now() - startedAt,
      model: "MORI local structured engine",
    };
  }

  try {
    const probeSchema = z.object({ ok: z.boolean() });
    const result = await callStructured({
      schema: probeSchema,
      schemaName: "mori_connectivity_probe",
      systemPrompt: "Return a JSON object with a single boolean field named ok set to true.",
      userPrompt: "Health check. Reply with { \"ok\": true }.",
      temperature: 0,
    });
    return {
      ok: true,
      mode: "ai",
      message: `模型连接正常（${result.model} · 请求方式 ${result.mode}）。`,
      latencyMs: result.latencyMs,
      model: result.model,
    };
  } catch (error) {
    return {
      ok: false,
      mode: "ai",
      message: redactSecrets(
        error instanceof AiProviderError
          ? `${error.code}: ${error.message}`
          : error instanceof Error
            ? error.message
            : "未知错误",
      ),
      latencyMs: Date.now() - startedAt,
      model: config.model,
    };
  }
}
