"use client";

import * as React from "react";

import { AgentRunner } from "@/components/ai/agent-runner";
import { SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert, ScoreBar, Separator } from "@/components/ui/feedback";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import type { ContentStrategy } from "@/lib/ai/schemas";
import type { AgentRunMeta } from "@/types";

const PLATFORMS = ["小红书", "抖音", "公众号"];
const CONTENT_TYPES = ["种草", "测评", "知识", "故事", "场景", "产品介绍"];
const GOALS = ["曝光", "互动", "点击", "转化"];
const TOPIC_PRESETS = ["熬夜修护", "清爽肤感", "学生党预算", "30 天稳定", "通勤快手护肤"];

export function ContentStudio({
  datasetId,
  personaNames,
}: {
  datasetId?: string | null;
  personaNames: string[];
}) {
  const [platform, setPlatform] = React.useState(PLATFORMS[0]);
  const [contentType, setContentType] = React.useState(CONTENT_TYPES[0]);
  const [goal, setGoal] = React.useState(GOALS[3]);
  const [topic, setTopic] = React.useState(TOPIC_PRESETS[0]);
  const [audience, setAudience] = React.useState(personaNames[0] ?? "23 岁熬夜女性");

  const payload = React.useMemo(
    () => ({ datasetId: datasetId ?? null, platform, contentType, goal, topic, audience }),
    [datasetId, platform, contentType, goal, topic, audience],
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>内容简报</CardTitle>
            <CardDescription>选择平台、内容类型、目标与主题，AI 会按平台规范生成方案。</CardDescription>
          </div>
          <Badge tone="moss">Content Strategist</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-5">
            <FieldGroup label="平台">
              <Select value={platform} onChange={(event) => setPlatform(event.target.value)}>
                {PLATFORMS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="内容类型">
              <Select value={contentType} onChange={(event) => setContentType(event.target.value)}>
                {CONTENT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="投放目标">
              <Select value={goal} onChange={(event) => setGoal(event.target.value)}>
                {GOALS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="主题" hint="可自定义，例如「成分讲人话」">
              <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="熬夜修护" />
            </FieldGroup>
            <FieldGroup label="目标人群">
              <Select value={audience} onChange={(event) => setAudience(event.target.value)}>
                {personaNames.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="23 岁熬夜女性">23 岁熬夜女性</option>
              </Select>
            </FieldGroup>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="label-text">快捷主题</span>
            {TOPIC_PRESETS.map((preset) => (
              <Badge
                key={preset}
                tone={preset === topic ? "moss" : "neutral"}
                className="cursor-pointer"
                role="button"
                onClick={() => setTopic(preset)}
              >
                {preset}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <AgentRunner<ContentStrategy>
        endpoint="/api/content/generate"
        payload={payload}
        disabled={topic.trim().length === 0}
        disabledHint="请先填写主题"
        labels={{
          idle: "生成内容方案",
          loading: "Generating content...",
          success: "Content generated",
          error: "Unable to generate content.",
        }}
        render={(data, meta) => <ContentResult data={data} meta={meta} payload={payload} />}
      />
    </div>
  );
}

function ContentResult({
  data,
  meta,
  payload,
}: {
  data: ContentStrategy;
  meta: AgentRunMeta;
  payload: Record<string, unknown>;
}) {
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = React.useState<string>("");

  const save = React.useCallback(async () => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: payload.platform,
          contentType: payload.contentType,
          goal: payload.goal,
          topic: payload.topic,
          audience: payload.audience,
          title: data.xiaohongshu.titles[0]?.title ?? "未命名内容",
          hook: data.douyin.hook,
          body: data.xiaohongshu.body,
          cta: data.douyin.script[data.douyin.script.length - 1]?.content ?? "—",
          hookScore: data.scores.hookScore,
          relevanceScore: data.scores.relevanceScore,
          conversionScore: data.scores.conversionScore,
          brandFitScore: data.scores.brandFitScore,
          overallScore: data.scores.overallScore,
          whyTest: data.scores.whyTest,
          howToImprove: data.scores.howToImprove,
          mode: meta.mode,
        }),
      });
      const json = (await response.json()) as { ok: boolean; error?: { message: string } };
      if (!response.ok || !json.ok) throw new Error(json.error?.message ?? "保存失败");
      setSaveState("saved");
      setSaveMessage("已保存到内容库（刷新页面即可在下方列表看到）。");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : "保存失败");
    }
  }, [data, meta.mode, payload]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>方案摘要</CardTitle>
            <CardDescription>{data.summary}</CardDescription>
          </div>
          <Badge tone="moss">Overall {data.scores.overallScore}</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <ScoreBar label="Hook Score" value={data.scores.hookScore} />
              <ScoreBar label="Relevance" value={data.scores.relevanceScore} />
              <ScoreBar label="Conversion Potential" value={data.scores.conversionScore} />
              <ScoreBar label="Brand Fit" value={data.scores.brandFitScore} />
              <Separator />
              <ScoreBar label="Overall" value={data.scores.overallScore} tone="moss" />
            </div>
            <div className="space-y-3">
              <div className="surface-muted px-4 py-3">
                <p className="label-text mb-1">为什么值得测试</p>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">{data.scores.whyTest}</p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="label-text mb-1">怎么进一步优化</p>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">{data.scores.howToImprove}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="label-text">关键词</span>
                {data.keywords.map((keyword) => (
                  <Badge key={keyword} tone="neutral">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button variant="moss" size="sm" loading={saveState === "saving"} onClick={save}>
                  {saveState === "saved" ? "已保存到内容库" : "保存到内容库"}
                </Button>
                <CopyButton value={JSON.stringify(data, null, 2)} label="复制结构化 JSON" />
              </div>
              {saveState === "saved" ? <Alert tone="success">{saveMessage}</Alert> : null}
              {saveState === "error" ? <Alert tone="error">{saveMessage}</Alert> : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>小红书标题（5 个）</CardTitle>
              <CardDescription>每个标题都给出角度与「为什么有效」，方便直接排期测试。</CardDescription>
            </div>
            <CopyButton value={data.xiaohongshu.titles.map((item) => item.title).join("\n")} label="复制标题" />
          </CardHeader>
          <CardContent className="space-y-3">
            {data.xiaohongshu.titles.map((item, index) => (
              <div key={item.title} className="surface-muted px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-medium leading-snug">{item.title}</p>
                  <Badge tone="neutral">#{index + 1}</Badge>
                </div>
                <p className="mt-1.5 text-[11.5px] text-moss-strong">角度：{item.angle}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{item.whyItWorks}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>小红书正文</CardTitle>
              <CardDescription>真实用户口吻，不含医疗与绝对化表述。</CardDescription>
            </div>
            <CopyButton value={data.xiaohongshu.body} label="复制正文" />
          </CardHeader>
          <CardContent>
            <div className="surface-muted max-h-[420px] overflow-y-auto px-4 py-3.5">
              {data.xiaohongshu.body.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mb-2.5 text-[12.5px] leading-relaxed text-ink-muted last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>抖音 15 秒脚本</CardTitle>
            <CardDescription>严格按 Hook → 痛点 → 解决方案 → CTA 的时间轴结构。</CardDescription>
          </div>
          <CopyButton
            value={data.douyin.script.map((item) => `${item.timeRange} ${item.section}：${item.content}`).join("\n")}
            label="复制脚本"
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {data.douyin.script.map((item) => (
              <div key={item.timeRange} className="surface-muted flex h-full flex-col gap-2 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <Badge tone="moss">{item.timeRange}</Badge>
                  <span className="text-[11px] font-medium text-ink-muted">{item.section}</span>
                </div>
                <p className="text-[12px] leading-relaxed text-ink-muted">{item.content}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-ink-soft">视频文案：{data.douyin.caption}</p>
        </CardContent>
      </Card>

      <SignalBlocks bundle={data} columns={2} />
    </div>
  );
}
