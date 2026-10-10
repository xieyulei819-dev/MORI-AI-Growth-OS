import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { efficiencyQuadrant } from "@/lib/analytics";
import { formatCompactNumber, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { CreativeScorecard, DerivedMetrics } from "@/types";

const QUADRANT_TONE = {
  good: "good",
  info: "info",
  warn: "warn",
  bad: "bad",
} as const;

export function CreativeTable({
  items,
  benchmarks,
  limit,
  showIndex = true,
}: {
  items: CreativeScorecard[];
  benchmarks: DerivedMetrics;
  limit?: number;
  showIndex?: boolean;
}) {
  const rows = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <div className="surface overflow-hidden p-0">
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH className="pl-5">素材名称</TH>
            <TH>渠道</TH>
            <TH className="text-right">曝光</TH>
            <TH className="text-right">CTR</TH>
            {showIndex ? <TH className="text-right">CTR 指数</TH> : null}
            <TH className="text-right">CPC</TH>
            <TH className="text-right">转化</TH>
            <TH className="text-right">CPA</TH>
            <TH className="text-right">ROAS</TH>
            <TH className="text-right pr-5">诊断</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((item) => {
            const quadrant = efficiencyQuadrant(item, benchmarks);
            return (
              <TR key={item.name}>
                <TD className="pl-5">
                  <span className="block max-w-[220px] truncate font-medium">{item.name}</span>
                  <span className="text-[11px] text-ink-soft">{item.campaign}</span>
                </TD>
                <TD>
                  <Badge tone="neutral">{item.platform}</Badge>
                </TD>
                <TD className="text-right font-mono text-[12px] text-ink-muted">
                  {formatCompactNumber(item.impressions)}
                </TD>
                <TD className="text-right font-mono">
                  <span className={item.ctr >= benchmarks.ctr ? "text-tone-good" : "text-ink-muted"}>
                    {formatPercent(item.ctr)}
                  </span>
                </TD>
                {showIndex ? (
                  <TD className="w-[92px] text-right">
                    <span className="mb-1 block font-mono text-[11px] text-ink-muted">
                      {item.ctrIndex.toFixed(2)}×
                    </span>
                    <Progress
                      value={Math.min(200, item.ctrIndex * 100) / 2}
                      tone={item.ctrIndex >= 1 ? "good" : "warn"}
                    />
                  </TD>
                ) : null}
                <TD className="text-right font-mono text-[12px] text-ink-muted">{formatCurrency(item.cpc, { digits: 2 })}</TD>
                <TD className="text-right font-mono text-[12px]">{formatNumber(item.conversions)}</TD>
                <TD className="text-right font-mono text-[12px] text-ink-muted">{formatCurrency(item.cpa, { digits: 2 })}</TD>
                <TD className="text-right font-mono font-semibold">
                  <span className={item.roas >= benchmarks.roas ? "text-tone-good" : "text-tone-bad"}>
                    {item.roas.toFixed(2)}
                  </span>
                </TD>
                <TD className="pr-5 text-right">
                  <Badge tone={QUADRANT_TONE[quadrant.tone]}>{quadrant.label}</Badge>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
