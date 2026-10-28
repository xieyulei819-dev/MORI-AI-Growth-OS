import { z } from "zod";

import { fail, ipOk, parseBody, readJson, serverError } from "@/lib/ip/api";
import { normalizeIpInput, resolveIndustry } from "@/lib/ip/input";
import { runIpAgent } from "@/lib/ip/runner";
import { computeOverallScore, normalizeScores } from "@/lib/ip/scoring";
import {
  getTopicWithProfile,
  replaceSingleTopic,
  setTopicFeedback,
} from "@/lib/ip/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  topicId: z.string().min(1),
  action: z.enum(["like", "dislike", "save", "regenerate"]),
  reason: z.string().max(200).optional(),
});

/**
 * Step 17：用户反馈（👍 喜欢 / 👎 不喜欢 / 收藏 / 换一个 / 重新生成）。
 * 「不喜欢」会带上原因，让 AI 按原因重新生成这一条选题。
 */
export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const found = await getTopicWithProfile(parsed.data.topicId);
    if (!found) return fail("NOT_FOUND", "没有找到该选题。", 404);

    const { topic, profile } = found;
    const input = normalizeIpInput({
      name: profile.name,
      industry: profile.industry,
      city: profile.city,
      platforms: profile.platforms,
      targetCustomer: profile.targetCustomer,
      products: profile.products,
      goal: profile.goal,
    });
    const industryKey = resolveIndustry(input);

    if (parsed.data.action === "like") {
      const updated = await setTopicFeedback(topic.id, "like");
      return ipOk({ topic: updated, regenerated: false }, demoMeta("like"));
    }

    if (parsed.data.action === "save") {
      const updated = await setTopicFeedback(topic.id, "saved");
      return ipOk({ topic: updated, regenerated: false }, demoMeta("save"));
    }

    // dislike / regenerate → 按原因重新生成这一条
    if (parsed.data.action === "dislike") {
      await setTopicFeedback(topic.id, "dislike", parsed.data.reason ?? "");
    }

    const result = await runIpAgent("ip_topic_strategist", {
      input,
      industryKey,
      analysis: profile.analysis ?? undefined,
      trends: profile.trends ?? undefined,
      feedback: {
        action: parsed.data.action,
        reason: parsed.data.reason,
        previousTitle: topic.title,
      },
    });

    const candidates = result.data.topics.filter((item) => item.title !== topic.title);
    const replacement =
      [...candidates]
        .map((item) => ({ item, overall: computeOverallScore(normalizeScores(item.scores)) }))
        .sort((a, b) => b.overall - a.overall)[0]?.item ?? result.data.topics[0];

    if (!replacement) {
      return ipOk({ topic, regenerated: false }, result.meta);
    }

    const updated = await replaceSingleTopic(topic.id, replacement, result.meta.mode);
    return ipOk({ topic: updated ?? topic, regenerated: true }, result.meta);
  } catch (error) {
    return serverError(error, "无法处理该反馈，请稍后重试。");
  }
}

function demoMeta(agent: string) {
  return {
    mode: "demo" as const,
    agent: "ip_topic_strategist" as const,
    model: "local",
    promptVersion: "v1.0",
    latencyMs: 0,
    generatedAt: new Date().toISOString(),
    warning: `${agent} 反馈已保存。`,
  };
}
