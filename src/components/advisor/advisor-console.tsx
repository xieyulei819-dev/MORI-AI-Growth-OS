"use client";

import { Bot, Send, Sparkles, User } from "lucide-react";
import * as React from "react";

import { SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Progress, StatusBadge } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/field";
import type { GrowthAdvice } from "@/lib/ai/schemas";
import { notifyAiUsageChanged } from "@/lib/ai-usage-client";
import type { AgentRunMeta } from "@/types";

const SUGGESTIONS = [
  "最近 ROAS 为什么下降？",
  "哪些素材应该增加预算？",
  "18–24 岁女性为什么点击高但不买？",
  "小红书和抖音应该怎么分配预算？",
  "下周应该优先做什么？",
];

type Message = {
  id: string;
  question: string;
  answer?: GrowthAdvice;
  meta?: AgentRunMeta;
  error?: string;
  pending: boolean;
};

export function AdvisorConsole({ datasetId }: { datasetId?: string | null }) {
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [busy, setBusy] = React.useState(false);

  const ask = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) return;

      const id = `${Date.now()}`;
      setMessages((prev) => [{ id, question: trimmed, pending: true }, ...prev]);
      setQuestion("");
      setBusy(true);

      try {
        const response = await fetch("/api/advisor/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, datasetId: datasetId ?? null }),
        });
        const json = (await response.json()) as {
          ok: boolean;
          data?: GrowthAdvice;
          meta?: AgentRunMeta;
          error?: { code: string; message: string };
        };

        if (!response.ok || !json.ok || !json.data || !json.meta) {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === id
                ? { ...message, pending: false, error: json.error?.message ?? "AI 顾问暂时无法回答，请稍后重试。" }
                : message,
            ),
          );
          return;
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === id ? { ...message, pending: false, answer: json.data, meta: json.meta } : message,
          ),
        );
      } catch (error) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === id
              ? {
                  ...message,
                  pending: false,
                  error: error instanceof Error ? `网络或服务异常：${error.message}` : "网络或服务异常",
                }
              : message,
          ),
        );
      } finally {
        setBusy(false);
        notifyAiUsageChanged();
      }
    },
    [datasetId],
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>向 AI 增长顾问提问</CardTitle>
            <CardDescription>
              AI 已加载 MORI 的品牌、产品、人群、竞品、投放数据、内容库与实验历史，回答会引用具体指标。
            </CardDescription>
          </div>
          <Badge tone="moss">
            <Sparkles className="h-3 w-3" /> Growth Advisor
          </Badge>
        </CardHeader>
        <CardContent>
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                void ask(question);
              }
            }}
            placeholder="例如：最近 ROAS 为什么下降？哪些素材应该加预算？"
            className="min-h-[92px]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="moss" size="md" loading={busy} loadingLabel="Advisor is thinking…" onClick={() => ask(question)} disabled={question.trim().length < 2}>
              <Send className="h-3.5 w-3.5" /> 提交问题
            </Button>
            <span className="text-[11px] text-ink-soft">⌘ / Ctrl + Enter 快速提交</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <Badge
                key={suggestion}
                tone="neutral"
                className="cursor-pointer hover:border-moss/40 hover:text-ink"
                role="button"
                onClick={() => setQuestion(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {messages.length === 0 ? (
        <Alert tone="info" title="为什么这不是一个普通聊天窗口">
          顾问的每一次回答都必须按固定结构输出：Diagnosis（发生了什么）→ Main Reason（为什么）→ Hypothesis（假设，附证据与置信度）→
          Recommendation（怎么改）→ Experiment（如何验证）。所有数字来自数据库当前计算结果，并且数据库里没有的字段不会被编造。
        </Alert>
      ) : null}

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-canvas">
                <User className="h-3.5 w-3.5" />
              </span>
              <p className="text-[13.5px] font-medium">{message.question}</p>
            </div>

            <div className="ml-0.5 flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-moss/15 text-moss-strong">
                <Bot className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                {message.pending ? (
                  <div className="surface space-y-2 p-4">
                    <p className="text-[12px] text-ink-muted">正在读取投放数据、分人群指标与实验历史…</p>
                    <Progress value={60} tone="moss" />
                  </div>
                ) : null}

                {message.error ? <Alert tone="error" title="咨询失败">{message.error}</Alert> : null}

                {message.answer && message.meta ? <AdvisorAnswer advice={message.answer} meta={message.meta} /> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvisorAnswer({ advice, meta }: { advice: GrowthAdvice; meta: AgentRunMeta }) {
  return (
    <div className="space-y-3.5">
      <div className="surface animate-fade-up space-y-3.5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge mode={meta.mode} warning={meta.warning} />
          <Badge tone="neutral">{meta.model}</Badge>
          <Badge tone="neutral">Prompt {meta.promptVersion}</Badge>
          <span className="text-[11px] text-ink-soft">{meta.latencyMs}ms</span>
        </div>

        <Block label="Diagnosis" content={advice.diagnosis} />
        <Block label="Main Reason" content={advice.mainReason} />

        <div>
          <p className="label-text mb-2">Hypothesis</p>
          <div className="grid gap-2.5 md:grid-cols-3">
            {advice.hypotheses.map((item) => (
              <div key={item.hypothesis} className="surface-muted flex h-full flex-col gap-2 px-3.5 py-3">
                <p className="text-[12px] font-medium leading-snug">{item.hypothesis}</p>
                <Progress value={item.confidence} tone={item.confidence >= 75 ? "good" : "warn"} />
                <p className="text-[11px] leading-relaxed text-ink-muted">{item.evidence}</p>
                <p className="mt-auto text-[10.5px] text-ink-soft">置信度 {item.confidence}/100</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="label-text mb-2">Recommendation</p>
          <ol className="space-y-2">
            {advice.recommendation.map((item, index) => (
              <li key={item} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/12 font-mono text-[10px] text-moss-strong">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="surface-muted px-4 py-3.5">
          <p className="label-text mb-2">Experiment</p>
          <p className="text-[13px] font-semibold">{advice.experiment.name}</p>
          <div className="mt-2 grid gap-1.5 text-[11.5px] text-ink-muted md:grid-cols-2">
            <p>A：{advice.experiment.variantA}</p>
            <p>B：{advice.experiment.variantB}</p>
            <p>
              主指标：<span className="font-mono">{advice.experiment.metric}</span>
            </p>
            <p>成功标准：{advice.experiment.successCriteria}</p>
          </div>
          {meta.warning ? (
            <p className="mt-2 text-[11px] text-tone-warn">{meta.warning}</p>
          ) : null}
        </div>

        <div className="surface-muted px-4 py-3">
          <p className="label-text mb-2">数据依据</p>
          <ul className="space-y-1.5">
            {advice.dataUsed.map((item) => (
              <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SignalBlocks bundle={advice} columns={2} />
    </div>
  );
}

function Block({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="label-text mb-1">{label}</p>
      <p className="text-[13px] leading-relaxed text-ink-muted">{content}</p>
    </div>
  );
}
