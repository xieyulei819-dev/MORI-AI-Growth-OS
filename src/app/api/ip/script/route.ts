import { z } from "zod";

import { fail, ipOk, parseBody, readJson, serverError } from "@/lib/ip/api";
import { normalizeIpInput, resolveIndustry } from "@/lib/ip/input";
import { runIpAgent } from "@/lib/ip/runner";
import { getTopicWithProfile, saveScript, toTopicItem } from "@/lib/ip/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  topicId: z.string().min(1),
  hookVersion: z.enum(["A", "B", "C"]).optional(),
});

/**
 * Step 7-10：点击选题 → 生成完整方案（主题 / 核心观点 / 目标观众 / Hook 多版本 /
 * 30-60-90 秒口播稿 / 镜头脚本 / 拍摄清单 / 标题 / 封面 / 评论引导）。
 */
export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const found = await getTopicWithProfile(parsed.data.topicId);
    if (!found) return fail("NOT_FOUND", "没有找到该选题，请重新生成选题池。", 404);

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
    const topicItem = toTopicItem(topic);
    const hookVersion = parsed.data.hookVersion ?? "A";

    const script = await runIpAgent("ip_script_writer", {
      input,
      industryKey,
      analysis: profile.analysis ?? undefined,
      topic: topicItem,
    });

    const shot = await runIpAgent("ip_shot_planner", {
      input,
      industryKey,
      topic: topicItem,
      script: script.data,
    });

    await saveScript({
      topicId: topic.id,
      hookVersion,
      script: script.data,
      shot: shot.data,
      scriptMode: script.meta.mode,
      shotMode: shot.meta.mode,
    });

    const selectedHook =
      script.data.hooks.find((item) => item.version === hookVersion)?.text ?? script.data.hooks[0]?.text ?? "";

    return ipOk(
      {
        topic,
        script: script.data,
        shot: shot.data,
        selectedHook,
        hookVersion,
      },
      script.meta,
    );
  } catch (error) {
    return serverError(error, "无法生成视频方案，请稍后重试。");
  }
}
