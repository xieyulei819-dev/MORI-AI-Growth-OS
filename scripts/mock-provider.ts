/**
 * 本地 OpenAI-compatible mock provider —— 仅用于开发/验证，不参与生产逻辑。
 *
 * 用途：在没有真实 API Key 的情况下验证「真实 AI 模式」的完整链路：
 *   npm run mock:provider            # ok 模式：返回结构合法的 JSON（故意带 ``` 代码块围栏）
 *   MOCK_MODE=http500 npm run mock:provider   # 让上游返回 500，用于验证 fallback
 *   MOCK_MODE=badjson npm run mock:provider   # 返回非 JSON，用于验证 Zod 校验 + fallback
 *
 * 启动后把 .env.local 指过去即可：
 *   DEMO_MODE="false"
 *   OPENAI_API_KEY="sk-local-mock"        # 任意非空值
 *   OPENAI_BASE_URL="http://127.0.0.1:8787/v1"
 *   OPENAI_MODEL="mock-model"
 *
 * 该脚本只打印「模型名 / schema 名 / 请求形状 / 是否含 Strict 不支持的字段」，
 * 不会打印任何 header、Authorization 或 API Key。
 */

import { createServer } from "node:http";

import { demoFor } from "@/lib/ai/runner";
import { PROMPT_LIBRARY } from "@/lib/prompts";
import { getBusinessContext } from "@/lib/data";
import type { AgentId } from "@/types";

const PORT = Number(process.env.MOCK_PORT ?? 8787);
const MODE = process.env.MOCK_MODE ?? "ok";

const AGENT_BY_SCHEMA = new Map<string, AgentId>(
  PROMPT_LIBRARY.map((template) => [template.schemaName, template.agent]),
);

const UNSUPPORTED_IN_STRICT = ["minimum", "maximum", "minLength", "maxLength", "pattern", "default"];

function json(res: import("node:http").ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

const server = createServer(async (req, res) => {
  if (!req.url?.includes("/chat/completions")) {
    json(res, 404, { error: { message: "not found" } });
    return;
  }

  let raw = "";
  for await (const chunk of req) raw += chunk;

  let body: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type?: string; json_schema?: { name?: string; strict?: boolean } };
    messages?: Array<{ role: string; content: string }>;
  } = {};
  try {
    body = JSON.parse(raw);
  } catch {
    json(res, 400, { error: { message: "invalid request body" } });
    return;
  }

  // In strict mode the schema name travels in response_format; in json_object /
  // plain mode it is stated inside the system prompt (see jsonSchemaPromptHint).
  const schemaName =
    body.response_format?.json_schema?.name ??
    (body.messages?.[0]?.content ?? "").match(/mori_[a-z_]+/)?.[0] ??
    "unknown";
  const responseFormat = JSON.stringify(body.response_format ?? {});
  const offending = UNSUPPORTED_IN_STRICT.filter((keyword) => responseFormat.includes(`"${keyword}"`));

  console.log(
    `[mock] model=${body.model ?? "-"} schema=${schemaName} shape=${body.response_format?.type ?? "none"} ` +
      `strict=${body.response_format?.json_schema?.strict ?? "-"} temp=${body.temperature ?? "omitted"} ` +
      `max_tokens=${body.max_tokens ?? "omitted"} bytes=${raw.length} ` +
      `strictViolations=${offending.length > 0 ? offending.join(",") : "none"} ` +
      `schemaInPrompt=${(body.messages?.[0]?.content ?? "").includes("additionalProperties") ? "yes" : "no"}`,
  );

  if (MODE === "http500") {
    json(res, 500, { error: { message: "mock upstream failure (simulated)" } });
    return;
  }

  const agent = AGENT_BY_SCHEMA.get(schemaName);

  let content: string;
  if (MODE === "badjson") {
    content = "对不起，我无法给出结构化结果。";
  } else if (!agent) {
    content = JSON.stringify({ ok: true });
  } else {
    const context = await getBusinessContext();
    const data = demoFor(agent, {
      context,
      question: "最近 ROAS 为什么下降？",
      contentSelection: {
        platform: "小红书",
        contentType: "种草",
        goal: "转化",
        topic: "熬夜修护",
        audience: context.personas[0]?.name ?? "熬夜型都市新人",
      },
      creativeSelection: {
        platform: "抖音",
        objective: "转化",
        audience: "23 岁熬夜女性",
        theme: "夜间修护",
      },
    });
    // 故意带上 ``` 围栏：真实兼容接口很常这么返回，用于验证客户端的兼容处理
    content = "```json\n" + JSON.stringify(data) + "\n```";
  }

  json(res, 200, {
    id: "mock-completion",
    model: body.model ?? "mock-model",
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: Math.round(raw.length / 4), completion_tokens: Math.round(content.length / 4) },
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock] MORI mock provider (${MODE}) listening on http://127.0.0.1:${PORT}/v1`);
});
