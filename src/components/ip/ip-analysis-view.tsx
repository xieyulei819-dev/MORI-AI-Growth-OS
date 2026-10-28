"use client";

import { Quote, ShieldCheck, Sparkles, Users } from "lucide-react";

import { SignalBlocks } from "@/components/ai/signal-blocks";
import { LabelBadge } from "@/components/ip/ip-labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Progress, StatusBadge } from "@/components/ui/feedback";
import type { IpAnalysis, TrendResearch } from "@/lib/ip/schemas";
import type { TrendSearchStatus } from "@/lib/ip/search";
import type { IpRunMeta } from "@/lib/ip/runner";

export function IpAnalysisView({
  analysis,
  trends,
  searchStatus,
  analysisMeta,
  trendMeta,
  completeness,
}: {
  analysis: IpAnalysis | null;
  trends: TrendResearch | null;
  searchStatus: TrendSearchStatus | null;
  analysisMeta: IpRunMeta | null;
  trendMeta: IpRunMeta | null;
  completeness: { provided: string[]; missing: string[] } | null;
}) {
  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>IP 分析</CardTitle>
            <CardDescription>输入 IP 名称并点击「开始分析」，这里会显示 AI 对 IP 的判断。</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Alert tone="info" title="系统会区分「事实 / AI推测 / 需要进一步验证」">
            信息不足时不会编造事实，而是明确标注为推测，并告诉你还需要补充什么。
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>IP 分析</CardTitle>
            <CardDescription>{analysis.summary}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {analysisMeta ? <StatusBadge mode={analysisMeta.mode} /> : null}
            <Badge tone="neutral">整体置信度 {analysis.overallConfidence}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <GuessCard title="行业判断" guess={analysis.industryGuess} />
            <GuessCard title="城市判断" guess={analysis.cityGuess} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="surface-muted px-4 py-3">
              <p className="label-text mb-1">人物身份</p>
              <p className="text-[12.5px] leading-relaxed text-ink">{analysis.identity}</p>
            </div>
            <div className="surface-muted px-4 py-3">
              <p className="label-text mb-1">所在领域</p>
              <p className="text-[12.5px] leading-relaxed text-ink">{analysis.domain}</p>
            </div>
          </div>
          {completeness ? (
            <p className="text-[11px] text-ink-soft">
              本次使用的信息：{completeness.provided.join("、")}
              {completeness.missing.length > 0 ? `；仍缺少：${completeness.missing.join("、")}` : ""}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>目标受众与内容优势</CardTitle>
            <CardDescription>用户为什么会关注这个 IP，以及哪些内容方向更容易建立信任。</CardDescription>
          </div>
          <Badge tone="neutral">{analysis.targetAudiences.length} 类人群</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {analysis.targetAudiences.map((audience) => (
              <div key={audience.name} className="surface-muted px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[13px] font-medium">
                    <Users className="h-3.5 w-3.5 text-ink-soft" />
                    {audience.name}
                  </p>
                  <LabelBadge label={audience.label} />
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">关注原因：{audience.whyFollow}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">想看内容：{audience.contentNeed}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <DirectionList title="内容优势" items={analysis.contentStrengths} tone="moss" />
            <DirectionList title="容易建立信任" items={analysis.trustDirections} tone="good" />
            <DirectionList title="容易产生互动" items={analysis.interactionDirections} tone="info" />
          </div>
          <DirectionList title="可能带来商业转化" items={analysis.conversionDirections} tone="clay" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>推测与需要补充的信息</CardTitle>
            <CardDescription>每一条推测都标注了性质与依据；不确定的地方不会写成事实。</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2.5">
            {analysis.inferences.map((item) => (
              <div key={item.statement} className="surface-muted px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12.5px] leading-relaxed text-ink">{item.statement}</p>
                  <LabelBadge label={item.label} />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={item.confidence} tone="moss" className="max-w-[160px]" />
                  <span className="text-[10.5px] text-ink-soft">置信度 {item.confidence}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">依据：{item.basis}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="surface-muted px-4 py-3">
              <p className="label-text mb-2 flex items-center gap-1.5">
                <Quote className="h-3.5 w-3.5" /> 需要补充的信息
              </p>
              <ul className="space-y-1.5">
                {analysis.missingInfo.map((item) => (
                  <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-muted px-4 py-3">
              <p className="label-text mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> 风险提醒
              </p>
              <ul className="space-y-1.5">
                {analysis.cautions.map((item) => (
                  <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>联网热点研究</CardTitle>
            <CardDescription>
              {searchStatus?.performed
                ? `已通过 ${searchStatus.provider} 联网搜索（${searchStatus.resultCount} 条结果）`
                : "未配置 / 未获取到联网结果，热点均为 AI 推测"}
            </CardDescription>
          </div>
          {trendMeta ? <StatusBadge mode={trendMeta.mode} /> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert tone={searchStatus?.performed ? "success" : "warning"} title="热点可靠性说明">
            {trends?.reliabilityNote ?? "当前没有找到足够可靠的热点信息。"}
          </Alert>

          {trends && trends.hotTopics.length > 0 ? (
            <div className="space-y-2.5">
              {trends.hotTopics.map((item) => (
                <div key={item.title} className="surface-muted px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12.5px] font-medium">{item.title}</p>
                    <LabelBadge label={item.label} />
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{item.summary}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-moss-strong">与本 IP 的相关性：{item.whyRelevant}</p>
                  {item.sourceUrl ? (
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1.5 block truncate text-[11px] text-moss-strong underline-offset-2 hover:underline">
                      来源：{item.sourceTitle || item.sourceUrl}
                    </a>
                  ) : (
                    <p className="mt-1.5 text-[10.5px] text-ink-soft">无来源 · 仅供方向参考</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-ink-muted">当前没有找到足够可靠的热点信息。</p>
          )}

          {trends && trends.userPainPoints.length > 0 ? (
            <div className="surface-muted px-4 py-3">
              <p className="label-text mb-2">用户痛点（{trends.userPainPoints.length}）</p>
              <ul className="space-y-1.5">
                {trends.userPainPoints.map((item) => (
                  <li key={item.pain} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
                    <span>
                      {item.pain}
                      <span className="ml-1.5 text-[10.5px] text-ink-soft">（{item.label}）</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {trends ? (
            <div className="grid gap-3 md:grid-cols-2">
              <MiniTrendList title="政策 / 规则变化" items={trends.policyChanges.map((item) => item.title)} />
              <MiniTrendList title="行业争议" items={trends.contradictions.map((item) => item.title)} />
              <MiniTrendList title="同行热门选题" items={trends.peerTopics.map((item) => item.title)} />
              <MiniTrendList title="与该 IP 相关的近期事件" items={trends.ipEvents.map((item) => item.title)} emptyHint="没有找到可靠的相关事件。" />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-ink-soft" />
          <p className="text-[13px] font-semibold">结构化结论</p>
        </div>
        <SignalBlocks bundle={analysis} columns={2} />
      </div>
    </div>
  );
}

function GuessCard({
  title,
  guess,
}: {
  title: string;
  guess: { value: string; confidence: number; label: string; basis: string };
}) {
  return (
    <div className="surface-muted px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="label-text">{title}</p>
        <LabelBadge label={guess.label} />
      </div>
      <p className="mt-1 text-[13px] font-medium text-ink">{guess.value}</p>
      <div className="mt-2 flex items-center gap-3">
        <Progress value={guess.confidence} tone="moss" className="max-w-[140px]" />
        <span className="text-[10.5px] text-ink-soft">置信度 {guess.confidence}</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">依据：{guess.basis}</p>
    </div>
  );
}

function DirectionList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "moss" | "good" | "info" | "clay";
}) {
  if (items.length === 0) return null;
  return (
    <div className="surface-muted px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <p className="text-[12.5px] font-semibold">{title}</p>
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniTrendList({ title, items, emptyHint }: { title: string; items: string[]; emptyHint?: string }) {
  return (
    <div className="surface-muted px-4 py-3">
      <p className="label-text mb-2">{title}</p>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11.5px] text-ink-soft">{emptyHint ?? "暂无可信信息。"}</p>
      )}
    </div>
  );
}
