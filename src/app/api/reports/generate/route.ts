import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });
    const result = await runAgent("report_writer", { context });

    const reportPayload = {
      report: result.data,
      meta: {
        generatedAt: result.meta.generatedAt,
        mode: result.meta.mode,
        model: result.meta.model,
        promptVersion: result.meta.promptVersion,
        dataLabel: context.dataSource.label,
      },
    };

    const stored = await prisma.report.create({
      data: {
        title: result.data.title,
        periodStart: new Date(`${context.period.start}T00:00:00.000Z`),
        periodEnd: new Date(`${context.period.end}T00:00:00.000Z`),
        payload: JSON.stringify(reportPayload),
        mode: result.meta.mode,
      },
    });

    await saveInsights(
      "report",
      "report_writer",
      result.meta.mode,
      { insights: result.data.keyInsights, opportunities: [], risks: [], recommendations: [] },
    );

    return ok({ id: stored.id, ...reportPayload }, result.meta);
  } catch (error) {
    return serverError(error, "生成增长报告失败，请稍后重试。");
  }
}
