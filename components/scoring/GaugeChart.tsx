"use client";
import { cn } from "@/lib/cn";

interface Props {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
  locked?: boolean;
}

export function GaugeChart({ value, max = 100, label, sublabel, color = "#135b96", size = 140, locked }: Props) {
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const sweep = 220; // degrees
  const startAngle = 180 + (360 - sweep) / 2;
  const endAngle = startAngle + sweep;
  const clamped = Math.max(0, Math.min(max, value));
  const pct = clamped / max;
  const valAngle = startAngle + sweep * pct;

  const trackPath = arcPath(cx, cy, r, startAngle, endAngle);
  const valuePath = arcPath(cx, cy, r, startAngle, valAngle);

  return (
    <div className={cn("relative flex flex-col items-center", locked && "opacity-50")}>
      <svg width={size} height={size * 0.78} viewBox={`0 0 ${size} ${size * 0.78}`}>
        <path d={trackPath} stroke="#ebebeb" strokeWidth={10} fill="none" strokeLinecap="round"/>
        <path d={valuePath} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round"
          className="transition-all duration-500 ease-out"/>
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-ink-1" style={{ fontSize: 28, fontWeight: 700 }}>
          {Math.round(value)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-ink-3" style={{ fontSize: 11 }}>
          / {max}
        </text>
      </svg>
      <div className="text-center -mt-2">
        <div className="text-cap-md font-semibold text-ink-1">{label}</div>
        {sublabel && <div className="text-cap text-ink-3">{sublabel}</div>}
      </div>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const [sx, sy] = polar(cx, cy, r, startDeg);
  const [ex, ey] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
}
