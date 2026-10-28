import { z } from "zod";

import { fail, ipOk, parseBody, readJson, serverError } from "@/lib/ip/api";
import { normalizeIpInput, resolveIndustry } from "@/lib/ip/input";
import { runIpAgent } from "@/lib/ip/runner";
import { getProfileDto, replaceTopics, todayRecommendation } from "@/lib/ip/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  profileId: z.string().min(1),
  feedback: z
    .object({
      action: z.string().max(20),
      reason: z.string().max(200).optional(),
      previousTitle: z.string().max(120).optional(),
    })
    .optional(),
});

/** Step 4-5：生成选题池、评分，并由系统计算 TOP 5 与今日推荐。 */
export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const profile = await getProfileDto(parsed.data.profileId);
    if (!profile) return fail("NOT_FOUND", "没有找到该 IP 记录，请重新分析。", 404);

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

    const result = await runIpAgent("ip_topic_strategist", {
      input,
      industryKey,
      analysis: profile.analysis ?? undefined,
      trends: profile.trends ?? undefined,
      feedback: parsed.data.feedback,
    });

    const topics = await replaceTopics(profile.id, result.data.topics.slice(0, 15), result.meta.mode);
    const today = todayRecommendation(topics);

    const strategy = {
      summary: result.data.summary,
      top5: result.data.top5,
      contentRatio: result.data.contentRatio,
      insights: result.data.insights,
      opportunities: result.data.opportunities,
      risks: result.data.risks,
      recommendations: result.data.recommendations,
    };

    return ipOk({ strategy, topics, today }, result.meta);
  } catch (error) {
    return serverError(error, "无法生成选题池，请稍后重试。");
  }
}
