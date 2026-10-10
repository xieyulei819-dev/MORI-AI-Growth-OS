import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-ink-line/40 via-ink-line/70 to-ink-line/40",
        className,
      )}
    />
  );
}

const ALERT_TONES = {
  info: { icon: Info, className: "border-tone-info/30 bg-tone-info/8 text-tone-info" },
  success: { icon: CheckCircle2, className: "border-tone-good/30 bg-tone-good/8 text-tone-good" },
  warning: { icon: AlertTriangle, className: "border-tone-warn/30 bg-tone-warn/10 text-tone-warn" },
  error: { icon: XCircle, className: "border-tone-bad/30 bg-tone-bad/8 text-tone-bad" },
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof ALERT_TONES;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const config = ALERT_TONES[tone];
  const Icon = config.icon;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12px]", config.className, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="leading-relaxed opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-line bg-surface-muted/60 px-6 py-10 text-center">
      {icon ? <div className="text-ink-soft">{icon}</div> : null}
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description ? <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Progress({
  value,
  tone = "moss",
  className,
}: {
  value: number;
  tone?: "moss" | "good" | "warn" | "bad" | "info";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClass = {
    moss: "bg-moss",
    good: "bg-tone-good",
    warn: "bg-tone-warn",
    bad: "bg-tone-bad",
    info: "bg-tone-info",
  }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ink-line/70", className)}>
      <div className={cn("h-full rounded-full transition-all", toneClass)} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function ScoreBar({ label, value, tone }: { label: string; value: number; tone?: "moss" | "good" | "warn" | "bad" | "info" }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
        <span className="text-ink-muted">{label}</span>
        <span className="font-mono text-ink">{value}</span>
      </div>
      <Progress value={value} tone={tone ?? (value >= 85 ? "good" : value >= 70 ? "moss" : "warn")} />
    </div>
  );
}

export function StatusBadge({ mode, warning }: { mode: string; warning?: string }) {
  if (mode === "ai") return <Badge tone="moss">AI 生成</Badge>;
  if (mode === "fallback") return <Badge tone="warn">AI 失败 · 已回退</Badge>;
  return <Badge tone="neutral" title={warning}>Demo 引擎</Badge>;
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-ink-line", className)} />;
}
