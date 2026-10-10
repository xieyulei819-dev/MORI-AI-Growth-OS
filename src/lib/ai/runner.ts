import { AiProviderError, callStructured, getAiConfig, type StructuredCallInput } from "@/lib/ai/client";
import { contextToPromptPayload, type AgentPayload } from "@/lib/ai/context";
import {
  demoAudienceAnalysis,
  demoCampaignAnalysis,
  demoContentStrategy,
  demoCreativeDirections,
  demoGrowthAdvice,
  demoGrowthReport,
  demoMarketAnalysis,
} from "@/lib/ai/demo-engine";
import { AGENT_SCHEMAS, type AgentOutputMap } from "@/lib/ai/schemas";
import { getPromptTemplate } from "@/lib/prompts";
import type { AgentId, AgentRunResult } from "@/types";

/**
 * Single entry point for every AI capability.
 *
 * demo      → DEMO_MODE=true or no API key: local structured engine
 * ai        → provider answered with schema-valid JSON
 * fallback  → provider failed / returned invalid data, local engine used and a
 *             warning is surfaced in the UI
 */

export function demoFor<K extends AgentId>(agent: K, payload: AgentPayload): AgentOutputMap[K] {
  switch (agent) {
    case "market_analyst":
      return demoMarketAnalysis(payload) as AgentOutputMap[K];
    case "audience_analyst":
      return demoAudienceAnalysis(payload) as AgentOutputMap[K];
    case "content_strategist":
      return demoContentStrategy(payload) as AgentOutputMap[K];
    case "creative_strategist":
      return demoCreativeDirections(payload) as AgentOutputMap[K];
    case "performance_analyst":
      return demoCampaignAnalysis(payload) as AgentOutputMap[K];
    case "growth_advisor":
      return demoGrowthAdvice(payload) as AgentOutputMap[K];
    case "report_writer":
      return demoGrowthReport(payload) as AgentOutputMap[K];
    default:
      throw new Error(`Unknown agent: ${String(agent)}`);
  }
}

export type RunAgentOptions = {
  temperature?: number;
  /** dependency injection point used by the automated tests */
  callProvider?: typeof callStructured;
};

export async function runAgent<K extends AgentId>(
  agent: K,
  payload: AgentPayload,
  options: RunAgentOptions = {},
): Promise<AgentRunResult<AgentOutputMap[K]>> {
  const template = getPromptTemplate(agent);
  const config = getAiConfig();
  const startedAt = Date.now();

  if (!config.enabled) {
    return {
      data: demoFor(agent, payload),
      meta: {
        mode: "demo",
        agent,
        model: "MORI local structured engine",
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
      schema: AGENT_SCHEMAS[agent],
      schemaName: template.schemaName,
      systemPrompt: template.body,
      userPrompt: JSON.stringify(contextToPromptPayload(payload)),
      temperature: options.temperature ?? 0.4,
    } as StructuredCallInput<typeof AGENT_SCHEMAS[K]>;

    const result = await callProvider(request);
    return {
      data: result.output as AgentOutputMap[K],
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
    const warning =
      error instanceof AiProviderError
        ? `${error.code}: ${error.message}`
        : error instanceof Error
          ? error.message
          : "未知错误";

    return {
      data: demoFor(agent, payload),
      meta: {
        mode: "fallback",
        agent,
        model: "MORI local structured engine",
        promptVersion: template.version,
        latencyMs: Date.now() - startedAt,
        generatedAt: new Date().toISOString(),
        warning: `AI 调用失败，已自动切换到 Demo 分析引擎。原因：${warning}`,
      },
    };
  }
}

export function agentStatusSummary() {
  const config = getAiConfig();
  return {
    mode: config.enabled ? ("ai" as const) : ("demo" as const),
    providerId: config.providerId,
    model: config.enabled ? config.model : "MORI local structured engine",
    provider: config.provider,
    baseUrl: config.baseUrl,
    apiKeyConfigured: config.apiKeyConfigured,
    keySource: config.keySource,
    supportsJsonSchema: config.supportsJsonSchema,
    requestShapes: config.supportsJsonSchema
      ? (["json_schema", "json_object", "plain"] as const)
      : (["json_object", "plain"] as const),
    demoMode: config.demoMode,
    reason: config.reason,
    agents: Object.keys(AGENT_SCHEMAS) as AgentId[],
  };
}
