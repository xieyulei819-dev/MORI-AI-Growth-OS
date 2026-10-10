import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
  platform: z.string().min(1).max(40),
  objective: z.string().min(1).max(40),
  audience: z.string().min(1).max(80),
  theme: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const { datasetId, ...selection } = parsed.data;
    const context = await getBusinessContext({ datasetId: datasetId ?? null });
    const result = await runAgent("creative_strategist", { context, creativeSelection: selection });

    await saveInsights("creative", "creative_strategist", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "无法生成素材方向，请稍后重试。");
  }
}
