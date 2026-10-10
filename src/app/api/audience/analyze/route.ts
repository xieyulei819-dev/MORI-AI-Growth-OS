import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
  focus: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });
    if (context.audience.length === 0) {
      return fail(
        "NO_AUDIENCE_DATA",
        "当前数据集缺少分人群指标（AudienceMetric），无法生成人群结论。请使用 Demo 数据集或补充人群维度数据。",
        409,
      );
    }

    const result = await runAgent("audience_analyst", {
      context,
      extraNotes: parsed.data.focus,
    });

    await saveInsights("audience", "audience_analyst", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "无法生成用户洞察，请稍后重试。");
  }
}
