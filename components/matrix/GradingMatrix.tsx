"use client";
import type { GradingMatrix as M } from "@/lib/scoring/types";
import { gradeFromMatrix } from "@/lib/scoring/formulas";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = {
  A: "bg-grade-aBg",
  B: "bg-grade-bBg",
  C: "bg-grade-cBg",
  D: "bg-grade-dBg",
};

function midValue(bucket: number, t: [number, number, number]): number {
  if (bucket === 0) return t[0] / 2;
  if (bucket === 1) return (t[0] + t[1]) / 2;
  if (bucket === 2) return (t[1] + t[2]) / 2;
  return (t[2] + 100) / 2;
}

export function GradingMatrixView({
  matrix,
  leads,
  onChange,
}: {
  matrix: M;
  leads: { name: string; axisA: number; axisB: number }[];
  onChange: (next: M) => void;
}) {
  // Compute grades dynamically — row 0 = high Axis A, col 3 = high Axis B
  const cells = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) => {
      const a = midValue(3 - r, matrix.axisAThresholds);
      const b = midValue(c, matrix.axisBThresholds);
      return gradeFromMatrix(a, b, matrix);
    })
  );

  function updateA(idx: number, val: number) {
    const next: [number, number, number] = [...matrix.axisAThresholds];
    next[idx] = Math.max(1, Math.min(99, val));
    onChange({ ...matrix, axisAThresholds: sorted(next) });
  }
  function updateB(idx: number, val: number) {
    const next: [number, number, number] = [...matrix.axisBThresholds];
    next[idx] = Math.max(1, Math.min(99, val));
    onChange({ ...matrix, axisBThresholds: sorted(next) });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
        {/* Axis A labels (top = high) */}
        <div
          className="flex flex-col justify-between text-cap-md text-ink-3 font-medium py-4 text-right"
          style={{ height: 360 }}
        >
          <span>≥ {matrix.axisAThresholds[2]}</span>
          <span>
            {matrix.axisAThresholds[1]}–{matrix.axisAThresholds[2]}
          </span>
          <span>
            {matrix.axisAThresholds[0]}–{matrix.axisAThresholds[1]}
          </span>
          <span>&lt; {matrix.axisAThresholds[0]}</span>
        </div>

        <div className="flex-1">
          <div
            className="grid grid-cols-4 grid-rows-4 gap-1.5 rounded-lg overflow-hidden"
            style={{ height: 360 }}
          >
            {cells.map((row, r) =>
              row.map((g, c) => {
                // count leads in this cell
                const aLow =
                  r === 3 ? 0 : matrix.axisAThresholds[2 - r];
                const aHigh =
                  r === 0 ? Infinity : matrix.axisAThresholds[3 - r];
                const bLow =
                  c === 0 ? 0 : matrix.axisBThresholds[c - 1];
                const bHigh =
                  c === 3 ? Infinity : matrix.axisBThresholds[c];
                const inside = leads.filter(
                  (l) =>
                    l.axisA >= aLow &&
                    l.axisA < aHigh &&
                    l.axisB >= bLow &&
                    l.axisB < bHigh
                );
                return (
                  <div
                    key={`${r}-${c}`}
                    className={cn(
                      BG[g],
                      "relative flex items-center justify-center text-ink-2 font-bold text-2xl"
                    )}
                  >
                    {g}
                    {inside.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 text-cap bg-white/80 rounded px-1.5 font-semibold text-ink-2">
                        {inside.length}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Axis B labels (left = low) */}
          <div className="flex justify-between mt-1 text-cap-md text-ink-3 font-medium">
            <span>&lt; {matrix.axisBThresholds[0]}</span>
            <span>
              {matrix.axisBThresholds[0]}–{matrix.axisBThresholds[1]}
            </span>
            <span>
              {matrix.axisBThresholds[1]}–{matrix.axisBThresholds[2]}
            </span>
            <span>≥ {matrix.axisBThresholds[2]}</span>
          </div>
        </div>
      </div>

      {/* Axis labels */}
      <div className="flex items-center justify-between text-cap-md text-ink-3 italic px-1">
        <span>↑ Axis A (Ecosystem Value)</span>
        <span>Axis B (Viability) →</span>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-line">
        <ThresholdControls
          label="Ngưỡng Axis A (Ecosystem)"
          values={matrix.axisAThresholds}
          onChange={updateA}
        />
        <ThresholdControls
          label="Ngưỡng Axis B (Viability)"
          values={matrix.axisBThresholds}
          onChange={updateB}
        />
      </div>
    </div>
  );
}

function ThresholdControls({
  label,
  values,
  onChange,
}: {
  label: string;
  values: [number, number, number];
  onChange: (idx: number, v: number) => void;
}) {
  return (
    <div>
      <div className="text-cap-md font-semibold text-ink-2 mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {values.map((v, i) => (
          <div key={i}>
            <div className="text-cap text-ink-3 mb-1">
              {i === 0 ? "D → C" : i === 1 ? "C → B" : "B → A"}
            </div>
            <input
              type="number"
              value={v}
              onChange={(e) => onChange(i, Number(e.target.value))}
              className="input"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function sorted(t: [number, number, number]): [number, number, number] {
  const s = [...t].sort((a, b) => a - b);
  return [s[0], s[1], s[2]];
}
