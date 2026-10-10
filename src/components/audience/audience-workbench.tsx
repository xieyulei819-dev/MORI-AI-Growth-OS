"use client";

import { AgentRunner } from "@/components/ai/agent-runner";
import { BulletList, SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/feedback";
import type { AudienceAnalysis } from "@/lib/ai/schemas";

const OPPORTUNITY_CARDS = [
  { key: "user" as const, title: "用户机会", titleEn: "User", tone: "moss" as const },
  { key: "content" as const, title: "内容机会", titleEn: "Content", tone: "good" as const },
  { key: "product" as const, title: "产品机会", titleEn: "Product", tone: "info" as const },
  { key: "ad" as const, title: "广告机会", titleEn: "Ad", tone: "clay" as const },
];

export function AudienceWorkbench({ datasetId }: { datasetId?: string | null }) {
  return (
    <AgentRunner<AudienceAnalysis>
      endpoint="/api/audience/analyze"
      payload={{ datasetId: datasetId ?? null }}
      variant="moss"
      labels={{
        idle: "AI 分析用户",
        loading: "Analyzing audience...",
        success: "Analysis completed",
        error: "Unable to generate insights.",
      }}
      render={(data) => (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>人群机会总结</CardTitle>
                <CardDescription>基于 Persona 表与分人群投放指标生成。</CardDescription>
              </div>
              <Badge tone="moss">{data.personas.length} 个人群</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-[13px] leading-relaxed text-ink-muted">{data.summary}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {OPPORTUNITY_CARDS.map((card) => (
              <Card key={card.key} className="h-full">
                <CardHeader>
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>
                      <span className="font-serif italic">{card.titleEn} Opportunity</span>
                    </CardDescription>
                  </div>
                  <Badge tone={card.tone}>{data.opportunityCards[card.key].length}</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {data.opportunityCards[card.key].map((item) => (
                      <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink-muted">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>推荐广告角度</CardTitle>
                  <CardDescription>可直接作为素材开头的 Hook，与人群痛点一一对应。</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.adAngles.map((angle) => (
                  <div key={angle.angle} className="surface-muted px-4 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold">{angle.angle}</p>
                      <Badge tone="neutral">{angle.audience}</Badge>
                    </div>
                    <p className="mt-2 text-[12.5px] font-medium text-ink">「{angle.hook}」</p>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{angle.rationale}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>人群画像明细</CardTitle>
                  <CardDescription>AI 对每个人群的结构化解读（痛点 / 动机 / 阻力 / 内容偏好）。</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.personas.map((persona) => (
                  <div key={persona.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold">{persona.name}</p>
                      <span className="text-[11px] text-ink-soft">{persona.segment}</span>
                    </div>
                    <Progress value={Math.min(100, persona.painPoints.length * 22)} tone="moss" />
                    <ul className="space-y-1 text-[11.5px] leading-relaxed text-ink-muted">
                      {persona.painPoints.slice(0, 2).map((item) => (
                        <li key={item}>· {item}</li>
                      ))}
                      <li className="text-ink-soft">· 购买阻力：{persona.barriers[0] ?? "—"}</li>
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <SignalBlocks bundle={data} columns={2} />

          <BulletList title="下一步动作" items={data.recommendations.map((item) => item.body)} tone="info" />
        </div>
      )}
    />
  );
}
