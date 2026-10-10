"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_TOKENS, useTheme } from "@/components/theme-provider";
import { formatDateLabel } from "@/lib/utils";

export type TrendSeries = {
  key: string;
  label: string;
  kind: "line" | "area" | "bar";
  axis?: "left" | "right";
  colorKey?: "moss" | "clay" | "ink" | "info" | "warn" | "good" | "neutral";
  digits?: number;
  unit?: "currency" | "percent" | "ratio" | "number";
};

export type TrendChartProps = {
  data: Array<Record<string, string | number>>;
  series: TrendSeries[];
  height?: number;
  xKey?: string;
  rightAxisLabel?: string;
  leftAxisLabel?: string;
};

function formatValue(value: number, unit: TrendSeries["unit"], digits = 2) {
  if (!Number.isFinite(value)) return "—";
  switch (unit) {
    case "currency":
      return `¥${Math.round(value).toLocaleString("zh-CN")}`;
    case "percent":
      return `${value.toFixed(digits)}%`;
    case "ratio":
      return value.toFixed(digits);
    default:
      return value.toLocaleString("zh-CN", { maximumFractionDigits: digits });
  }
}

export function TrendChart({
  data,
  series,
  height = 240,
  xKey = "date",
  rightAxisLabel,
  leftAxisLabel,
}: TrendChartProps) {
  const { theme } = useTheme();
  const tokens = CHART_TOKENS[theme];

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke={tokens.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={(value: string) => formatDateLabel(value)}
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            tickMargin={8}
            minTickGap={22}
          />
          <YAxis
            yAxisId="left"
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(Math.round(value)))}
            width={46}
            label={
              leftAxisLabel
                ? { value: leftAxisLabel, angle: -90, position: "insideLeft", fill: tokens.axis, fontSize: 10 }
                : undefined
            }
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            width={44}
            label={
              rightAxisLabel
                ? { value: rightAxisLabel, angle: 90, position: "insideRight", fill: tokens.axis, fontSize: 10 }
                : undefined
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tokens.grid}`,
              background: theme === "dark" ? "#20241F" : "#FFFFFF",
              fontSize: 12,
              boxShadow: "0 12px 30px -18px rgba(30,35,32,0.4)",
            }}
            labelFormatter={(label) => formatDateLabel(String(label), true)}
            formatter={(value: number, name: string, item) => {
              const config = series.find((seriesItem) => seriesItem.label === name || seriesItem.key === name);
              return [formatValue(Number(value), config?.unit, config?.digits), config?.label ?? name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} iconType="circle" iconSize={7} />
          {series.map((item) => {
            const color = tokens[item.colorKey ?? "moss"];
            if (item.kind === "area") {
              return (
                <Area
                  key={item.key}
                  yAxisId={item.axis ?? "left"}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.14}
                  strokeWidth={2}
                  dot={false}
                />
              );
            }
            if (item.kind === "bar") {
              return (
                <Bar
                  key={item.key}
                  yAxisId={item.axis ?? "left"}
                  dataKey={item.key}
                  name={item.label}
                  fill={color}
                  fillOpacity={0.75}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                />
              );
            }
            return (
              <Line
                key={item.key}
                yAxisId={item.axis ?? "left"}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={color}
                strokeWidth={2}
                dot={false}
                strokeDasharray={item.key.includes("benchmark") ? "4 4" : undefined}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
