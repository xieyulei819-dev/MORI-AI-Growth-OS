import { AiProviderError, callStructured, getAiConfig, type StructuredCallInput } from "@/lib/ai/client";
import { isAiExperienceError } from "@/lib/ai/usage";
import {
  demoContentPlan,
  demoIpAnalysis,
  demoScriptBundle,
  demoShotPlan,
  demoTopicStrategy,
  demoTrendResearch,
} from "@/lib/ip/demo-engine";
import type { IpInput } from "@/lib/ip/input";
import type { IndustryKey } from "@/lib/ip/knowledge";
import { getIpPromptTemplate } from "@/lib/ip/prompts";
import {
  IP_AGENT_SCHEMAS,
  type ContentPlan,
  type IpAgentId,
  type IpAgentOutputMap,
  type IpAnalysis,
  type ScriptBundle,
  type ShotPlan,
  type TopicItem,
  type TopicStrategy,
  type TrendResearch,
} from "@/lib/ip/schemas";
import type { SearchResult, TrendSearchStatus } from "@/lib/ip/search";

/**
 * IP 智能选题 —— 统一 Agent 入口。
 *
 * demo      → 没有 API Key：本地结构化引擎
 * ai        → 模型返回了符合 Schema 的 JSON
 * fallback  → 模型调用失败 / 结构非法：回退到本地引擎，并在 UI 上标注
 *
 * 与 MORI 主体的 runner 完全同构，因此复用同一套 DeepSeek / OpenAI-compatible
 * 调用与 JSON Schema 校验逻辑（没有另建一套 AI 系统）。
 */

const EMPTY_SEARCH_STATUS: TrendSearchStatus = {
  performed: false,
  provider: "none",
  queries: [],
  resultCount: 0,
  note: "当前没有找到足够可靠的热点信息。",
};

export type IpAgentPayload = {
  input: IpInput;
  industryKey: IndustryKey;
  analysis?: IpAnalysis;
  trends?: TrendResearch;
  topics?: TopicItem[];
  topic?: TopicItem;
  script?: ScriptBundle;
  searchResults?: SearchResult[];
  searchStatus?: TrendSearchStatus;
  /** 用户反馈（换一个 / 不喜欢的原因），用于重新生成单个选题 */
  feedback?: { action: string; reason?: string; previousTitle?: string };
};

export type IpRunMode = "demo" | "ai" | "fallback";

export type IpRunMeta = {
  mode: IpRunMode;
  agent: IpAgentId;
  model: string;
  promptVersion: string;
  latencyMs: number;
  generatedAt: string;
  warning?: string;
};

export type IpRunResult<T> = { data: T; meta: IpRunMeta };

function resolveDeps(payload: IpAgentPayload): Required<
  Pick<IpAgentPayload, "analysis" | "trends" | "topics" | "topic" | "script" | "searchResults" | "searchStatus">
> {
  const analysis = payload.analysis ?? demoIpAnalysis(payload.input, payload.industryKey);
  const trends =
    payload.trends ?? demoTrendResearch(payload.input, payload.industryKey, payload.searchResults ?? [], payload.searchStatus ?? EMPTY_SEARCH_STATUS);
  const topics = payload.topics ?? demoTopicStrategy(payload.input, payload.industryKey, analysis, trends).topics;
  const topic = payload.topic ?? topics[0];
  const script = payload.script ?? demoScriptBundle(payload.input, payload.industryKey, topic);
  return {
    analysis,
    trends,
    topics,
    topic,
    script,
    searchResults: payload.searchResults ?? [],
    searchStatus: payload.searchStatus ?? EMPTY_SEARCH_STATUS,
  };
}

export function demoForIpAgent<K extends IpAgentId>(agent: K, payload: IpAgentPayload): IpAgentOutputMap[K] {
  const deps = resolveDeps(payload);
  switch (agent) {
    case "ip_analyst":
      return demoIpAnalysis(payload.input, payload.industryKey) as IpAgentOutputMap[K];
    case "ip_trend_researcher":
      return demoTrendResearch(payload.input, payload.industryKey, deps.searchResults, deps.searchStatus) as IpAgentOutputMap[K];
    case "ip_topic_strategist":
      return demoTopicStrategy(payload.input, payload.industryKey, deps.analysis, deps.trends) as IpAgentOutputMap[K];
    case "ip_script_writer":
      return demoScriptBundle(payload.input, payload.industryKey, deps.topic) as IpAgentOutputMap[K];
    case "ip_shot_planner":
      return demoShotPlan(payload.input, payload.industryKey, deps.topic, deps.script) as IpAgentOutputMap[K];
    case "ip_content_planner":
      return demoContentPlan(payload.input, payload.industryKey, deps.topics) as IpAgentOutputMap[K];
    default:
      throw new Error(`Unknown IP agent: ${String(agent)}`);
  }
}

