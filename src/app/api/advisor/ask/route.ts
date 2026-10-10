import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  question: z.string().min(2, "请输入完整问题").max(500),
  datasetId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });

    if (context.totals.impressions === 0) {
      return fail("EMPTY_DATASET", "当前数据集没有投放数据，AI 顾问无法给出基于数据的诊断。", 409);
    }

    const result = await runAgent("growth_advisor", {
      context,
      question: parsed.data.question,
    });

    await saveInsights("advisor", "growth_advisor", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "AI 顾问暂时无法回答，请稍后重试。");
  }
}
