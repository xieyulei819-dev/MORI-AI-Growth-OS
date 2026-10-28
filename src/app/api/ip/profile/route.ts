import { NextResponse } from "next/server";

import { fail, serverError } from "@/lib/ip/api";
import { deleteProfile, getLatestPlan, getProfileDto, getTopics, listProfiles, todayRecommendation } from "@/lib/ip/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/ip/profile            → 历史记录列表
 *  GET /api/ip/profile?id=xxx     → 某个 IP 的完整记录（分析 + 选题 + 计划） */
export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      const history = await listProfiles(20);
      return NextResponse.json({ ok: true, data: { history } });
    }

    const profile = await getProfileDto(id);
    if (!profile) return fail("NOT_FOUND", "没有找到该 IP 记录。", 404);

    const [topics, plan] = await Promise.all([getTopics(profile.id), getLatestPlan(profile.id)]);
    return NextResponse.json({
      ok: true,
      data: { profile, topics, plan, today: todayRecommendation(topics) },
    });
  } catch (error) {
    return serverError(error, "无法读取历史记录。");
  }
}

/** DELETE /api/ip/profile?id=xxx */
export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return fail("INVALID_REQUEST", "缺少 id 参数。", 422);
    await deleteProfile(id);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (error) {
    return serverError(error, "无法删除该记录。");
  }
}
