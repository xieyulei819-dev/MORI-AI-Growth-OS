import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { buildDemoAudienceMetrics, buildDemoMetrics } from "@/lib/demo-data";
import { prisma } from "@/lib/db";
import type { AgentRunMeta } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  action: z.enum(["clear-uploads", "regenerate-demo"]),
});

const META: AgentRunMeta = {
  mode: "demo",
  agent: "performance_analyst",
  model: "local",
  promptVersion: "v1.5",
  latencyMs: 0,
  generatedAt: new Date().toISOString(),
};

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    if (parsed.data.action === "clear-uploads") {
      const datasets = await prisma.dataset.findMany({ select: { id: true } });
      await prisma.dataset.deleteMany();
      return ok(
        {
          action: "clear-uploads",
          removedDatasets: datasets.length,
          message: `已删除 ${datasets.length} 个上传数据集及其投放记录（Demo 数据集不受影响）。`,
        },
        META,
      );
    }

    const demoRows = buildDemoMetrics();
    const audienceRows = buildDemoAudienceMetrics();

    await prisma.metric.deleteMany({ where: { source: "demo" } });
    await prisma.audienceMetric.deleteMany();

    await prisma.metric.createMany({
      data: demoRows.map((row) => ({
        date: new Date(row.date),
        platform: row.platform,
        campaign: row.campaign,
        creative: row.creative,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        revenue: row.revenue,
        source: "demo",
      })),
    });

    await prisma.audienceMetric.createMany({
      data: audienceRows.map((row) => ({
        date: new Date(row.date),
        segment: row.segment,
        age: row.age,
        gender: row.gender,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        revenue: row.revenue,
      })),
    });

    return ok(
      {
        action: "regenerate-demo",
        metricRows: demoRows.length,
        audienceRows: audienceRows.length,
        message: `已重新生成 Demo 投放数据：${demoRows.length} 条投放记录 + ${audienceRows.length} 条人群记录。`,
      },
      META,
    );
  } catch (error) {
    return serverError(error, "数据管理操作失败，请稍后重试。");
  }
}
