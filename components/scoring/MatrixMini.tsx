import type { GradingMatrix } from "@/lib/scoring/types";
import { gradeFromMatrix } from "@/lib/scoring/formulas";
import { cn } from "@/lib/cn";

const GRADE_BG: Record<string, string> = {
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

export function MatrixMini({
  axisA,
  axisB,
  matrix,
  size = 128,
}: {
  axisA: number;
  axisB: number;
  matrix: GradingMatrix;
  size?: number;
}) {
  // row 0 = high Axis A (bucket 3), row 3 = low Axis A (bucket 0)
  // col 0 = low Axis B (bucket 0), col 3 = high Axis B (bucket 3)
  const cells = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) => {
      const a = midValue(3 - r, matrix.axisAThresholds);
      const b = midValue(c, matrix.axisBThresholds);
      return gradeFromMatrix(a, b, matrix);
    })
  );

  function bucket(v: number, t: [number, number, number]) {
    if (v >= t[2]) return 3;
    if (v >= t[1]) return 2;
    if (v >= t[0]) return 1;
    return 0;
  }

  const colB = bucket(axisB, matrix.axisBThresholds);
  const rowA = 3 - bucket(axisA, matrix.axisAThresholds);

  return (
    <div
      style={{ width: size, height: size }}
      className="grid grid-cols-4 grid-rows-4 gap-0.5 rounded-md overflow-hidden border border-line relative"
    >
      {cells.map((row, r) =>
        row.map((g, c) => (
          <div
            key={`${r}-${c}`}
            className={cn(
              GRADE_BG[g],
              "flex items-center justify-center text-[10px] font-bold text-ink-2/60"
            )}
          >
            {g}
          </div>
        ))
      )}
      {/* current position dot */}
      <div
        className="absolute w-3.5 h-3.5 rounded-full bg-brand border-2 border-white shadow-lv1 pointer-events-none"
        style={{
          left: `calc(${(colB + 0.5) * 25}% - 7px)`,
          top: `calc(${(rowA + 0.5) * 25}% - 7px)`,
        }}
      />
    </div>
  );
}
