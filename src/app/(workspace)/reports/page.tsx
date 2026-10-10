import { Badge } from "@/components/ui/badge";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { ReportStudio } from "@/components/reports/report-studio";
import { prisma } from "@/lib/db";
import { getBusinessContext } from "@/lib/data";
import { reportFromStoredPayload, type ReportMeta } from "@/lib/report";
import type { GrowthReport } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [context, reports] = await Promise.all([
    getBusinessContext(),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const latest = reports[0];
  let initial: { report: GrowthReport; meta: ReportMeta } | null = null;
  if (latest) {
    const parsed = JSON.parse(latest.payload) as { report: GrowthReport; meta: ReportMeta };
    const report = reportFromStoredPayload(JSON.stringify(parsed.report));
    if (report) initial = { report, meta: { ...parsed.meta, generatedAt: parsed.meta.generatedAt ?? latest.createdAt.toISOString() } };
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Growth Report"
        title="增长报告"
        titleEn="Growth Report"
        description="把一周的经营数据、人群表现、内容与投放结果整理成可以直接发给团队的增长周报，支持复制、下载 Markdown 与 PDF。"
        meta={
          <>
            <Badge tone="moss">历史报告 {reports.length} 份</Badge>
            <Badge tone="neutral">当前数据：{context.period.label}</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="生成报告" titleEn="Generate">
        <ReportStudio initial={initial} />
      </Section>

      <Section title="历史报告" titleEn="History" description="每次生成都会写入数据库（Report 表）。">
        {reports.length === 0 ? (
          <p className="text-[12px] text-ink-muted">暂无历史报告。</p>
        ) : (
          <div className="surface divide-y divide-ink-line p-0">
            {reports.map((report) => (
              <div key={report.id} className="flex flex-col gap-1.5 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[13px] font-medium">{report.title}</p>
                  <p className="text-[11px] text-ink-soft">
                    {report.periodStart.toISOString().slice(0, 10)} ~ {report.periodEnd.toISOString().slice(0, 10)} ·
                    生成于 {report.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </p>
                </div>
                <Badge tone={report.mode === "ai" ? "moss" : "neutral"}>{report.mode}</Badge>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
