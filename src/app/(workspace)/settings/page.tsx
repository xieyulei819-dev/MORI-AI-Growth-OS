import { Badge } from "@/components/ui/badge";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { agentStatusSummary } from "@/lib/ai/runner";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const status = agentStatusSummary();
  const [metrics, audienceMetrics, datasets, contents, experiments, reports] = await Promise.all([
    prisma.metric.count(),
    prisma.audienceMetric.count(),
    prisma.dataset.count(),
    prisma.contentItem.count(),
    prisma.experiment.count(),
    prisma.report.count(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="设置"
        titleEn="Settings"
        description="AI Provider、Demo Mode、API 状态、模型、主题与数据管理。所有配置项都不需要在代码里写死。"
        meta={
          <>
            <Badge tone={status.mode === "ai" ? "moss" : "neutral"}>
              {status.mode === "ai" ? "AI Mode" : "Demo Mode"}
            </Badge>
            <Badge tone="neutral">模型：{status.model}</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="配置" titleEn="Configuration">
        <SettingsPanel
          aiStatus={{
            mode: status.mode,
            providerId: status.providerId,
            provider: status.provider,
            baseUrl: status.baseUrl,
            model: status.model,
            demoMode: status.demoMode,
            apiKeyConfigured: status.apiKeyConfigured,
            keySource: status.keySource,
            supportsJsonSchema: status.supportsJsonSchema,
            requestShapes: status.requestShapes,
            reason: status.reason,
          }}
          counts={{ metrics, audienceMetrics, datasets, contents, experiments, reports }}
        />
      </Section>
    </div>
  );
}
