"use client";
import { useMemo, useRef } from "react";
import { cn } from "@/lib/cn";

interface Props {
  values: number[];
  labels: string[];
  colors: string[];
  onChange: (next: number[]) => void;
}

export function BalanceSlider({ values, labels, colors, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const total = values.reduce((a, b) => a + b, 0) || 1;

  const positions = useMemo(() => {
    const pos: number[] = [];
    let acc = 0;
    for (let i = 0; i < values.length - 1; i++) {
      acc += values[i];
      pos.push((acc / total) * 100);
    }
    return pos;
  }, [values, total]);

  function onThumbDrag(thumbIdx: number, ev: React.MouseEvent) {
    ev.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const move = (e: MouseEvent) => {
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const pct = (x / rect.width) * 100;
      const minBound = thumbIdx === 0 ? 1 : positions[thumbIdx - 1] + 1;
      const maxBound =
        thumbIdx === positions.length - 1 ? 99 : positions[thumbIdx + 1] - 1;
      const clamped = Math.max(minBound, Math.min(maxBound, pct));
      const next = [...positions];
      next[thumbIdx] = clamped;
      onChange(positionsToValues(next, 100));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  return (
    <div className="select-none space-y-3">
      {/* Track */}
      <div
        ref={containerRef}
        className="relative h-12 rounded-xl overflow-hidden border border-line"
        style={{ boxShadow: "inset 0 1px 4px rgba(0,0,0,0.12)" }}
      >
        {/* bg fallback */}
        <div className="absolute inset-0 bg-bg-lv3" />

        {/* Segments */}
        {values.map((v, i) => {
          const left = i === 0 ? 0 : positions[i - 1];
          const right = i === values.length - 1 ? 100 : positions[i];
          const width = right - left;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                background: colors[i],
                transition: "left 0.12s ease, width 0.12s ease",
              }}
            >
              {/* subtle inner highlight */}
              <div className="absolute inset-x-0 top-0 h-[40%] bg-white/10 pointer-events-none" />
              {width >= 7 && (
                <span className="text-[11px] font-bold text-white tracking-wide drop-shadow-sm">
                  {Math.round(v)}%
                </span>
              )}
            </div>
          );
        })}

        {/* Thumbs */}
        {positions.map((p, i) => (
          <div
            key={i}
            onMouseDown={(e) => onThumbDrag(i, e)}
            className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
            style={{ left: `calc(${p}% - 12px)`, width: 24, zIndex: 10 }}
          >
            {/* visible pill */}
            <div
              className="h-8 rounded-full bg-white"
              style={{
                width: 3,
                boxShadow: "0 0 0 2px white, 0 0 0 3.5px rgba(0,0,0,0.18)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Legend — pill chips */}
      <div className="flex flex-wrap gap-2">
        {labels.map((l, i) => (
          <div
            key={i}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 bg-bg-lv1",
              values[i] < 5 ? "border-warn/50" : "border-line"
            )}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: colors[i] }}
            />
            <span className="text-cap-md text-ink-2 leading-none">{l}</span>
            <span
              className={cn(
                "font-mono font-semibold text-cap-md leading-none",
                values[i] < 5 ? "text-warn-text" : "text-ink-1"
              )}
            >
              {values[i]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function positionsToValues(positions: number[], total = 100): number[] {
  const vals: number[] = [];
  let prev = 0;
  for (let i = 0; i < positions.length; i++) {
    vals.push(Math.round(positions[i] - prev));
    prev = positions[i];
  }
  vals.push(Math.round(total - prev));
  const diff = total - vals.reduce((a, b) => a + b, 0);
  vals[vals.length - 1] += diff;
  return vals;
}
