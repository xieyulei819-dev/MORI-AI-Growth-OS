import { PersonaCard } from "@/components/audience/persona-card";
import { AudienceWorkbench } from "@/components/audience/audience-workbench";
import { Badge } from "@/components/ui/badge";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { Progress } from "@/components/ui/feedback";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getBusinessContext } from "@/lib/data";
import { formatCompactNumber, formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AudiencePage() {
  const context = await getBusinessContext();
  const { personas, audience, brand } = context;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Audience Intelligence"
        title="用户洞察"
        titleEn="Audience Intelligence"
        description={`${brand.name} 的目标人群由 3 个核心 Persona 与 5 个分人群投放数据切片共同构成。点击「AI 分析用户」会调用 Audience Analyst Agent，输出用户 / 内容 / 产品 / 广告四类机会。`}
        meta={
          <>
            <Badge tone="moss">Persona {personas.length} 个</Badge>
            <Badge tone="neutral">人群切片 {audience.length} 个</Badge>
            <Badge tone="neutral">目标：18–30 岁女性</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="核心用户画像" titleEn="Personas" description="画像字段来自 Persona 表，AI 分析会直接引用这些字段作为证据。">
        <div className="grid gap-4 xl:grid-cols-3">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </Section>

      <Section
        title="分人群投放表现"
        titleEn="Segment Performance"
        description="同账户总额的分人群再切分：CTR 指数与 CVR 指数以账户均值为 1.00 基准。"
      >
        <div className="surface overflow-hidden p-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="pl-5">人群</TH>
                <TH className="text-right">曝光</TH>
                <TH className="text-right">点击</TH>
                <TH className="text-right">CTR</TH>
                <TH className="text-right">CVR</TH>
                <TH className="text-right">点击成本</TH>
                <TH className="text-right">CPA</TH>
                <TH className="text-right">ROAS</TH>
                <TH className="pr-5">转化占比</TH>
              </TR>
            </THead>
            <TBody>
              {audience.map((segment) => (
                <TR key={segment.segment}>
                  <TD className="pl-5 font-medium">{segment.segment}</TD>
                  <TD className="text-right font-mono text-[12px] text-ink-muted">
                    {formatCompactNumber(segment.impressions)}
                  </TD>
                  <TD className="text-right font-mono text-[12px] text-ink-muted">{segment.clicks.toLocaleString("zh-CN")}</TD>
                  <TD className="text-right font-mono">
                    <span className={segment.ctrIndex >= 1 ? "text-tone-good" : "text-ink-muted"}>
                      {formatPercent(segment.ctr)}
                    </span>
                  </TD>
                  <TD className="text-right font-mono">
                    <span className={segment.cvrIndex >= 1 ? "text-tone-good" : "text-tone-warn"}>
                      {formatPercent(segment.cvr)}
                    </span>
                  </TD>
                  <TD className="text-right font-mono text-[12px] text-ink-muted">{formatCurrency(segment.cpc, { digits: 2 })}</TD>
                  <TD className="text-right font-mono text-[12px] text-ink-muted">{formatCurrency(segment.cpa, { digits: 2 })}</TD>
                  <TD className="text-right font-mono font-semibold">{segment.roas.toFixed(2)}</TD>
                  <TD className="pr-5">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right font-mono text-[11px] text-ink-muted">
                        {formatPercent(segment.share, 1)}
                      </span>
                      <Progress value={segment.share * 100 * 2} tone="moss" className="w-24" />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        <p className="text-[11px] leading-relaxed text-ink-soft">
          注意：18–24 岁女性的 CTR 高于 25–30 岁女性，但 CVR 更低 —— 这是本 Demo 里最重要的一个人群结论，AI
          顾问与周报都会引用它。
        </p>
      </Section>

      <Section title="AI 用户分析" titleEn="AI Audience Analysis" description="结构化输出：人群总结、四类机会卡片、推荐广告角度与结构化洞察。">
        <AudienceWorkbench />
      </Section>
    </div>
  );
}
