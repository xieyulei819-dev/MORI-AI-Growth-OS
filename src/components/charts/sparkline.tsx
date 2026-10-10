import { cn } from "@/lib/utils";

/**
 * Tiny dependency-free sparkline used inside KPI cards.
 */
export function Sparkline({
  values,
  className,
  tone = "moss",
}: {
  values: number[];
  className?: string;
  tone?: "moss" | "good" | "warn" | "bad" | "info";
}) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (clean.length < 2) return <div className={cn("h-6 w-full", className)} />;

  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const width = 100;
  const height = 28;
  const step = width / (clean.length - 1);

  const points = clean.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const stroke = {
    moss: "rgb(var(--moss))",
    good: "rgb(var(--tone-good))",
    warn: "rgb(var(--tone-warn))",
    bad: "rgb(var(--tone-bad))",
    info: "rgb(var(--tone-info))",
  }[tone];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-7 w-full", className)} preserveAspectRatio="none">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
