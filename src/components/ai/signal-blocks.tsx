import { Compass, Lightbulb, ShieldAlert, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import type { Signal, SignalBundle } from "@/types";

const GROUPS = [
  {
    key: "insights" as const,
    title: "AI 洞察",
    titleEn: "Insight",
    icon: Lightbulb,
    tone: "moss" as const,
    bar: "moss" as const,
  },
  {
    key: "opportunities" as const,
    title: "增长机会",
    titleEn: "Opportunity",
    icon: TrendingUp,
    tone: "good" as const,
    bar: "good" as const,
  },
  {
    key: "risks" as const,
    title: "风险提示",
    titleEn: "Risk",
    icon: ShieldAlert,
    tone: "warn" as const,
    bar: "warn" as const,
  },
  {
    key: "recommendations" as const,
    title: "行动建议",
    titleEn: "Recommendation",
    icon: Compass,
    tone: "info" as const,
    bar: "info" as const,
  },
];

export function SignalCard({ signal, tone = "moss" }: { signal: Signal; tone?: "moss" | "good" | "warn" | "info" }) {
  return (
    <article className="surface flex h-full flex-col gap-2.5 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[13.5px] font-semibold leading-snug">{signal.title}</h3>
        <Badge tone={tone}>{signal.confidence}</Badge>
      </div>
      <p className="flex-1 text-[12.5px] leading-relaxed text-ink-muted">{signal.body}</p>
      <div className="space-y-2 border-t border-ink-line pt-2.5">
        <Progress value={signal.confidence} tone={tone} />
        <p className="text-[11px] leading-relaxed text-ink-soft">
          <span className="font-medium text-ink-muted">依据：</span>
          {signal.evidence}
        </p>
      </div>
    </article>
  );
}

export function SignalBlocks({
  bundle,
  columns = 2,
  className,
  emptyHint,
}: {
  bundle: SignalBundle;
  columns?: 1 | 2 | 4;
  className?: string;
  emptyHint?: string;
}) {
  const total = GROUPS.reduce((acc, group) => acc + bundle[group.key].length, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-line bg-surface-muted/50 px-4 py-6 text-[12px] text-ink-muted">
        {emptyHint ?? "暂无结构化结论。"}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", columns === 1 ? "grid-cols-1" : columns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2", className)}>
      {GROUPS.map((group) => {
        const signals = bundle[group.key];
        if (signals.length === 0) return null;
        const Icon = group.icon;
        return (
          <div key={group.key} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-ink-soft" aria-hidden />
              <p className="text-[12px] font-medium text-ink">{group.title}</p>
              <span className="font-serif text-[11px] italic text-ink-soft">{group.titleEn}</span>
              <Badge tone={group.tone}>{signals.length}</Badge>
            </div>
            <div className="space-y-2.5">
              {signals.map((signal) => (
                <SignalCard key={signal.title} signal={signal} tone={group.bar} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BulletList({
  title,
  items,
  tone = "moss",
}: {
  title: string;
  items: string[];
  tone?: "moss" | "good" | "warn" | "info";
}) {
  return (
    <div className="surface p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <p className="text-[13px] font-semibold">{title}</p>
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/12 font-mono text-[10px] text-moss-strong">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function MetaList({ items, title = "数据依据" }: { items: string[]; title?: string }) {
  return (
    <div className="surface-muted px-4 py-3">
      <p className="label-text mb-2">{title}</p>
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
