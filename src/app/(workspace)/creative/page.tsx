import { CreativeLab } from "@/components/creative/creative-lab";
import { CreativeTable } from "@/components/dashboard/creative-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext, getCreativeRecords } from "@/lib/data";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CreativePage() {
  const [context, creatives] = await Promise.all([getBusinessContext(), getCreativeRecords()]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Creative Lab"
        title="广告素材中心"
        titleEn="Creative Lab"
        description="输入平台、目标、人群与主题，AI 生成 5 个来自不同角度族的素材方向（场景痛点 / 肤感 / 价格 / 信任记录 / 专业解释），并给出测试优先级。"
        meta={
          <>
            <Badge tone="moss">在投素材 {creatives.length} 条</Badge>
            <Badge tone="neutral">目标基准：CTR / ROAS</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="生成素材方向" titleEn="Generate Creatives" description="每个方向都包含 Hook、时间轴脚本、CTA、目标人群与优先级理由。">
        <CreativeLab />
      </Section>

      <Section
        title="在投素材与历史表现"
        titleEn="Live Creatives"
        description="左侧为目标基准（Creative 表），右侧为实际表现（Metric 表计算），两者对比即为优化空间。"
      >
        <Card className="mb-4">
          <CardHeader>
            <div>
              <CardTitle>素材目标基准</CardTitle>
              <CardDescription>Demo 数据集设计目标：4 条被引用的基准素材严格对齐产品需求。</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {creatives.map((creative) => (
                <div key={creative.id} className="surface-muted px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12.5px] font-medium">{creative.name}</p>
                    <Badge tone="neutral">{creative.priority}</Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    {creative.platform} · {creative.angle} · 状态 {creative.status}
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{creative.hook}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <Badge tone="moss">目标 CTR {formatPercent(creative.targetCtr)}</Badge>
                    <Badge tone="clay">目标 ROAS {creative.targetRoas.toFixed(2)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <CreativeTable items={context.creatives} benchmarks={context.totals} showIndex />
      </Section>
    </div>
  );
}
