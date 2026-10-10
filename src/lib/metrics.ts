import type { DerivedMetrics, MetricRow } from "@/types";

/**
 * All KPI math lives here so that both the app and the tests use a single
 * source of truth:
 *
 *   CTR  = clicks / impressions
 *   CPC  = spend / clicks
 *   CVR  = conversions / clicks
 *   CPA  = spend / conversions
 *   ROAS = revenue / spend
 *
 * Every division is guarded: when the denominator is missing, zero, negative
 * or not a finite number we return a safe fallback instead of NaN/Infinity.
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  const n = Number.isFinite(numerator) ? numerator : 0;
  const d = Number.isFinite(denominator) ? denominator : 0;
  if (d === 0) return fallback;
  const result = n / d;
  return Number.isFinite(result) ? result : fallback;
}

export const calcCtr = (clicks: number, impressions: number) => safeDivide(clicks, impressions);
export const calcCpc = (spend: number, clicks: number) => safeDivide(spend, clicks);
export const calcCvr = (conversions: number, clicks: number) => safeDivide(conversions, clicks);
export const calcCpa = (spend: number, conversions: number) => safeDivide(spend, conversions);
export const calcRoas = (revenue: number, spend: number) => safeDivide(revenue, spend);

export const EMPTY_METRICS: DerivedMetrics = {
  spend: 0,
  impressions: 0,
  clicks: 0,
  conversions: 0,
  revenue: 0,
  ctr: 0,
  cpc: 0,
  cvr: 0,
  cpa: 0,
  roas: 0,
};

export function sumRows(rows: MetricRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.spend += numeric(row.spend);
      acc.impressions += numeric(row.impressions);
      acc.clicks += numeric(row.clicks);
      acc.conversions += numeric(row.conversions);
      acc.revenue += numeric(row.revenue);
      return acc;
    },
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
  );
}

export function computeMetrics(rows: MetricRow[]): DerivedMetrics {
  const totals = sumRows(rows);
  return {
    ...totals,
    ctr: calcCtr(totals.clicks, totals.impressions),
    cpc: calcCpc(totals.spend, totals.clicks),
    cvr: calcCvr(totals.conversions, totals.clicks),
    cpa: calcCpa(totals.spend, totals.conversions),
    roas: calcRoas(totals.revenue, totals.spend),
  };
}

function numeric(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export type MetricKey = keyof Pick<DerivedMetrics, "spend" | "impressions" | "clicks" | "conversions" | "revenue" | "ctr" | "cpc" | "cvr" | "cpa" | "roas">;

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  labelEn: string;
  hint: string;
  format: "currency" | "currency2" | "number" | "compact" | "percent" | "ratio";
  /** true when a higher value is better */
  higherIsBetter: boolean;
};

export const KPI_DEFINITIONS: MetricDefinition[] = [
  {
    key: "spend",
    label: "广告花费",
    labelEn: "Ad Spend",
    hint: "所选周期内的媒体投放消耗",
    format: "currency",
    higherIsBetter: false,
  },
  {
    key: "impressions",
    label: "广告曝光",
    labelEn: "Impressions",
    hint: "素材被展示的次数",
    format: "compact",
    higherIsBetter: true,
  },
  {
    key: "clicks",
    label: "点击",
    labelEn: "Clicks",
    hint: "点击进入落地页 / 内容的次数",
    format: "number",
    higherIsBetter: true,
  },
  {
    key: "ctr",
    label: "CTR",
    labelEn: "Click-through Rate",
    hint: "点击 / 曝光，衡量素材吸引力",
    format: "percent",
    higherIsBetter: true,
  },
  {
    key: "cpc",
    label: "CPC",
    labelEn: "Cost per Click",
    hint: "花费 / 点击，衡量流量成本",
    format: "currency2",
    higherIsBetter: false,
  },
  {
    key: "conversions",
    label: "转化",
    labelEn: "Conversions",
    hint: "Demo 口径：下单转化数",
    format: "number",
    higherIsBetter: true,
  },
  {
    key: "cpa",
    label: "CPA",
    labelEn: "Cost per Acquisition",
    hint: "花费 / 转化，衡量获客成本",
    format: "currency2",
    higherIsBetter: false,
  },
  {
    key: "roas",
    label: "ROAS",
    labelEn: "Return on Ad Spend",
    hint: "收入 / 花费，衡量投放效率",
    format: "ratio",
    higherIsBetter: true,
  },
];

export function formatMetricValue(key: MetricKey, value: number) {
  const definition = KPI_DEFINITIONS.find((item) => item.key === key);
  const format = definition?.format ?? "number";
  switch (format) {
    case "currency":
      return `¥${Math.round(value).toLocaleString("zh-CN")}`;
    case "currency2":
      return `¥${value.toFixed(2)}`;
    case "percent":
      return `${(value * 100).toFixed(2)}%`;
    case "ratio":
      return value.toFixed(2);
    case "compact":
      if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
      return Math.round(value).toLocaleString("zh-CN");
    default:
      return Math.round(value).toLocaleString("zh-CN");
  }
}
