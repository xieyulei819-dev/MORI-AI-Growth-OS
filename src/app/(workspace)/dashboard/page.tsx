import { BarChart3, LineChart, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

import { SignalBlocks } from "@/components/ai/signal-blocks";
import { BreakdownChart } from "@/components/charts/breakdown-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { CreativeTable } from "@/components/dashboard/creative-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext, getInsightHistory } from "@/lib/data";
import { KPI_DEFINITIONS, type MetricKey } from "@/lib/metrics";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [context, insightHistory] = await Promise.all([getBusinessContext(), getInsightHistory(3)]);

  const { totals, daily, platforms, creatives, comparison, signals, brand, product, audience } = context;

  const trendData = daily.map((point) => ({
    date: point.date,
    spend: Math.round(point.spend),
    roas: Number(point.roas.toFixed(3)),
    ctr: Number((point.ctr * 100).toFixed(3)),
    cvr: Number((point.cvr * 100).toFixed(3)),
    benchmarkCtr: Number((totals.ctr * 100).toFixed(3)),
    conversions: point.conversions,
    clicks: point.clicks,
  }));

  const roasBenchmark = Number(totals.roas.toFixed(3));
  const ctrBenchmark = Number((totals.ctr * 100).toFixed(3));

  const sparklineFor = (key: MetricKey) => daily.map((point) => point[key]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="MORI AI Growth OS"
        titleEn="AI-Powered Growth Intelligence for Modern Brands"
        description="让 AI 帮品牌完成从用户洞察到增长优化的完整闭环。所有 KPI 均由 SQLite 中的投放记录实时计算，AI 洞察基于计算结果生成。"
        meta={
          <>
            <Badge tone="moss">品牌：{brand.name}</Badge>
            <Badge tone="neutral">产品：{product.name}</Badge>
            <Badge tone="neutral">周期：{context.period.label}</Badge>
            <Badge tone="neutral">数据：{context.dataSource.rows} 行</Badge>
            <DemoTag />
          </>
        }
        actions={
          <>
            <Link href="/advisor" className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
              <Sparkles className="h-3.5 w-3.5" /> 问 AI 增长顾问
            </Link>
            <Link href="/campaign" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <BarChart3 className="h-3.5 w-3.5" /> 上传投放数据
            </Link>
          </>
        }
      />

      <Section
        title="核心指标"
        titleEn="Key Metrics"
        description="环比口径：最近 7 天 vs 前 7 天（Demo 数据窗口）。箭头颜色代表指标方向是否对业务有利。"
      >
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_DEFINITIONS.map((definition) => (
            <KpiCard
              key={definition.key}
              metricKey={definition.key}
              label={definition.label}
              labelEn={definition.labelEn}
              value={totals[definition.key]}
              delta={comparison?.deltas[definition.key]}
              higherIsBetter={definition.higherIsBetter}
              hint={definition.hint}
              sparkline={sparklineFor(definition.key)}
            />
          ))}
        </div>
      </Section>

      <Section
        title="趋势与结构"
        titleEn="Trends"
        description="折线图 = 每日真实计算值（不含人工修饰）。ROAS 基准虚线为账户 30 天均值。"
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>广告花费趋势（过去 30 天）</CardTitle>
                <CardDescription>柱 = 每日花费，线 = 每日 ROAS（右轴）。</CardDescription>
              </div>
              <Badge tone={totals.roas >= 3 ? "good" : "warn"}>均值 ROAS {totals.roas.toFixed(2)}</Badge>
            </CardHeader>
            <CardContent>
              <TrendChart
                data={trendData}
                leftAxisLabel="花费 ¥"
                rightAxisLabel="ROAS"
                series={[
                  { key: "spend", label: "花费", kind: "bar", axis: "left", colorKey: "moss", unit: "currency" },
                  { key: "roas", label: "ROAS", kind: "line", axis: "right", colorKey: "clay", digits: 2, unit: "ratio" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>渠道表现</CardTitle>
                <CardDescription>按渠道计算的 ROAS（柱右侧为转化量）。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <BreakdownChart
                data={platforms.map((item) => ({
                  name: item.name,
                  value: Number(item.roas.toFixed(2)),
                  secondary: item.conversions,
                  highlight: item.roas === Math.max(...platforms.map((p) => p.roas)),
                }))}
                height={200}
              />
              <div className="space-y-2 border-t border-ink-line pt-3">
                {platforms.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11.5px]">
                    <span className="text-ink-muted">{item.name}</span>
                    <span className="font-mono text-ink-muted">
                      CPC {formatCurrency(item.cpc, { digits: 2 })} · CVR {formatPercent(item.cvr)} · 转化占比{" "}
                      {formatPercent(item.share, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>CTR / CVR 趋势</CardTitle>
                <CardDescription>点击效率与转化效率分开看，才能定位问题在哪一环。</CardDescription>
              </div>
              <div className="hidden gap-2 sm:flex">
                <Badge tone="info">CTR 均值 {formatPercent(totals.ctr)}</Badge>
                <Badge tone="moss">CVR 均值 {formatPercent(totals.cvr)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TrendChart
                data={trendData}
                height={220}
                series={[
                  { key: "ctr", label: "CTR %", kind: "line", axis: "left", colorKey: "moss", unit: "percent", digits: 2 },
                  { key: "cvr", label: "CVR %", kind: "line", axis: "left", colorKey: "info", unit: "percent", digits: 2 },
                  {
                    key: "benchmarkCtr",
                    label: "CTR 均值",
                    kind: "line",
                    axis: "left",
                    colorKey: "neutral",
                    unit: "percent",
                    digits: 2,
                  },
                ]}
                rightAxisLabel="%"
              />
              <p className="text-[11px] leading-relaxed text-ink-soft">
                提示：最近 7 天 CTR 基本持平（{comparison ? comparison.deltas.ctr.toFixed(1) : "0.0"}%），而 CVR 变化{" "}
                {comparison ? comparison.deltas.cvr.toFixed(1) : "0.0"}%，说明问题更可能出在承接环节。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>分人群效率</CardTitle>
                <CardDescription>分人群 CTR / CVR 对比（Demo 人群口径）。</CardDescription>
              </div>
              <Badge tone="neutral">{audience.length} 个人群</Badge>
            </CardHeader>
            <CardContent>
              {audience.length === 0 ? (
                <p className="text-[12px] text-ink-muted">当前数据集没有分人群指标。</p>
              ) : (
                <ul className="space-y-3">
                  {audience.map((segment) => (
                    <li key={segment.segment} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-medium">{segment.segment}</span>
                        <span className="font-mono text-ink-muted">
                          CTR {formatPercent(segment.ctr)} · CVR {formatPercent(segment.cvr)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-line/70">
                        <div
                          className="h-full rounded-full bg-moss"
                          style={{ width: `${Math.min(100, (segment.ctr / Math.max(...audience.map((s) => s.ctr))) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        title="AI 增长洞察"
        titleEn="AI Insights"
        description="以下结论由「本次数据的真实计算结果 + 结构化 AI 分析」生成，每条结论都带有可核对的证据字段。"
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={ctrBenchmark === 0 ? "neutral" : "moss"}>
              CTR 基准 {ctrBenchmark.toFixed(2)}%
            </Badge>
            <Badge tone="neutral">ROAS 基准 {roasBenchmark.toFixed(2)}</Badge>
          </div>
        }
      >
        <SignalBlocks bundle={signals} columns={2} />
      </Section>

      <Section title="素材表现排行榜" titleEn="Creative Ranking" description="按 ROAS 排序；CTR 指数 = 素材 CTR / 账户均值 CTR。">
        <CreativeTable items={creatives} benchmarks={totals} />
      </Section>

      <Section title="下一步建议" titleEn="Recommended Actions" description="按优先级排序的行动项，可直接进入对应模块继续操作。">
        <div className="grid gap-3.5 md:grid-cols-3">
          {[
            {
              title: "定位低效原因",
              body: `进入投放分析，用 AI 诊断“为什么某些素材 ROAS 低”，并拿到预算调整建议。`,
              href: "/campaign",
              label: "投放分析",
              icon: TrendingUp,
            },
            {
              title: "生成下一轮内容",
              body: `针对“23 岁熬夜女性”生成 5 个内容方向与 15 秒脚本，直接进入测试。`,
              href: "/content",
              label: "内容策划",
              icon: LineChart,
            },
            {
              title: "设计实验验证",
              body: `把假设变成 A/B 实验：真实使用场景 + 用户评价 vs 现有素材，主指标 CVR。`,
              href: "/experiments",
              label: "实验中心",
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/12 text-moss-strong">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[14px] font-semibold">{item.title}</p>
                  <p className="prose-copy">{item.body}</p>
                </div>
                <Link
                  href={item.href}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 inline-flex w-fit")}
                >
                  打开{item.label} →
                </Link>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section
        title="AI 分析历史"
        titleEn="Analysis Log"
        description="系统会把每次 AI 分析结果写入数据库（Insight 表），便于复盘与对比。"
      >
        {insightHistory.length === 0 ? (
          <p className="text-[12px] text-ink-muted">暂无分析记录。</p>
        ) : (
          <div className="surface divide-y divide-ink-line p-0">
            {insightHistory.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-[13px] font-medium">{item.title}</p>
                  <p className="text-[11.5px] text-ink-muted">{item.evidence}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{item.scope}</Badge>
                  <Badge tone={item.mode === "ai" ? "moss" : "neutral"}>{item.mode}</Badge>
                  <span className="font-mono text-[11px] text-ink-soft">{item.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <p className="text-[11px] leading-relaxed text-ink-soft">
        全部数字来自本地 SQLite 数据库计算（{formatNumber(totals.impressions)} 次曝光 / {formatNumber(totals.clicks)} 次点击 /{" "}
        {formatNumber(totals.conversions)} 次转化）。Demo / 模拟业务数据，不代表真实市场表现。
      </p>
    </div>
  );
}
