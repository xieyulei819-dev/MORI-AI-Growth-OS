/**
 * Seeds the SQLite database with the MORI 森屿 demo dataset.
 *
 * Run with:  npm run db:setup   (prisma db push + this script)
 *            npm run db:reset   (force reset + this script)
 *
 * Everything written here is DEMO / 模拟业务数据 for a fictional brand.
 */

import { PrismaClient } from "@prisma/client";

import { DEMO_PERIOD_START, DEMO_PERIOD_END } from "@/lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  const demo = await import("@/lib/demo-data");
  const { PROMPT_LIBRARY } = await import("@/lib/prompts");
  const { formatMetricValue } = await import("@/lib/metrics");

  console.log("→ 清空旧数据 …");
  await prisma.experimentVariant.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.audienceMetric.deleteMany();
  await prisma.dataset.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.creative.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.report.deleteMany();
  await prisma.promptTemplate.deleteMany();
  await prisma.evaluationRecord.deleteMany();
  await prisma.setting.deleteMany();

  console.log("→ 写入品牌 / 产品 / 人群 / 竞品 …");
  await prisma.brand.create({ data: demo.buildDemoBrand() });
  await prisma.product.create({ data: demo.buildDemoProduct() });
  await prisma.persona.createMany({ data: demo.buildDemoPersonas() });
  await prisma.competitor.createMany({ data: demo.buildDemoCompetitors() });

  console.log("→ 写入 Campaign / Creative …");
  await prisma.campaign.createMany({
    data: demo.DEMO_CAMPAIGNS.map((campaign, index) => ({
      name: campaign.name,
      objective: campaign.objective,
      platform: campaign.platform,
      status: campaign.status,
      budget: campaign.budget,
      note: campaign.note,
      startDate: new Date(DEMO_PERIOD_START + "T00:00:00.000Z"),
      endDate: new Date(DEMO_PERIOD_END + "T00:00:00.000Z"),
      createdAt: new Date(Date.UTC(2026, 7, 10 + index)),
    })),
  });

  await prisma.creative.createMany({
    data: demo.DEMO_CREATIVE_SPECS.map((creative) => ({
      name: creative.name,
      campaign: creative.campaign,
      platform: creative.platform,
      theme: creative.theme,
      angle: creative.angle,
      hook: creative.hook,
      cta: creative.cta,
      audience: creative.audience,
      script: creative.script,
      priority: creative.priority,
      status: creative.status,
      targetCtr: creative.ctr,
      targetRoas: creative.roas,
    })),
  });

  console.log("→ 生成 30 天投放数据 …");
  const metrics = demo.buildDemoMetrics();
  await prisma.metric.createMany({
    data: metrics.map((row) => ({
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

  const audienceMetrics = demo.buildDemoAudienceMetrics();
  await prisma.audienceMetric.createMany({
    data: audienceMetrics.map((row) => ({
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

  console.log("→ 写入内容库 / 实验 / 洞察 / 评估 / Prompt …");
  await prisma.contentItem.createMany({ data: demo.buildDemoContents() });

  for (const experiment of demo.buildDemoExperiments()) {
    await prisma.experiment.create({
      data: {
        name: experiment.name,
        hypothesis: experiment.hypothesis,
        goal: experiment.goal,
        primaryMetric: experiment.primaryMetric,
        status: experiment.status,
        summary: experiment.summary,
        aiRecommendation: experiment.aiRecommendation,
        mode: "demo",
        startDate: new Date("2026-09-01T00:00:00.000Z"),
        endDate: new Date("2026-09-15T00:00:00.000Z"),
        variants: {
          create: experiment.variants.map((variant, index) => ({
            label: variant.label,
            name: variant.name,
            description: variant.description,
            impressions: variant.impressions,
            clicks: variant.clicks,
            conversions: variant.conversions,
            spend: variant.spend,
            revenue: variant.revenue,
            isWinner: experiment.status === "completed" && index === 1,
          })),
        },
      },
    });
  }

  await prisma.insight.createMany({ data: demo.buildDemoInsights() });

  await prisma.evaluationRecord.createMany({
    data: demo.buildDemoEvaluations().map((item) => ({
      task: item.task,
      agent: item.agent,
      completeness: item.completeness,
      relevance: item.relevance,
      actionability: item.actionability,
      accuracy: item.accuracy,
      overall: Math.round(
        item.completeness * 0.25 + item.relevance * 0.25 + item.actionability * 0.25 + item.accuracy * 0.25,
      ),
      notes: item.notes,
      mode: "demo",
    })),
  });

  await prisma.promptTemplate.createMany({
    data: PROMPT_LIBRARY.map((template) => ({
      agent: template.agent,
      name: template.name,
      nameZh: template.nameZh,
      version: template.version,
      description: template.description,
      body: template.body,
      outputSchema: template.outputSchema,
      changelog: template.changelog,
      isActive: true,
    })),
  });

  await prisma.setting.createMany({
    data: [
      { key: "demo_mode", value: process.env.DEMO_MODE ?? "true" },
      { key: "ai_provider", value: "OpenAI-compatible" },
      { key: "ai_model", value: process.env.OPENAI_MODEL ?? "gpt-4o-mini" },
      { key: "theme", value: "light" },
      { key: "dataset", value: "MORI demo dataset (30 days)" },
    ],
  });

  // Generate the first weekly report with the demo structured engine so the
  // Reports page is never empty on a fresh clone.
  console.log("→ 生成首份增长周报（Demo 引擎）…");
  try {
    const { getBusinessContext } = await import("@/lib/data");
    const { runAgent } = await import("@/lib/ai/runner");
    const { reportToMarkdown } = await import("@/lib/report");
    const context = await getBusinessContext();
    const result = await runAgent("report_writer", { context });
    await prisma.report.create({
      data: {
        title: result.data.title,
        periodStart: new Date(`${context.period.start}T00:00:00.000Z`),
        periodEnd: new Date(`${context.period.end}T00:00:00.000Z`),
        payload: JSON.stringify({
          report: result.data,
          meta: {
            generatedAt: result.meta.generatedAt,
            mode: result.meta.mode,
            model: result.meta.model,
            promptVersion: result.meta.promptVersion,
            dataLabel: context.dataSource.label,
          },
        }),
        mode: result.meta.mode,
      },
    });
    void reportToMarkdown;
  } catch (error) {
    console.warn("  （跳过首份周报生成）", error instanceof Error ? error.message : error);
  }

  const totals = {
    spend: metrics.reduce((acc, row) => acc + row.spend, 0),
    impressions: metrics.reduce((acc, row) => acc + row.impressions, 0),
    clicks: metrics.reduce((acc, row) => acc + row.clicks, 0),
    conversions: metrics.reduce((acc, row) => acc + row.conversions, 0),
    revenue: metrics.reduce((acc, row) => acc + row.revenue, 0),
  };
  const ctr = totals.clicks / totals.impressions;
  const cpc = totals.spend / totals.clicks;
  const cpa = totals.spend / totals.conversions;
  const roas = totals.revenue / totals.spend;

  console.log("");
  console.log("✅ Demo 数据写入完成（全部为模拟业务数据）");
  console.log(
    "   记录数：" +
      metrics.length +
      " 条投放记录 / " +
      new Set(metrics.map((row) => row.creative)).size +
      " 条素材 / " +
      new Set(metrics.map((row) => new Date(row.date).toISOString().slice(0, 10))).size +
      " 天",
  );
  console.log("   " + formatMetricValue("spend", totals.spend).padEnd(12) + "广告花费");
  console.log("   " + formatMetricValue("impressions", totals.impressions).padEnd(12) + "广告曝光");
  console.log("   " + formatMetricValue("clicks", totals.clicks).padEnd(12) + "点击");
  console.log("   " + formatMetricValue("ctr", ctr).padEnd(12) + "CTR");
  console.log("   " + formatMetricValue("cpc", cpc).padEnd(12) + "CPC");
  console.log("   " + formatMetricValue("conversions", totals.conversions).padEnd(12) + "转化");
  console.log("   " + formatMetricValue("cpa", cpa).padEnd(12) + "CPA");
  console.log("   " + formatMetricValue("roas", roas).padEnd(12) + "ROAS");
}

main()
  .catch((error) => {
    console.error("❌ Seed 失败：", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
