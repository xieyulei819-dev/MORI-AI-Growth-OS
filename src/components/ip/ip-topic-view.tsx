"use client";

import {
  ArrowLeft,
  Bookmark,
  Camera,
  Clapperboard,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Wand2,
} from "lucide-react";
import * as React from "react";

import type { IpScriptViewState } from "@/components/ip/ip-workbench";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert, Progress, ScoreBar, Separator } from "@/components/ui/feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { notifyAiUsageChanged } from "@/lib/ai-usage-client";
import { SCORE_KEYS, SCORE_LABELS } from "@/lib/ip/scoring";
import type { IpTopicDto, TodayTopic } from "@/lib/ip/store";

const DISLIKE_REASONS = ["太普通", "太像广告", "没有创意", "我拍不了", "太复杂"];

type FeedbackResponse = {
  ok: boolean;
  data?: { topic: IpTopicDto; regenerated: boolean };
  error?: { message: string };
};

type ScriptResponse = {
  ok: boolean;
  data?: { topic: IpTopicDto; script: unknown; shot: unknown; selectedHook: string; hookVersion: string };
  error?: { message: string };
};

export function IpTopicView({
  topics,
  today,
  mode = "pool",
  script,
  onBack,
  onTopicsChanged,
  onTodayChanged,
  onShowScript,
  onRegenerateTopics,
}: {
  topics: IpTopicDto[];
  today: TodayTopic;
  mode?: "today" | "pool";
  selectedTopicId: string | null;
  script: IpScriptViewState | null;
  onBack: () => void;
  onSelectTopic: (id: string) => void;
  onTopicsChanged: (topics: IpTopicDto[]) => void;
  onTodayChanged: (today: TodayTopic) => void;
  onShowScript: (payload: IpScriptViewState) => void;
  onRegenerateTopics: (reason?: string) => Promise<void> | void;
}) {
  const [busyTopicId, setBusyTopicId] = React.useState<string | null>(null);
  const [dislikeOpenId, setDislikeOpenId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const isToday = mode === "today";

  const generateScript = React.useCallback(
    async (topicId: string) => {
      setBusyTopicId(topicId);
      setError(null);
      try {
        const response = await fetch("/api/ip/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId, hookVersion: "A" }),
        });
        const json = (await response.json()) as ScriptResponse;
        if (!response.ok || !json.ok || !json.data) {
          setError(json.error?.message ?? "生成视频方案失败。");
          return;
        }
        onShowScript({
          topic: json.data.topic,
          script: json.data.script as IpScriptViewState["script"],
          shot: json.data.shot as IpScriptViewState["shot"],
          selectedHook: json.data.selectedHook,
        });
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "网络异常。");
      } finally {
        setBusyTopicId(null);
        notifyAiUsageChanged();
      }
    },
    [onShowScript],
  );

  const sendFeedback = React.useCallback(
    async (topicId: string, action: "like" | "dislike" | "save" | "regenerate", reason?: string) => {
      setBusyTopicId(topicId);
      setError(null);
      setDislikeOpenId(null);
      try {
        const response = await fetch("/api/ip/topic/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId, action, reason }),
        });
        const json = (await response.json()) as FeedbackResponse;
        if (!response.ok || !json.ok || !json.data) {
          setError(json.error?.message ?? "操作失败。");
          return;
        }
        const updated = json.data.topic;
        const next = topics.map((topic) => (topic.id === updated.id ? updated : topic));
        onTopicsChanged(next);
        if (today && today.topic.id === updated.id && json.data.regenerated) {
          onTodayChanged(null);
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "网络异常。");
      } finally {
        setBusyTopicId(null);
        notifyAiUsageChanged();
      }
    },
    [topics, today, onTopicsChanged, onTodayChanged],
  );

  if (script) {
    return <ScriptDetail state={script} onBack={onBack} />;
  }

  const top5 = topics.filter((topic) => topic.isTop5);

  return (
    <div className="space-y-5">
      {error ? <Alert tone="error">{error}</Alert> : null}

      {today ? (
        <Card className="border-moss/30">
          <CardHeader>
            <div>
              <CardTitle>今日推荐 · 如果今天只拍一条</CardTitle>
              <CardDescription>由系统综合「推荐分 + 拍摄成本」自动选出，可一键生成脚本。</CardDescription>
            </div>
            <Badge tone="moss">综合分 {today.topic.overallScore}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[15px] font-semibold leading-snug">《{today.topic.title}》</p>
            <div className="surface-muted px-4 py-3">
              <p className="label-text mb-2">推荐原因</p>
              <ul className="space-y-1.5">
                {today.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="moss"
                loading={busyTopicId === today.topic.id}
                loadingLabel="生成方案中…"
                onClick={() => generateScript(today.topic.id)}
              >
                <Wand2 className="h-3.5 w-3.5" />
                立即生成脚本
              </Button>
              <Button variant="outline" onClick={() => onRegenerateTopics()}>
                <RefreshCw className="h-3.5 w-3.5" />
                换一批选题
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert tone="info" title="还没有选题池">
          在上方输入 IP 并点击「开始分析」，系统会自动生成选题池与今日推荐。
        </Alert>
      )}

      {top5.length > 0 ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>TOP 5 推荐选题</CardTitle>
              <CardDescription>综合推荐分由固定权重计算：热点15% · 痛点25% · 匹配20% · 差异化15% · 传播15% · 商业10%。</CardDescription>
            </div>
            <Badge tone="moss">{top5.length} 条</Badge>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {top5.map((topic, index) => (
              <div key={topic.id} className="surface-muted flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">
                    {index + 1}. {topic.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-ink-muted">{topic.recommendReason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{topic.topicType}</Badge>
                  <Badge tone="moss">{topic.overallScore}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {topics.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold">选题池（{topics.length}）</h2>
              <p className="mt-1 text-xs text-ink-muted">点击「生成视频方案」进入脚本；也可以点赞、收藏或让 AI 换一个。</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onRegenerateTopics()}>
              <RefreshCw className="h-3.5 w-3.5" />
              {isToday ? "换一批选题" : "重新生成选题池"}
            </Button>
          </div>

          {[...topics]
            .sort((a, b) => a.rank - b.rank)
            .map((topic) => (
              <Card key={topic.id} className={topic.isTop5 ? "border-moss/25" : undefined}>
                <CardHeader className="mb-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">#{topic.rank}</Badge>
                      <Badge tone="moss">{topic.topicType}</Badge>
                      {topic.isTop5 ? <Badge tone="good">TOP 5</Badge> : null}
                      {topic.feedback === "saved" ? <Badge tone="info">已收藏</Badge> : null}
                      {topic.feedback === "like" ? <Badge tone="good">已点赞</Badge> : null}
                      <span className="text-[11px] text-ink-soft">
                        {"★".repeat(topic.potentialStars)}
                        {"☆".repeat(5 - topic.potentialStars)}
                      </span>
                    </div>
                    <CardTitle className="text-[14px]">{topic.title}</CardTitle>
                  </div>
                  <Badge tone="moss">{topic.overallScore}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
                    <div className="space-y-2">
                      {SCORE_KEYS.map((key) => (
                        <ScoreBar key={key} label={`${SCORE_LABELS[key].zh} · ${SCORE_LABELS[key].en}`} value={topic.scores[key]} />
                      ))}
                      <Separator />
                      <ScoreBar label="综合推荐分" value={topic.overallScore} tone="moss" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="surface-muted px-3.5 py-2.5">
                        <p className="label-text mb-1">用户痛点</p>
                        <p className="text-[12px] leading-relaxed text-ink-muted">{topic.painPoint}</p>
                      </div>
                      <div className="surface-muted px-3.5 py-2.5">
                        <p className="label-text mb-1">内容价值</p>
                        <p className="text-[12px] leading-relaxed text-ink-muted">{topic.value}</p>
                      </div>
                      <div className="surface-muted px-3.5 py-2.5">
                        <p className="label-text mb-1">3 秒 Hook</p>
                        <p className="text-[12.5px] leading-relaxed text-ink">{topic.hook}</p>
                      </div>
                      <div className="surface-muted px-3.5 py-2.5">
                        <p className="label-text mb-1">内容创意</p>
                        <p className="text-[12px] leading-relaxed text-ink-muted">{topic.creative}</p>
                      </div>
                      <div className="surface-muted px-3.5 py-2.5">
                        <p className="label-text mb-1">评分依据</p>
                        <ul className="space-y-1">
                          {SCORE_KEYS.map((key) => (
                            <li key={key} className="text-[11px] leading-relaxed text-ink-muted">
                              <span className="font-medium text-ink">{SCORE_LABELS[key].zh}：</span>
                              {topic.scoreBasis[key] || "—"}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-[11px] leading-relaxed text-ink-soft">传播潜力 {topic.potentialStars} 星依据：{topic.potentialReason}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="moss"
                      size="sm"
                      loading={busyTopicId === topic.id}
                      loadingLabel="生成方案中…"
                      onClick={() => generateScript(topic.id)}
                    >
                      <Clapperboard className="h-3.5 w-3.5" />
                      生成视频方案
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => sendFeedback(topic.id, "like")}>
                      <ThumbsUp className="h-3.5 w-3.5" />
                      喜欢
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDislikeOpenId(dislikeOpenId === topic.id ? null : topic.id)}>
                      <ThumbsDown className="h-3.5 w-3.5" />
                      不喜欢
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => sendFeedback(topic.id, "save")}>
                      <Bookmark className="h-3.5 w-3.5" />
                      收藏
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => sendFeedback(topic.id, "regenerate")}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      换一个
                    </Button>
                  </div>

                  {dislikeOpenId === topic.id ? (
                    <div className="surface-muted px-3.5 py-3">
                      <p className="label-text mb-2">哪里不喜欢？AI 会按原因重新生成这一条</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {DISLIKE_REASONS.map((reason) => (
                          <Badge
                            key={reason}
                            tone="neutral"
                            className="cursor-pointer"
                            role="button"
                            onClick={() => sendFeedback(topic.id, "dislike", reason)}
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
        </div>
      ) : null}
    </div>
  );
}

function ScriptDetail({ state, onBack }: { state: IpScriptViewState; onBack: () => void }) {
  const { script, shot, topic } = state;
  const [hookVersion, setHookVersion] = React.useState("A");
  const [activeScript, setActiveScript] = React.useState<"s30" | "s60" | "s90">("s30");

  const selectedHook = script.hooks.find((item) => item.version === hookVersion) ?? script.hooks[0];
  const version = script.scripts[activeScript];
  const titleGroups = React.useMemo(() => {
    const groups = new Map<string, string[]>();
    script.titles.forEach((item) => {
      const list = groups.get(item.type) ?? [];
      list.push(item.title);
      groups.set(item.type, list);
    });
    return Array.from(groups.entries());
  }, [script.titles]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" />
          返回选题池
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{topic.topicType}</Badge>
          <Badge tone="moss">综合分 {topic.overallScore}</Badge>
          <CopyButton value={JSON.stringify({ script, shot }, null, 2)} label="复制完整方案 JSON" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{script.theme}</CardTitle>
            <CardDescription>{script.coreIdea}</CardDescription>
          </div>
          <Badge tone="moss">视频方案</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="surface-muted px-4 py-3">
            <p className="label-text mb-1">目标观众</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {script.targetAudience.map((item) => (
                <Badge key={item} tone="neutral">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[13px] font-semibold">3 秒 Hook（选一个版本）</p>
              <Badge tone="neutral">{script.hooks.length} 个版本</Badge>
            </div>
            <div className="grid gap-2.5 md:grid-cols-3">
              {script.hooks.map((hook) => (
                <button
                  key={hook.version}
                  type="button"
                  onClick={() => setHookVersion(hook.version)}
                  className={`surface-muted h-full px-3.5 py-3 text-left transition-colors ${hook.version === hookVersion ? "border-moss/50 bg-moss/8" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <Badge tone={hook.version === hookVersion ? "moss" : "neutral"}>版本 {hook.version}</Badge>
                    {hook.version === hookVersion ? <Badge tone="good">已选</Badge> : null}
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink">{hook.text}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">{hook.why}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>口播稿</CardTitle>
            <CardDescription>用真人说话的方式写，不用「首先 / 其次 / 最后」这类文章语言。</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(["s30", "s60", "s90"] as const).map((key) => (
              <Button key={key} variant={activeScript === key ? "moss" : "outline"} size="sm" onClick={() => setActiveScript(key)}>
                {script.scripts[key].duration} 秒
              </Button>
            ))}
            <CopyButton
              value={`${selectedHook?.text ?? version.hook}\n\n${version.lines.map((line) => `${line.section}：${line.text}`).join("\n")}\n\nCTA：${version.cta}`}
              label="复制口播稿"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="surface-muted px-4 py-3.5">
            {version.lines.map((line) => (
              <div key={`${line.section}-${line.text.slice(0, 8)}`} className="mb-2.5 last:mb-0">
                <Badge tone="neutral">{line.section}</Badge>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{line.text}</p>
              </div>
            ))}
            <Separator className="my-3" />
            <div>
              <Badge tone="moss">CTA</Badge>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">{version.cta}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>镜头脚本</CardTitle>
            <CardDescription>时间 / 画面 / 人物动作 / 口播 / 字幕。</CardDescription>
          </div>
          <CopyButton
            value={shot.shotList.map((row) => `${row.time} | ${row.scene} | ${row.action} | ${row.voiceover} | ${row.subtitle}`).join("\n")}
            label="复制镜头表"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>时间</TH>
                <TH>画面</TH>
                <TH>人物动作</TH>
                <TH>口播</TH>
                <TH>字幕</TH>
              </TR>
            </THead>
            <TBody>
              {shot.shotList.map((row) => (
                <TR key={row.time}>
                  <TD className="font-mono text-[11.5px]">{row.time}</TD>
                  <TD className="whitespace-normal">{row.scene}</TD>
                  <TD className="whitespace-normal">{row.action}</TD>
                  <TD className="whitespace-normal text-ink-muted">{row.voiceover}</TD>
                  <TD className="whitespace-normal text-ink-muted">{row.subtitle}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>今天拍什么（拍摄清单）</CardTitle>
              <CardDescription>拿着手机照着拍即可。</CardDescription>
            </div>
            <Badge tone="moss">{shot.mustShoot.length} 条必拍</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2">
              {shot.mustShoot.map((item, index) => (
                <li key={item} className="flex gap-2.5 text-[12px] leading-relaxed text-ink-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/12 font-mono text-[10px] text-moss-strong">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            {shot.optional.length > 0 ? (
              <div className="surface-muted px-3.5 py-2.5">
                <p className="label-text mb-1">可选镜头</p>
                <p className="text-[11.5px] leading-relaxed text-ink-muted">{shot.optional.join("；")}</p>
              </div>
            ) : null}
            <div className="grid gap-2.5 md:grid-cols-2">
              <div className="surface-muted px-3.5 py-2.5">
                <p className="label-text mb-1 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" /> 设备
                </p>
                <p className="text-[11.5px] leading-relaxed text-ink-muted">{shot.equipment.join("；")}</p>
              </div>
              <div className="surface-muted px-3.5 py-2.5">
                <p className="label-text mb-1">道具</p>
                <p className="text-[11.5px] leading-relaxed text-ink-muted">{shot.props.join("；")}</p>
              </div>
            </div>
            <div className="surface-muted px-3.5 py-2.5">
              <p className="label-text mb-1">拍摄提示</p>
              <ul className="space-y-1">
                {shot.tips.map((tip) => (
                  <li key={tip} className="text-[11.5px] leading-relaxed text-ink-muted">
                    · {tip}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>标题（{script.titles.length} 个）</CardTitle>
                <CardDescription>按信息型 / 冲突型 / 好奇型 / 避坑型 / 观点型分类。</CardDescription>
              </div>
              <CopyButton value={script.titles.map((item) => item.title).join("\n")} label="复制标题" />
            </CardHeader>
            <CardContent className="space-y-3">
              {titleGroups.map(([type, titles]) => (
                <div key={type}>
                  <Badge tone="neutral">{type}</Badge>
                  <ul className="mt-1.5 space-y-1">
                    {titles.map((title) => (
                      <li key={title} className="text-[12px] leading-relaxed text-ink-muted">
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>封面文案（{script.covers.length} 个）</CardTitle>
              </div>
              <CopyButton value={script.covers.join("\n")} label="复制封面" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {script.covers.map((cover) => (
                  <Badge key={cover} tone="clay">
                    {cover}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>评论区引导（{script.commentPrompts.length} 个）</CardTitle>
                <CardDescription>让评论继续产生下一批选题。</CardDescription>
              </div>
              <CopyButton value={script.commentPrompts.join("\n")} label="复制引导" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {script.commentPrompts.map((item) => (
                  <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-3.5 w-3.5 text-ink-soft" />
            <p className="text-[11px] leading-relaxed text-ink-soft">
              脚本与镜头方案由 Script Writer 与 Shot Planner 两个 Agent 分别生成；失败时自动回退到本地引擎。
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {SCORE_KEYS.map((key) => (
          <div key={key} className="surface-muted px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-medium">
                {SCORE_LABELS[key].zh}
                <span className="ml-2 font-serif text-[11px] italic text-ink-soft">{SCORE_LABELS[key].en}</span>
              </p>
              <span className="font-mono text-[12px]">{topic.scores[key]}</span>
            </div>
            <Progress value={topic.scores[key]} tone="moss" className="mt-2" />
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">{topic.scoreBasis[key] || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
