import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
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
    const result = await runAgent("market_analyst", { context, extraNotes: parsed.data.focus });

    await saveInsights("market", "market_analyst", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "无法生成竞品报告，请稍后重试。");
  }
}
