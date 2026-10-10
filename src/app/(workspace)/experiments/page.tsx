import { FlaskConical } from "lucide-react";

import { ExperimentLab } from "@/components/experiments/experiment-lab";
import { VariantChart } from "@/components/charts/variant-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { Progress } from "@/components/ui/feedback";
import { evaluateExperiment, experimentMetricTable, type VariantMetrics } from "@/lib/experiments";
import { getBusinessContext, getExperimentList } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExperimentsPage() {
  const [context, experiments] = await Promise.all([getBusinessContext(), getExperimentList()]);
  const creativeNames = context.creatives.map((creative) => creative.name);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Experiment Lab"
        title="实验中心"
        titleEn="Experiment Lab"
        description="把增长假设变成可验证的模拟实验：选择两条素材（数据来自 Demo 数据集）作为 A / B 变体，系统用双比例 z 检验判断差异是否显著，并给出「继续测试 / 保留哪个变体」的建议。所有结论均为模拟数据推演，不代表真实投放。"
        meta={
          <>
            <Badge tone="moss">实验 {experiments.length} 个</Badge>
            <Badge tone="neutral">统计方法：two-proportion z-test</Badge>
            <Badge tone="neutral">主指标：CTR / CVR / CPA / ROAS</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="新建实验" titleEn="Create Experiment">
        <ExperimentLab creativeNames={creativeNames} />
      </Section>

      <Section title="实验列表" titleEn="Experiments" description="包含 Demo 预置实验与你在本页面创建的实验。">
        <div className="space-y-4">
          {experiments.map((experiment) => {
            const [a, b] = experiment.variants;
            const evaluation =
              a && b
                ? evaluateExperiment(
                    toVariantMetrics(a),
                    toVariantMetrics(b),
                    experiment.primaryMetric,
                  )
                : null;

            return (
              <Card key={experiment.id}>
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-moss-strong" />
                      {experiment.name}
                    </CardTitle>
                    <CardDescription>{experiment.hypothesis}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={experiment.status === "completed" ? "neutral" : "moss"}>
                      {experiment.status === "completed" ? "模拟实验 · 已完成推演" : "模拟实验 · 推演中"}
                    </Badge>
                    <Badge tone="neutral">主指标 {experiment.primaryMetric.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1.1fr]">
                    {experiment.variants.map((variant) => (
                      <div key={variant.id} className="surface-muted px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-semibold">
                            {variant.label} · {variant.name}
                          </p>
                          {variant.isWinner ? (
                            <Badge tone="good">建议保留</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{variant.description}</p>
                        <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[11px] text-ink-muted">
                          <span>曝光 {variant.impressions.toLocaleString("zh-CN")}</span>
                          <span>点击 {variant.clicks.toLocaleString("zh-CN")}</span>
                          <span>花费 {formatCurrency(variant.spend)}</span>
                          <span>转化 {variant.conversions}</span>
                        </div>
                      </div>
                    ))}
                    {evaluation ? <VariantChart data={experimentMetricTable(evaluation)} height={180} /> : null}
                  </div>

                  {evaluation ? (
                    <div className="grid gap-3 md:grid-cols-[1fr_1.2fr]">
                      <div className="surface-muted px-4 py-3">
                        <p className="label-text mb-2">统计检验</p>
                        {evaluation.test ? (
                          <div className="space-y-2 text-[11.5px] text-ink-muted">
                            <p>
                              z = <span className="font-mono">{evaluation.test.zScore.toFixed(3)}</span> · p ={" "}
                              <span className="font-mono">{evaluation.test.pValue.toFixed(4)}</span>
                            </p>
                            <Progress
                              value={evaluation.test.confidence}
                              tone={evaluation.test.significant ? "good" : "warn"}
                            />
                            <p>
                              置信度 {evaluation.test.confidence.toFixed(1)}% ·{" "}
                              {evaluation.test.significant ? "差异显著" : "未达显著"}
                            </p>
                            <p className="text-ink-soft">
                              A {formatPercent(evaluation.metrics.a.cvr)} → B{" "}
                              {formatPercent(evaluation.metrics.b.cvr)}（CVR 口径）
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11.5px] leading-relaxed text-ink-muted">
                            该主指标为比率型（CPA / ROAS），使用提升幅度判断；建议再用 CVR 做交叉验证。
                          </p>
                        )}
                      </div>
                      <div className="surface-muted px-4 py-3">
                        <p className="label-text mb-2">AI 实验解读（基于模拟数据推演）</p>
                        <p className="text-[12.5px] leading-relaxed text-ink-muted">
                          {evaluation.recommendation || experiment.aiRecommendation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] text-ink-muted">该实验缺少完整的 A / B 数据。</p>
                  )}

                  <p className="text-[11.5px] text-ink-soft">{experiment.summary}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function toVariantMetrics(variant: {
  label: string;
  name: string;
  description: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}): VariantMetrics {
  return {
    label: variant.label,
    name: variant.name,
    description: variant.description,
    impressions: variant.impressions,
    clicks: variant.clicks,
    conversions: variant.conversions,
    spend: variant.spend,
    revenue: variant.revenue,
  };
}
