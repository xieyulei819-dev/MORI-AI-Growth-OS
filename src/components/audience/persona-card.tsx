import { Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import type { PersonaRecord } from "@/types";

export function PersonaCard({ persona }: { persona: PersonaRecord }) {
  return (
    <article className="surface flex h-full flex-col gap-3.5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold">{persona.name}</h3>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            {persona.ageBand} 岁 · {persona.occupation}
          </p>
        </div>
        <Badge tone="moss">{(persona.share * 100).toFixed(0)}% 人群占比</Badge>
      </div>

      <Progress value={persona.share * 100} tone="moss" />

      <div className="surface-muted flex gap-2 px-3.5 py-3">
        <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft" aria-hidden />
        <p className="text-[12px] italic leading-relaxed text-ink-muted">{persona.quote}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Block title="核心痛点" items={persona.painPoints} />
        <Block title="消费动机" items={persona.motivations} />
        <Block title="内容偏好" items={persona.contentPreferences} />
        <Block title="购买阻力" items={persona.barriers} tone="warn" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-ink-line pt-3">
        <span className="label-text">购买驱动</span>
        {persona.purchaseDrivers.map((driver) => (
          <Badge key={driver} tone="neutral">
            {driver}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="label-text">主要渠道</span>
        {persona.channels.map((channel) => (
          <Badge key={channel} tone="clay">
            {channel}
          </Badge>
        ))}
      </div>

      <p className="text-[11px] text-ink-soft">
        地域：{persona.city} · 数据来源：Persona 表（Demo / 模拟业务数据）
      </p>
    </article>
  );
}

function Block({ title, items, tone = "neutral" }: { title: string; items: string[]; tone?: "neutral" | "warn" }) {
  return (
    <div>
      <p className="label-text mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
            <span
              className={
                tone === "warn"
                  ? "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-tone-warn"
                  : "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss"
              }
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
