import { Database, UploadCloud } from "lucide-react";
import Link from "next/link";

import { CampaignAnalysisPanel } from "@/components/campaign/campaign-analysis";
import { CsvUploader } from "@/components/campaign/csv-uploader";
import { CreativeTable } from "@/components/dashboard/creative-table";
import { TrendChart } from "@/components/charts/trend-chart";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getBusinessContext, getCampaignRecords, getDatasetOptions } from "@/lib/data";
import { formatCompactNumber, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ datasetId?: string }>;
}) {
  const params = await searchParams;
  const datasetId = params.datasetId ?? null;

  const [context, campaigns, datasets] = await Promise.all([
    getBusinessContext({ datasetId }),
    getCampaignRecords(),
    getDatasetOptions(),
  ]);

  const { totals, daily, campaigns: campaignPerformance, comparison } = context;
  const activeDataset = datasets.find((dataset) => dataset.id === datasetId);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campaign Analytics"
        title="广告投放分析"
        titleEn="Campaign Analytics"
        description="上传投放 CSV，系统自动清洗数据、计算 CTR / CPC / CVR / CPA / ROAS，识别高效与低效素材，并由 Performance Analyst Agent 给出诊断与预算建议。"
        meta={
          <>
            <Badge tone={datasetId ? "clay" : "moss"}>
              当前数据集：{activeDataset?.name ?? "Demo 数据集（30 天）"}
            </Badge>
            <Badge tone="neutral">{context.dataSource.rows} 行记录</Badge>
            <Badge tone="neutral">周期 {context.period.label}</Badge>
            <DemoTag />
          </>
        }
        actions={
          <Link href="#upload" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <UploadCloud className="h-3.5 w-3.5" /> 上传新数据
          </Link>
        }
      />

      <Section title="数据集" titleEn="Datasets" description="切换数据集会重新计算全页指标；上传的数据会保存到数据库。">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/campaign"
            className={
              datasetId
                ? buttonVariants({ variant: "outline", size: "sm" })
                : buttonVariants({ variant: "primary", size: "sm" })
            }
          >
            <Database className="h-3.5 w-3.5" /> Demo 数据集（30 天）
          </Link>
          {datasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/campaign?datasetId=${dataset.id}`}
              className={
                datasetId === dataset.id
                  ? buttonVariants({ variant: "primary", size: "sm" })
                  : buttonVariants({ variant: "outline", size: "sm" })
              }
            >
              {dataset.name}
            </Link>
          ))}
          {datasets.length === 0 ? (
            <span className="text-[11.5px] text-ink-soft">还没有上传数据集 —— 上传 CSV 后会出现在这里。</span>
          ) : null}
        </div>
      </Section>

      <Section title="关键指标（当前数据集）" titleEn="KPI Snapshot">
        <div className="grid gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "花费", value: formatCurrency(totals.spend) },
            { label: "曝光", value: formatCompactNumber(totals.impressions) },
            { label: "点击", value: formatNumber(totals.clicks) },
            { label: "CTR", value: formatPercent(totals.ctr) },
            { label: "CPC", value: formatCurrency(totals.cpc, { digits: 2 }) },
            { label: "ROAS", value: totals.roas.toFixed(2) },
          ].map((item) => (
            <div key={item.label} className="surface p-4">
              <p className="text-[11px] text-ink-soft">{item.label}</p>
              <p className="data-value mt-1.5 text-[18px] font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="趋势与结构"
        titleEn="Trend & Structure"
        description="每日花费与 ROAS：可以直接看到最近 7 天效率下滑的过程。"
      >
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>每日花费 / ROAS / CVR</CardTitle>
                <CardDescription>数据来源：当前数据集的 Metric 表。</CardDescription>
              </div>
              <Badge tone={(comparison?.deltas.roas ?? 0) < 0 ? "bad" : "good"}>
                ROAS 环比 {comparison ? comparison.deltas.roas.toFixed(1) : "0.0"}%
              </Badge>
            </CardHeader>
            <CardContent>
              <TrendChart
                data={daily.map((point) => ({
                  date: point.date,
                  spend: Math.round(point.spend),
                  roas: Number(point.roas.toFixed(3)),
                  cvr: Number((point.cvr * 100).toFixed(3)),
                }))}
                height={250}
                series={[
                  { key: "spend", label: "花费", kind: "bar", axis: "left", colorKey: "moss", unit: "currency" },
                  { key: "roas", label: "ROAS", kind: "line", axis: "right", colorKey: "clay", unit: "ratio", digits: 2 },
                  { key: "cvr", label: "CVR %", kind: "line", axis: "right", colorKey: "info", unit: "percent" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>广告计划表现</CardTitle>
                <CardDescription>按 Campaign 聚合（{campaigns.length} 个计划）。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaignPerformance.map((item) => (
                <div key={item.name} className="border-b border-ink-line pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-medium">{item.name}</p>
                    <span className="font-mono text-[12px]">ROAS {item.roas.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    花费 {formatCurrency(item.spend)} · CTR {formatPercent(item.ctr)} · CPA{" "}
                    {formatCurrency(item.cpa, { digits: 2 })} · 转化 {formatNumber(item.conversions)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="素材效率明细" titleEn="Creative Efficiency" description="按 ROAS 排序，含 CTR 指数与诊断标签。">
        <CreativeTable items={context.creatives} benchmarks={totals} />
      </Section>

      <Section
        title="投放计划清单"
        titleEn="Campaign List"
        description="Demo 数据集对应的 5 个广告计划（Campaign 表）。"
      >
        <div className="surface overflow-hidden p-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="pl-5">计划名称</TH>
                <TH>渠道</TH>
                <TH>目标</TH>
                <TH className="text-right">预算</TH>
                <TH>状态</TH>
                <TH className="pr-5">说明</TH>
              </TR>
            </THead>
            <TBody>
              {campaigns.map((campaign) => (
                <TR key={campaign.id}>
                  <TD className="pl-5 font-medium">{campaign.name}</TD>
                  <TD>
                    <Badge tone="neutral">{campaign.platform}</Badge>
                  </TD>
                  <TD className="text-ink-muted">{campaign.objective}</TD>
                  <TD className="text-right font-mono">{formatCurrency(campaign.budget)}</TD>
                  <TD>
                    <Badge tone={campaign.status === "running" ? "good" : "neutral"}>{campaign.status}</Badge>
                  </TD>
                  <TD className="max-w-[320px] whitespace-normal text-[11.5px] text-ink-muted pr-5">{campaign.note}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Section>

      <Section
        id="upload"
        title="上传投放数据"
        titleEn="CSV Upload"
        description="支持拖拽、选择文件或直接粘贴。系统会校验表头、日期与数字字段，并在计算指标前给出数据质量问题清单。"
      >
        <CsvUploader />
      </Section>

      <Section
        title="AI 投放分析"
        titleEn="AI Campaign Analysis"
        description="输出结构：Diagnosis / Main Reason / Hypothesis / Winners / Losers / Budget Moves / Experiments + 四类结构化结论。"
      >
        <CampaignAnalysisPanel datasetId={datasetId} />
      </Section>
    </div>
  );
}
