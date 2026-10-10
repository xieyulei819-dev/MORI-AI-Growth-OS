import * as React from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  titleEn,
  description,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  titleEn?: string;
  description?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-ink-line pb-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? <p className="label-text">{eyebrow}</p> : null}
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {titleEn ? <span className="font-serif text-sm italic text-ink-soft">{titleEn}</span> : null}
        </div>
        {description ? <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">{description}</p> : null}
        {meta ? <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Section({
  id,
  title,
  titleEn,
  description,
  actions,
  children,
  className,
}: {
  id?: string;
  title: string;
  titleEn?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {titleEn ? <span className="font-serif text-xs italic text-ink-soft">{titleEn}</span> : null}
          </div>
          {description ? <p className="mt-1 max-w-3xl text-xs leading-relaxed text-ink-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "chip chip-clay",
        className,
      )}
      title="本页面所有业务数据均为模拟数据，用于验证产品工作流"
    >
      Demo / 模拟业务数据
    </span>
  );
}
