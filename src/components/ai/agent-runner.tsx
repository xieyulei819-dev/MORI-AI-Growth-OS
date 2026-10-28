"use client";

import { AlertCircle, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import * as React from "react";

import { Alert, StatusBadge } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notifyAiUsageChanged } from "@/lib/ai-usage-client";
import { cn } from "@/lib/utils";
import type { AgentRunMeta } from "@/types";

export type RunState = "idle" | "loading" | "success" | "error" | "disabled";

export type AgentResponse<T> = {
  ok: boolean;
  data: T;
  meta: AgentRunMeta;
  error?: { code: string; message: string };
};

export type AgentRunnerProps<T> = {
  endpoint: string;
  payload: Record<string, unknown>;
  labels?: {
    idle?: string;
    loading?: string;
    success?: string;
    error?: string;
    retry?: string;
  };
  disabled?: boolean;
  disabledHint?: string;
  variant?: "primary" | "moss" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  render: (data: T, meta: AgentRunMeta) => React.ReactNode;
  onSuccess?: (data: T, meta: AgentRunMeta) => void;
  autoRun?: boolean;
  /** extra buttons rendered next to the trigger (e.g. "保存到内容库") */
  renderFooter?: (data: T, meta: AgentRunMeta) => React.ReactNode;
};

export function AgentRunner<T>({
  endpoint,
  payload,
  labels,
  disabled = false,
  disabledHint,
  variant = "moss",
  size = "md",
  className,
  render,
  onSuccess,
  autoRun = false,
  renderFooter,
}: AgentRunnerProps<T>) {
  const [state, setState] = React.useState<RunState>(disabled ? "disabled" : "idle");
  const [data, setData] = React.useState<T | null>(null);
  const [meta, setMeta] = React.useState<AgentRunMeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const payloadKey = React.useMemo(() => JSON.stringify(payload), [payload]);

  const run = React.useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadKey,
      });

      const json = (await response.json()) as AgentResponse<T>;

      if (!response.ok || !json.ok) {
        setState("error");
        setError(json.error?.message ?? `请求失败（HTTP ${response.status}）`);
        return;
      }

      setData(json.data);
      setMeta(json.meta);
      setState("success");
      onSuccess?.(json.data, json.meta);
    } catch (caught) {
      setState("error");
      setError(
        caught instanceof Error
          ? `网络或服务异常：${caught.message}`
          : "网络或服务异常，请稍后重试。",
      );
    } finally {
      notifyAiUsageChanged();
    }
  }, [endpoint, payloadKey, onSuccess]);

  React.useEffect(() => {
    if (disabled) setState("disabled");
    else setState((prev) => (prev === "disabled" ? (autoRun ? "loading" : "idle") : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={variant} size={size} loading={state === "loading"} loadingLabel={labels?.loading ?? "Analyzing…"} onClick={run} disabled={disabled}>
          {state === "success" || state === "error" ? (
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          )}
          {state === "success" || state === "error"
            ? (labels?.retry ?? "重新生成")
            : (labels?.idle ?? "生成 AI 分析")}
        </Button>

        {state === "loading" ? (
          <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-moss" />
            {labels?.loading ?? "Analyzing…"}
          </span>
        ) : null}

        {state === "success" && meta ? (
          <>
            <span className="flex items-center gap-1.5 text-[12px] text-tone-good">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {labels?.success ?? "Analysis completed"}
            </span>
            <StatusBadge mode={meta.mode} />
            <Badge tone="neutral" title={`Prompt ${meta.promptVersion}`}>
              {meta.promptVersion}
            </Badge>
            <span className="text-[11px] text-ink-soft">
              {meta.model} · {meta.latencyMs}ms
            </span>
          </>
        ) : null}

        {state === "disabled" && disabledHint ? (
          <span className="text-[12px] text-ink-soft">{disabledHint}</span>
        ) : null}
      </div>

      {state === "error" ? (
        <Alert tone="error" title={labels?.error ?? "Unable to generate insights."}>
          {error}
        </Alert>
      ) : null}

      {meta?.warning && state === "success" ? (
        <Alert tone="warning" title="AI 调用提示">
          {meta.warning}
        </Alert>
      ) : null}

      {state === "success" && data && meta ? (
        <div className="space-y-4 animate-fade-up">
          {render(data, meta)}
          {renderFooter ? <div className="flex flex-wrap items-center gap-2">{renderFooter(data, meta)}</div> : null}
        </div>
      ) : null}

      {state === "idle" ? (
        <div className="flex items-start gap-2 rounded-xl border border-dashed border-ink-line bg-surface-muted/50 px-4 py-6 text-[12px] text-ink-muted">
          <AlertCircle className="mt-0.5 h-4 w-4 text-ink-soft" aria-hidden />
          <p>
            点击上方按钮开始分析。结果由结构化输出（JSON Schema）驱动，页面负责渲染，不会出现大段不可控文本。
          </p>
        </div>
      ) : null}
    </div>
  );
}
