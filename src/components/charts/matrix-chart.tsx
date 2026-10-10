"use client";

import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import { CHART_TOKENS, useTheme } from "@/components/theme-provider";

export type MatrixPoint = {
  name: string;
  price: number;
  professional: number;
  isSelf: boolean;
  note?: string;
};

export function MatrixChart({ data, height = 300 }: { data: MatrixPoint[]; height?: number }) {
  const { theme } = useTheme();
  const tokens = CHART_TOKENS[theme];
  const avgPrice = data.reduce((acc, item) => acc + item.price, 0) / Math.max(data.length, 1);
  const avgProfessional = data.reduce((acc, item) => acc + item.professional, 0) / Math.max(data.length, 1);

  const self = data.filter((item) => item.isSelf);
  const others = data.filter((item) => !item.isSelf);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 24, bottom: 12, left: -12 }}>
          <CartesianGrid stroke={tokens.grid} strokeDasharray="3 6" />
          <XAxis
            type="number"
            dataKey="price"
            name="价格"
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            domain={[0, "dataMax + 60"]}
            label={{ value: "价格 ¥ →", position: "insideBottomRight", fill: tokens.axis, fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="professional"
            name="品牌专业度"
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            domain={[30, 100]}
            label={{ value: "品牌专业度 →", angle: -90, position: "insideLeft", fill: tokens.axis, fontSize: 10 }}
          />
          <ZAxis type="number" dataKey="professional" range={[120, 320]} />
          <ReferenceLine x={avgPrice} stroke={tokens.grid} strokeDasharray="4 4" />
          <ReferenceLine y={avgProfessional} stroke={tokens.grid} strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tokens.grid}`,
              background: theme === "dark" ? "#20241F" : "#FFFFFF",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [name === "价格" ? `¥${value}` : value, name]}
            labelFormatter={() => ""}
            content={({ payload }) => {
              const point = payload?.[0]?.payload as MatrixPoint | undefined;
              if (!point) return null;
              return (
                <div className="rounded-xl border border-ink-line bg-surface px-3 py-2 text-[12px] shadow-lift">
                  <p className="font-semibold">{point.name}</p>
                  <p className="text-ink-muted">价格 ¥{point.price}</p>
                  <p className="text-ink-muted">专业度 {point.professional}/100</p>
                  {point.note ? <p className="mt-1 max-w-[220px] text-ink-soft">{point.note}</p> : null}
                </div>
              );
            }}
          />
          <Scatter name="竞品" data={others} fill={tokens.neutral} />
          <Scatter name="MORI" data={self} fill={tokens.moss} shape="star" />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-moss" /> MORI 森屿
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-soft" /> 虚拟竞品
        </span>
        <span>虚线 = 品类价格 / 专业度均值</span>
      </div>
    </div>
  );
}
