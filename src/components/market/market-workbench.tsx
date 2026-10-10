"use client";

import { AgentRunner } from "@/components/ai/agent-runner";
import { BulletList, SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketAnalysis } from "@/lib/ai/schemas";

export function MarketWorkbench({
  datasetId,
  themeFrequency,
}: {
  datasetId?: string | null;
  themeFrequency: Array<{ theme: string; count: number; competitors: string[] }>;
}) {
  return (
    <div className="space-y-5">
      <div className="surface p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold">竞品高频内容主题</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              在 3 个虚拟竞品的内容主题中出现的频次，频次越高说明该主题越拥挤。
            </p>
          </div>
          <Badge tone="neutral">{themeFrequency.length} 个主题</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {themeFrequency.map((item) => (
            <span
              key={item.theme}
              className={
                item.count >= 2
                  ? "chip chip-warn"
                  : "chip chip-neutral"
              }
              title={item.competitors.join(" / ")}
            >
              {item.theme} · {item.count}
            </span>
          ))}
        </div>
      </div>

      <AgentRunner<MarketAnalysis>
        endpoint="/api/market/analyze"
        payload={{ datasetId: datasetId ?? null }}
        labels={{
          idle: "生成 AI 竞品报告",
          loading: "Analyzing market...",
          success: "Analysis completed",
          error: "Unable to generate insights.",
        }}
        render={(data) => (
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>MORI 的竞争位置</CardTitle>
                  <CardDescription>价格 × 品牌专业度矩阵的结论化解读。</CardDescription>
                </div>
                <Badge tone="moss">Market Position</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] leading-relaxed text-ink-muted">{data.summary}</p>
                <div className="surface-muted px-4 py-3.5">
                  <p className="label-text mb-1">定位建议</p>
                  <p className="text-[13px] font-medium leading-relaxed text-ink">{data.positioningAdvice}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3.5 md:grid-cols-3">
              {data.competitiveGaps.map((gap) => (
                <Card key={gap.name} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-[13.5px]">市场空白：{gap.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[12.5px] leading-relaxed text-ink-muted">{gap.gap}</p>
                    <p className="mt-2.5 border-t border-ink-line pt-2.5 text-[11px] leading-relaxed text-ink-soft">
                      <span className="font-medium text-ink-muted">依据：</span>
                      {gap.evidence}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <SignalBlocks bundle={data} columns={2} />

            <BulletList title="下一阶段营销建议" items={data.recommendations.map((item) => item.body)} tone="info" />
          </div>
        )}
      />
    </div>
  );
}
