"use client";

import { CalendarDays, LayoutGrid, RefreshCw } from "lucide-react";

import { SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/feedback";
import type { IpPlanDto } from "@/lib/ip/store";

export function IpPlanView({
  plan,
  view,
  loading,
  onGenerate,
}: {
  plan: IpPlanDto | null;
  view: "matrix" | "plan";
  loading: boolean;
  onGenerate: () => void;
}) {
  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{view === "matrix" ? "内容矩阵" : "7 天内容计划"}</CardTitle>
            <CardDescription>把 IP 建成长期内容栏目，并排出 7 天计划（内容按比例混合，不会全是同一种）。</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[12.5px] text-ink-muted">
            还没有生成计划。点击下方按钮，Content Planner 会在选题池的基础上建立 4-6 个长期栏目，并排出 Day 1–Day 7。
          </p>
          <Button variant="moss" loading={loading} loadingLabel="生成中…" onClick={onGenerate}>
            <CalendarDays className="h-3.5 w-3.5" />
            生成内容矩阵 + 7 天计划
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { payload } = plan;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{view === "matrix" ? "内容矩阵" : "7 天内容计划"}</CardTitle>
            <CardDescription>{payload.summary}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={plan.mode === "ai" ? "moss" : plan.mode === "fallback" ? "warn" : "neutral"}>
              {plan.mode === "ai" ? "AI 生成" : plan.mode === "fallback" ? "AI 失败 · 已回退" : "本地引擎"}
            </Badge>
            <Button variant="outline" size="sm" loading={loading} onClick={onGenerate}>
              <RefreshCw className="h-3.5 w-3.5" />
              重新生成
            </Button>
          </div>
        </CardHeader>
      </Card>

      {payload.ratio.length > 0 ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>内容比例控制</CardTitle>
              <CardDescription>按比例混合，避免 7 天全部是同一种内容。</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {payload.ratio.map((item) => (
              <div key={item.bucket} className="surface-muted px-3.5 py-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] font-medium">{item.bucket}</p>
                  <span className="font-mono text-[12px]">{item.percent}%</span>
                </div>
                <Progress value={item.percent} tone="moss" className="mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {view === "matrix" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {payload.matrix.map((column) => (
            <Card key={column.column}>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2 text-[14px]">
                    <LayoutGrid className="h-3.5 w-3.5 text-ink-soft" />
                    {column.column}
                  </CardTitle>
                  <CardDescription>{column.positioning}</CardDescription>
                </div>
                <Badge tone="moss">{column.topics.length} 选题</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="surface-muted px-3 py-2.5">
                    <p className="label-text mb-1">目标用户</p>
                    <p className="text-[11.5px] leading-relaxed text-ink-muted">{column.targetUser}</p>
                  </div>
                  <div className="surface-muted px-3 py-2.5">
                    <p className="label-text mb-1">视频形式</p>
                    <p className="text-[11.5px] leading-relaxed text-ink-muted">{column.videoForm}</p>
                  </div>
                </div>
                <ol className="space-y-1.5">
                  {column.topics.map((topic, index) => (
                    <li key={topic} className="flex gap-2 text-[12px] leading-relaxed text-ink-muted">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/12 font-mono text-[10px] text-moss-strong">
                        {index + 1}
                      </span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {payload.sevenDay.map((day) => (
            <Card key={day.day}>
              <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="moss">{day.day}</Badge>
                    <Badge tone="neutral">{day.bucket}</Badge>
                    <Badge tone="info">{day.form}</Badge>
                  </div>
                  <p className="text-[14px] font-semibold">{day.theme}</p>
                  <p className="text-[12px] leading-relaxed text-ink-muted">Hook：{day.hook}</p>
                </div>
                <p className="max-w-md text-[11.5px] leading-relaxed text-ink-soft">{day.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SignalBlocks bundle={payload} columns={2} />
    </div>
  );
}
