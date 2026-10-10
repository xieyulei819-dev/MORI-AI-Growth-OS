import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import type { ContentRecord } from "@/types";

export function ContentLibrary({ items, limit = 9 }: { items: ContentRecord[]; limit?: number }) {
  const rows = items.slice(0, limit);
  return (
    <div className="surface overflow-hidden p-0">
      <ul className="divide-y divide-ink-line">
        {rows.map((item) => (
          <li key={item.id} className="flex flex-col gap-2.5 px-5 py-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium">{item.title}</p>
                <Badge tone="neutral">{item.platform}</Badge>
                <Badge tone="neutral">{item.contentType}</Badge>
                <Badge tone={item.status === "testing" ? "moss" : "neutral"}>{item.status}</Badge>
              </div>
              <p className="max-w-3xl text-[11.5px] leading-relaxed text-ink-muted">{item.hook}</p>
              <p className="text-[11px] text-ink-soft">
                人群：{item.audience} · 目标：{item.goal} · 主题：{item.topic} · 生成方式：{item.mode}
              </p>
            </div>
            <div className="w-full max-w-[200px] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink-soft">Overall</span>
                <span className="font-mono">{item.overallScore}</span>
              </div>
              <Progress value={item.overallScore} tone={item.overallScore >= 85 ? "good" : "moss"} />
              <div className="flex justify-between text-[10.5px] text-ink-soft">
                <span>Hook {item.hookScore}</span>
                <span>Rel {item.relevanceScore}</span>
                <span>Conv {item.conversionScore}</span>
                <span>Fit {item.brandFitScore}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
