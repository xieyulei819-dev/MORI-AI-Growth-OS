import { MatrixChart } from "@/components/charts/matrix-chart";
import { MarketWorkbench } from "@/components/market/market-workbench";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getBusinessContext } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const context = await getBusinessContext();
  const { competitors } = context;
  const others = competitors.filter((competitor) => !competitor.isSelf);

  const themeMap = new Map<string, { count: number; competitors: string[] }>();
  others.forEach((competitor) => {
    competitor.contentThemes.forEach((theme) => {
      const entry = themeMap.get(theme) ?? { count: 0, competitors: [] };
      entry.count += 1;
      entry.competitors.push(competitor.name);
      themeMap.set(theme, entry);
    });
  });
  const themeFrequency = Array.from(themeMap.entries())
    .map(([theme, value]) => ({ theme, count: value.count, competitors: value.competitors }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Market Intelligence"
        title="市场与竞品"
        titleEn="Market Intelligence"
        description="4 个品牌（MORI + 3 个虚拟竞品）的价格 × 专业度定位、内容主题与广告主题对比。所有竞品均为虚拟品牌，不指向任何真实企业。"
        meta={
          <>
            <Badge tone="moss">虚拟品牌 {competitors.length} 个</Badge>
            <Badge tone="neutral">维度：价格 / 专业度 / 内容 / 渠道</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="竞品矩阵" titleEn="Positioning Matrix" description="X 轴：价格；Y 轴：品牌专业度（0–100 感知分）。">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>价格 × 专业度矩阵</CardTitle>
                <CardDescription>MORI 位于中低价位、专业度中位——机会与风险都在这里。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <MatrixChart
                data={competitors.map((competitor) => ({
                  name: competitor.name,
                  price: competitor.price,
                  professional: competitor.professional,
                  isSelf: competitor.isSelf,
                  note: competitor.positioning,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>MORI 的竞争位置</CardTitle>
                <CardDescription>读数：越靠右越贵，越靠上越专业。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {competitors.map((competitor) => (
                <div key={competitor.id} className="flex items-center justify-between gap-3 border-b border-ink-line pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[13px] font-medium">
                      {competitor.name}
                      {competitor.isSelf ? <span className="ml-1.5 text-[11px] text-moss-strong">（本品牌）</span> : null}
                    </p>
                    <p className="text-[11px] text-ink-muted">{competitor.positioning}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[12.5px]">{formatCurrency(competitor.price)}</p>
                    <p className="font-mono text-[11px] text-ink-soft">专业度 {competitor.professional}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="竞品数据对比" titleEn="Competitor Data" description="价格、定位、用户、主要渠道、广告主题与强弱项。">
        <div className="surface overflow-hidden p-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="pl-5">品牌</TH>
                <TH>定位</TH>
                <TH className="text-right">价格</TH>
                <TH className="text-right">价格带</TH>
                <TH className="text-right">专业度</TH>
                <TH>目标用户</TH>
                <TH>主要渠道</TH>
                <TH>广告主题</TH>
                <TH className="pr-5">弱点</TH>
              </TR>
            </THead>
            <TBody>
              {competitors.map((competitor) => (
                <TR key={competitor.id} className={competitor.isSelf ? "bg-moss/6" : undefined}>
                  <TD className="pl-5 font-medium">
                    {competitor.name}
                    {competitor.isSelf ? <Badge tone="moss" className="ml-2">MORI</Badge> : null}
                  </TD>
                  <TD className="max-w-[180px] whitespace-normal text-[12px] text-ink-muted">{competitor.positioning}</TD>
                  <TD className="text-right font-mono">{formatCurrency(competitor.price)}</TD>
                  <TD className="text-right">
                    <Badge tone={competitor.price > 250 ? "info" : competitor.price < 120 ? "warn" : "neutral"}>
                      {competitor.priceTier}
                    </Badge>
                  </TD>
                  <TD className="text-right font-mono">{competitor.professional}</TD>
                  <TD className="max-w-[190px] whitespace-normal text-[12px] text-ink-muted">{competitor.audience}</TD>
                  <TD className="max-w-[160px] whitespace-normal text-[12px] text-ink-muted">
                    {competitor.mainChannels.join(" / ")}
                  </TD>
                  <TD className="max-w-[180px] whitespace-normal text-[12px] text-ink-muted">
                    {competitor.adThemes.join(" / ")}
                  </TD>
                  <TD className="max-w-[240px] whitespace-normal text-[12px] text-ink-muted pr-5">{competitor.weakness}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        {others.slice(0, 2).map((competitor) => (
          <Card key={competitor.id}>
            <CardHeader>
              <CardTitle>{competitor.name}</CardTitle>
              <Badge tone="clay">虚拟竞品</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-[12.5px] leading-relaxed">
              <p>
                <span className="label-text">优势</span>
                <br />
                <span className="text-ink-muted">{competitor.strength}</span>
              </p>
              <p>
                <span className="label-text">弱点</span>
                <br />
                <span className="text-ink-muted">{competitor.weakness}</span>
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {competitor.contentThemes.map((theme) => (
                  <Badge key={theme} tone="neutral">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Section
        title="AI 竞品分析"
        titleEn="AI Market Report"
        description="结构化输出：Insight（洞察）/ Opportunity（机会）/ Risk（风险）/ Recommendation（建议），并给出市场空白与定位建议。"
      >
        <MarketWorkbench themeFrequency={themeFrequency} />
      </Section>

      <p className="text-[11px] leading-relaxed text-ink-soft">
        说明：AURA LAB、NUVIA、LUMIÉ 均为本项目虚构的 Demo 竞品，用于演示竞品分析框架，不代表任何真实企业或真实市场数据。
      </p>
    </div>
  );
}
