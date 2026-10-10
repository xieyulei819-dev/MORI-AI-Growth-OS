"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_TOKENS, useTheme } from "@/components/theme-provider";

export type BreakdownDatum = {
  name: string;
  value: number;
  secondary?: number;
  highlight?: boolean;
};

export function BreakdownChart({
  data,
  height = 220,
  digit = 2,
  unit = "ratio",
}: {
  data: BreakdownDatum[];
  height?: number;
  digit?: number;
  unit?: "ratio" | "percent" | "currency";
}) {
  const { theme } = useTheme();
  const tokens = CHART_TOKENS[theme];

  const format = (value: number) => {
    if (unit === "percent") return `${value.toFixed(digit)}%`;
    if (unit === "currency") return `¥${Math.round(value).toLocaleString("zh-CN")}`;
    return value.toFixed(digit);
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 12, bottom: 0, left: -22 }} layout="vertical">
          <CartesianGrid stroke={tokens.grid} strokeDasharray="3 6" horizontal={false} />
          <XAxis type="number" stroke={tokens.axis} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" stroke={tokens.axis} tick={{ fontSize: 11 }} width={92} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tokens.grid}`,
              background: theme === "dark" ? "#20241F" : "#FFFFFF",
              fontSize: 12,
            }}
            formatter={(value: number, _name, item) => {
              const datum = item?.payload as BreakdownDatum | undefined;
              const base = `${format(Number(value))}`;
              return [datum?.secondary !== undefined ? `${base}（${datum.secondary.toFixed(0)} 次点击）` : base, "ROAS"];
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.highlight ? tokens.moss : tokens.neutral} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value: number) => format(Number(value))}
              style={{ fontSize: 11, fill: tokens.ink }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
