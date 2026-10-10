import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { getBusinessContext } from "@/lib/data";
import { prisma } from "@/lib/db";
import { evaluateExperiment, experimentMetricTable, type VariantMetrics } from "@/lib/experiments";
import type { AgentRunMeta } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  name: z.string().min(2).max(120),
  hypothesis: z.string().min(4).max(400),
  primaryMetric: z.enum(["ctr", "cvr", "cpa", "roas"]),
  variantACreative: z.string().min(1),
  variantBCreative: z.string().min(1),
  datasetId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const body = parsed.data;
    if (body.variantACreative === body.variantBCreative) {
      return fail("SAME_VARIANT", "A / B 两个变体不能选择同一条素材，请选择不同素材进行对照实验。", 422);
    }

    const context = await getBusinessContext({ datasetId: body.datasetId ?? null });
    if (context.dataSource.rows === 0) {
      return fail("EMPTY_DATASET", "当前数据集没有投放记录，无法创建基于真实数据的实验。", 409);
    }

    const metricsRows = context.creatives;
    const pick = (creative: string) => metricsRows.find((item) => item.name === creative);
    const aGroup = pick(body.variantACreative);
    const bGroup = pick(body.variantBCreative);

    if (!aGroup || !bGroup) {
      return fail("CREATIVE_NOT_FOUND", "所选素材在当前数据集中没有投放记录。", 404);
    }

    const toVariant = (label: string, group: typeof aGroup): VariantMetrics => ({
      label,
      name: group.name,
      description: `${group.platform} · ${group.campaign ?? "—"} · 花费 ${Math.round(group.spend)}`,
      impressions: group.impressions,
      clicks: group.clicks,
      conversions: group.conversions,
      spend: Number(group.spend.toFixed(2)),
      revenue: Number(group.revenue.toFixed(2)),
    });

    const evaluation = evaluateExperiment(toVariant("A", aGroup), toVariant("B", bGroup), body.primaryMetric);

    const experiment = await prisma.experiment.create({
      data: {
        name: body.name,
        hypothesis: body.hypothesis,
        goal: "验证素材角度对效率指标的影响",
        primaryMetric: evaluation.primaryMetric,
        status: "running",
        summary: `A ${evaluation.a.name} vs B ${evaluation.b.name}；${evaluation.primaryMetric.toUpperCase()} 差异 ${evaluation.liftPct.toFixed(1)}%。`,
        aiRecommendation: evaluation.recommendation,
        mode: "demo",
        startDate: new Date(`${context.period.end}T00:00:00.000Z`),
        endDate: new Date(new Date(`${context.period.end}T00:00:00.000Z`).getTime() + 7 * 86_400_000),
        variants: {
          create: [evaluation.a, evaluation.b].map((variant) => ({
            label: variant.label,
            name: variant.name,
            description: variant.description,
            impressions: variant.impressions,
            clicks: variant.clicks,
            conversions: variant.conversions,
            spend: variant.spend,
            revenue: variant.revenue,
            isWinner: evaluation.winner === variant.label,
          })),
        },
      },
    });

    const meta: AgentRunMeta = {
      mode: "demo",
      agent: "performance_analyst",
      model: "two-proportion z-test",
      promptVersion: "v1.5",
      latencyMs: 0,
      generatedAt: new Date().toISOString(),
    };

    return ok(
      {
        id: experiment.id,
        evaluation,
        metricTable: experimentMetricTable(evaluation),
      },
      meta,
      201,
    );
  } catch (error) {
    return serverError(error, "创建实验失败，请稍后重试。");
  }
}
