import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Sparkline } from "@/components/charts/sparkline";
import { Badge } from "@/components/ui/badge";
import { formatMetricValue, type MetricKey } from "@/lib/metrics";

export function KpiCard({
  metricKey,
  label,
  labelEn,
  value,
  delta,
  higherIsBetter,
  hint,
  sparkline,
}: {
  metricKey: MetricKey;
  label: string;
  labelEn: string;
  value: number;
  delta?: number;
  higherIsBetter: boolean;
  hint?: string;
  sparkline?: number[];
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const improving = hasDelta ? (higherIsBetter ? delta! > 0 : delta! < 0) : false;
  const neutral = hasDelta ? Math.abs(delta!) < 0.5 : true;
  const tone = !hasDelta || neutral ? "neutral" : improving ? "good" : "bad";
  const Icon = !hasDelta || neutral ? Minus : delta! > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="surface flex flex-col gap-3 p-4 transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-medium text-ink">{label}</p>
          <p className="font-serif text-[10.5px] italic text-ink-soft">{labelEn}</p>
        </div>
        {hasDelta && !neutral ? (
          <Badge tone={tone === "good" ? "good" : "bad"}>
            <Icon className="h-3 w-3" aria-hidden />
            {Math.abs(delta!).toFixed(1)}%
          </Badge>
        ) : (
          <Badge tone="neutral">—</Badge>
        )}
      </div>

      <p className="data-value text-[22px] font-semibold leading-none tracking-tight">
        {formatMetricValue(metricKey, value)}
      </p>

      {sparkline && sparkline.length > 1 ? (
        <Sparkline values={sparkline} tone={tone === "good" ? "good" : tone === "bad" ? "bad" : "moss"} />
      ) : null}

      {hint ? <p className="text-[11px] leading-relaxed text-ink-soft">{hint}</p> : null}
    </div>
  );
}
