import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
  question: z.string().max(400).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });

    if (context.totals.impressions === 0) {
      return fail("EMPTY_DATASET", "当前数据集没有可分析的投放记录，请先上传 CSV 或切换回 Demo 数据集。", 409);
    }

    const result = await runAgent("performance_analyst", {
      context,
      extraNotes: parsed.data.question,
    });

    await saveInsights("campaign", "performance_analyst", result.meta.mode, result.data);

    return ok(
      {
        analysis: result.data,
        snapshot: {
          datasetLabel: context.dataSource.label,
          rows: context.dataSource.rows,
          period: context.period,
          totals: context.totals,
          comparison: context.comparison,
        },
      },
      result.meta,
    );
  } catch (error) {
    return serverError(error, "投放分析失败，请稍后重试。");
  }
}
