"use client";
import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";

interface Props { data: { date: string; score: number }[]; width?: number; height?: number; stroke?: string; }

export function Sparkline({ data, width = 100, height = 28, stroke = "#19674f" }: Props) {
  const first = data[0]?.score ?? 0;
  const last = data.at(-1)?.score ?? 0;
  const trendColor = last >= first ? "#19674f" : "#c0392b";
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={stroke === "auto" ? trendColor : stroke}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
