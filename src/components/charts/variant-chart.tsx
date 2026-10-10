"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_TOKENS, useTheme } from "@/components/theme-provider";

export function VariantChart({
  data,
  height = 220,
}: {
  data: Array<{ metric: string; A: number; B: number }>;
  height?: number;
}) {
  const { theme } = useTheme();
  const tokens = CHART_TOKENS[theme];

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={tokens.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="metric" stroke={tokens.axis} tick={{ fontSize: 10 }} />
          <YAxis stroke={tokens.axis} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tokens.grid}`,
              background: theme === "dark" ? "#20241F" : "#FFFFFF",
              fontSize: 12,
            }}
            formatter={(value: number) => Number(value).toFixed(2)}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={7} />
          <Bar dataKey="A" name="Variant A" fill={tokens.mossSoft} radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="B" name="Variant B" fill={tokens.moss} radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