/** 压缩上下文，避免把整块 JSON 全部塞进每次调用。 */
function buildUserPayload(agent: IpAgentId, payload: IpAgentPayload) {
  const deps = resolveDeps(payload);
  const base = {
    ip: payload.input,
    industryHint: payload.industryKey,
  };

  switch (agent) {
    case "ip_analyst":
      return base;
    case "ip_trend_researcher":
      return {
        ...base,
        ipAnalysis: deps.analysis,
        searchPerformed: deps.searchStatus.performed,
        searchNote: deps.searchStatus.note,
        searchResults: deps.searchResults.slice(0, 12).map((item) => ({
          title: item.title,
          url: item.url,
          snippet: item.snippet.slice(0, 300),
          publishedAt: item.publishedAt ?? "",
          source: item.source,
        })),
      };
    case "ip_topic_strategist":
      return {
        ...base,
        ipAnalysis: deps.analysis,
        trendResearch: deps.trends,
        feedback: payload.feedback ?? null,
        instruction: payload.feedback
          ? `用户对上一条选题不满意（原因：${payload.feedback.reason ?? "未说明"}），请重新生成一批更符合要求的选题。`
          : "请生成至少 10 个选题。",
      };
    case "ip_script_writer":
      return { ...base, topic: deps.topic, ipAnalysis: deps.analysis };
    case "ip_shot_planner":
      return { ...base, topic: deps.topic, script: deps.script };
    case "ip_content_planner":
      return { ...base, ipAnalysis: deps.analysis, trendResearch: deps.trends, topics: deps.topics };
    default:
      return base;
  }
}

export async function runIpAgent<K extends IpAgentId>(
  agent: K,
  payload: IpAgentPayload,
  options: { temperature?: number; callProvider?: typeof callStructured } = {},
): Promise<IpRunResult<IpAgentOutputMap[K]>> {
  const template = getIpPromptTemplate(agent);
  const config = getAiConfig();
  const startedAt = Date.now();

  if (!config.enabled) {
    return {
      data: demoForIpAgent(agent, payload),
      meta: {
        mode: "demo",
        agent,
        model: "IP local structured engine",
        promptVersion: template.version,
        latencyMs: Date.now() - startedAt,
        generatedAt: new Date().toISOString(),
        warning: config.reason,
      },
    };
  }

  const callProvider = options.callProvider ?? callStructured;

  try {
    const request = {
      schema: IP_AGENT_SCHEMAS[agent],
      schemaName: template.schemaName,
      systemPrompt: template.body,
      userPrompt: JSON.stringify(buildUserPayload(agent, payload)),
      temperature: options.temperature ?? 0.5,
      model: config.model,
    } as StructuredCallInput<typeof IP_AGENT_SCHEMAS[K]>;

    const result = await callProvider(request);
    return {
      data: result.output as IpAgentOutputMap[K],
      meta: {
        mode: "ai",
        agent,
        model: result.model,
        promptVersion: template.version,
        latencyMs: result.latencyMs,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    if (isAiExperienceError(error)) throw error;
    const warning =
      error instanceof AiProviderError
        ? `${error.code}: ${error.message}`
        : error instanceof Error
          ? error.message
          : "未知错误";

    return {
      data: demoForIpAgent(agent, payload),
      meta: {
        mode: "fallback",
        agent,
        model: "IP local structured engine",
        promptVersion: template.version,
        latencyMs: Date.now() - startedAt,
        generatedAt: new Date().toISOString(),
        warning: `AI 调用失败，已自动切换到本地结构化引擎。原因：${warning}`,
      },
    };
  }
}

export function ipAgentStatusSummary() {
  const config = getAiConfig();
  return {
    mode: config.enabled ? ("ai" as const) : ("demo" as const),
    provider: config.provider,
    model: config.enabled ? config.model : "IP local structured engine",
    apiKeyConfigured: config.apiKeyConfigured,
    reason: config.reason,
    agents: Object.keys(IP_AGENT_SCHEMAS) as IpAgentId[],
  };
}

export type { ContentPlan, IpAnalysis, ScriptBundle, ShotPlan, TopicItem, TopicStrategy, TrendResearch };
