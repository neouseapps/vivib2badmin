"use client";

export interface FunnelData {
  total: number;
  qualified: number;
  allocated: number;
}

const LEVELS = [
  { key: "total" as const,     label: "Tổng Raw Leads đã chấm điểm", sublabel: "Cấp 1 · Raw",       color: "#135b96" },
  { key: "qualified" as const, label: "Lead đủ điều kiện",            sublabel: "Cấp 2 · Qualified",  color: "#19674f" },
  { key: "allocated" as const, label: "Phân bổ hôm nay",             sublabel: "Cấp 3 · Allocated",  color: "#c8102e" },
];

const W = 280;
const LEVEL_H = 76;
const GAP = 6;
const MAX_HALF_W = 120;
const SVG_H = LEVELS.length * (LEVEL_H + GAP) - GAP;

export function FunnelChart({ data }: { data: FunnelData }) {
  const maxVal = Math.max(data.total, 1);
  const cx = W / 2;

  const halfWidths = LEVELS.map((lvl) => MAX_HALF_W * (data[lvl.key] / maxVal));

  return (
    <div className="card p-5">
      <h3 className="section-title mb-1">Phễu phân luồng</h3>
      <p className="text-cap-md text-ink-3 mb-4">Real-time · cập nhật theo cấu hình</p>

      <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" aria-label="Funnel chart">
        {LEVELS.map((lvl, i) => {
          const val = data[lvl.key];
          const topHalfW = halfWidths[i];
          const botHalfW = i < LEVELS.length - 1 ? halfWidths[i + 1] : topHalfW * 0.65;
          const y = i * (LEVEL_H + GAP);
          const points = [
            `${cx - topHalfW},${y}`,
            `${cx + topHalfW},${y}`,
            `${cx + botHalfW},${y + LEVEL_H}`,
            `${cx - botHalfW},${y + LEVEL_H}`,
          ].join(" ");
          const pct = data.total > 0 ? Math.round((val / data.total) * 100) : 0;

          return (
            <g key={lvl.key}>
              <polygon points={points} fill={lvl.color} opacity={0.12} />
              <polygon points={points} fill="none" stroke={lvl.color} strokeWidth={1.5} opacity={0.5} />
              <text
                x={cx} y={y + LEVEL_H / 2 - 8}
                textAnchor="middle"
                fontSize={22} fontWeight={700}
                fill={lvl.color}
              >
                {val}
              </text>
              <text
                x={cx} y={y + LEVEL_H / 2 + 12}
                textAnchor="middle"
                fontSize={11}
                fill="#808080"
              >
                {lvl.label} · {pct}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 space-y-2 border-t border-line pt-4">
        {LEVELS.map((lvl) => {
          const val = data[lvl.key];
          const pct = data.total > 0 ? Math.round((val / data.total) * 100) : 0;
          return (
            <div key={lvl.key} className="flex items-center gap-2 text-cap-md">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: lvl.color }}
              />
              <span className="text-ink-3">{lvl.sublabel}</span>
              <span className="text-ink-2 flex-1">{lvl.label}</span>
              <span className="font-semibold text-ink-1 tabular-nums">{val}</span>
              <span className="text-ink-4 w-10 text-right tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Drop indicators */}
      {data.total > 0 && (
        <div className="mt-3 space-y-1.5">
          {data.qualified < data.total && (
            <div className="flex items-center gap-1.5 text-cap-md text-warn-text bg-warn-light rounded-md px-3 py-1.5">
              <span className="font-semibold">{data.total - data.qualified}</span>
              <span>lead rớt về Marketing Nurture</span>
            </div>
          )}
          {data.allocated < data.qualified && (
            <div className="flex items-center gap-1.5 text-cap-md text-info bg-info-light rounded-md px-3 py-1.5">
              <span className="font-semibold">{data.qualified - data.allocated}</span>
              <span>lead đủ điều kiện đang chờ hạn mức</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
