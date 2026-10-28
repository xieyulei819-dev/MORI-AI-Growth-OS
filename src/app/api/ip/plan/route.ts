import { z } from "zod";

import { fail, ipOk, parseBody, readJson, serverError } from "@/lib/ip/api";
import { normalizeIpInput, resolveIndustry } from "@/lib/ip/input";
import { runIpAgent } from "@/lib/ip/runner";
import { getProfileDto, getTopics, savePlan, toTopicItem } from "@/lib/ip/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({ profileId: z.string().min(1) });

/** Step 14-15：建立内容矩阵 + 生成 7 天内容计划（含内容比例控制）。 */
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
    const topics = await getTopics(profile.id);

    const result = await runIpAgent("ip_content_planner", {
      input,
      industryKey,
      analysis: profile.analysis ?? undefined,
      trends: profile.trends ?? undefined,
      topics: topics.map(toTopicItem),
    });

    const planId = await savePlan(profile.id, result.data, result.meta.mode);
    return ipOk({ planId, plan: result.data }, result.meta);
  } catch (error) {
    return serverError(error, "无法生成内容计划，请稍后重试。");
  }
}
