"use client";

import { AlertOctagon, ArrowRight, CreditCard, Target, TrendingDown, TrendingUp } from "lucide-react";

import { AgentRunner } from "@/components/ai/agent-runner";
import { SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/feedback";
import type { CampaignAnalysis } from "@/lib/ai/schemas";

export type CampaignAnalyzeResponse = {
  analysis: CampaignAnalysis;
  snapshot: {
    datasetLabel: string;
    rows: number;
    period: { start: string; end: string; label: string; days: number };
    totals: { spend: number; ctr: number; cvr: number; cpa: number; roas: number };
    comparison: { deltas: Record<string, number> } | null;
  };
};

export function CampaignAnalysisPanel({ datasetId }: { datasetId?: string | null }) {
  return (
    <AgentRunner<CampaignAnalyzeResponse>
      endpoint="/api/campaign/analyze"
      payload={{ datasetId: datasetId ?? null }}
      labels={{
        idle: "AI Analyze Campaign",
        loading: "Analyzing campaign...",
        success: "Analysis completed",
        error: "Unable to generate insights.",
      }}
      render={({ analysis }) => (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>诊断结论</CardTitle>
                <CardDescription>{analysis.summary}</CardDescription>
              </div>
              <Badge tone="moss">Performance Analyst</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="surface-muted px-4 py-3.5">
                <p className="label-text mb-1">Diagnosis</p>
                <p className="text-[13px] leading-relaxed text-ink">{analysis.diagnosis}</p>
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="label-text mb-1">Main Reason</p>
                <p className="text-[13px] leading-relaxed text-ink">{analysis.mainReason}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3.5 md:grid-cols-3">
            {analysis.hypotheses.map((hypothesis) => (
              <Card key={hypothesis.hypothesis} className="h-full">
                <CardHeader>
                  <CardTitle className="text-[13px] leading-snug">{hypothesis.hypothesis}</CardTitle>
                  <Badge tone={hypothesis.confidence >= 75 ? "good" : hypothesis.confidence >= 60 ? "warn" : "neutral"}>
                    {hypothesis.confidence}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Progress value={hypothesis.confidence} tone={hypothesis.confidence >= 75 ? "good" : "warn"} />
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">{hypothesis.evidence}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-tone-good" /> 高表现素材
                  </CardTitle>
                  <CardDescription>建议加预算或复制结构</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.winners.map((item) => (
                  <div key={item.creative} className="surface-muted px-4 py-3">
                    <p className="text-[13px] font-medium">{item.creative}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{item.why}</p>
                    <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-tone-good">
                      <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {item.action}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-tone-bad" /> 低表现素材
                  </CardTitle>
                  <CardDescription>建议止损、换 Hook 或暂停</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.losers.map((item) => (
                  <div key={item.creative} className="surface-muted px-4 py-3">
                    <p className="text-[13px] font-medium">{item.creative}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{item.why}</p>
                    <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-tone-warn">
                      <AlertOctagon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {item.action}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-moss-strong" /> 预算调整建议
                </CardTitle>
                <CardDescription>从低效素材把预算转移到高效素材与测试预算。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.budgetMoves.map((move) => (
                <div key={move.from + move.to} className="surface-muted flex flex-col gap-1.5 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium">
                    <span className="text-tone-bad">{move.from}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-soft" />
                    <span className="text-tone-good">{move.to}</span>
                    <Badge tone="neutral">{move.amount}</Badge>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-ink-muted">{move.rationale}</p>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="label-text">建议继续测试的人群</span>
                {analysis.audiencesToTest.map((item) => (
                  <Badge key={item} tone="clay">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>下一轮实验建议</CardTitle>
                <CardDescription>可直接到实验中心创建并跟踪。</CardDescription>
              </div>
              <Badge tone="moss">{analysis.experiments.length} 个</Badge>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {analysis.experiments.map((experiment) => (
                <div key={experiment.name} className="surface-muted px-4 py-3.5">
                  <p className="text-[13px] font-semibold">{experiment.name}</p>
                  <div className="mt-2 space-y-1 text-[11.5px] text-ink-muted">
                    <p>A：{experiment.variantA}</p>
                    <p>B：{experiment.variantB}</p>
                    <p>
                      主指标：<span className="font-mono">{experiment.metric}</span>
                    </p>
                    <p className="text-ink-soft">假设：{experiment.hypothesis}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <SignalBlocks bundle={analysis} columns={2} />
        </div>
      )}
    />
  );
}
