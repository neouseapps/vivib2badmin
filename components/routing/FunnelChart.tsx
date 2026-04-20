"use client";

// ── Public types ─────────────────────────────────────────────
export interface RepEntry {
  name: string;
  count: number;
}

export interface FunnelData {
  total: number;
  qualified: number;
  allocated: number;   // Pending_Audit
  overflow: number;    // Qualified_For_Audit — qualified but over quota
  reps: RepEntry[];    // per-rep breakdown of allocated leads
}

// ── Palette (rep nodes, left-to-right in dest order) ─────────
const REP_COLORS = [
  "#135b96", "#7d3c98", "#d65800",
  "#0986ec", "#c0392b", "#c8a53a", "#19674f",
] as const;

const NODE_COLOR = {
  raw:       "#135b96",
  qualified: "#19674f",
  nurture:   "#d97706",
  overflow:  "#0986ec",
} as const;

// ── SVG layout ───────────────────────────────────────────────
// VW=1000: wide viewBox so `w-full` scales content to fill the container
// width while height adjusts proportionally (no fixed-height constraint).
const VW          = 1000;
const NW          = 8;     // node bar width
const PAD_Y       = 30;
const REP_GAP     = 6;     // gap between stacked rep nodes
const MIN_NODE_H  = 22;    // minimum rep node height

// Column left-edge x  (label zones: 0→C0-10 left, C2+NW+10→VW right)
const C0 = 128;  // Raw
const C1 = 420;  // Qualified / Nurture
const C2 = 760;  // Rep nodes  (240px label zone to the right)

// ── Bezier band ──────────────────────────────────────────────
function Band({
  x0, y0t, y0b,
  x1, y1t, y1b,
  color, opacity = 0.18,
}: {
  x0: number; y0t: number; y0b: number;
  x1: number; y1t: number; y1b: number;
  color: string; opacity?: number;
}) {
  const mx = (x0 + x1) / 2;
  return (
    <path
      d={[
        `M${x0},${y0t}`,
        `C${mx},${y0t} ${mx},${y1t} ${x1},${y1t}`,
        `L${x1},${y1b}`,
        `C${mx},${y1b} ${mx},${y0b} ${x0},${y0b}`,
        "Z",
      ].join(" ")}
      fill={color}
      fillOpacity={opacity}
    />
  );
}

// ── Node label: value (bold) + name (muted) at top of node ───
function NodeLabel({
  x, y, value, name, color,
  align = "end",
}: {
  x: number; y: number;
  value: number | string; name: string;
  color: string; align?: "start" | "end";
}) {
  return (
    <g>
      <text x={x} y={y + 1} textAnchor={align}
        fontSize={15} fontWeight="800" fill={color} fontFamily="monospace">
        {value}
      </text>
      <text x={x} y={y + 16} textAnchor={align}
        fontSize={10} fontWeight="600" fill={color} fillOpacity={0.6}>
        {name}
      </text>
    </g>
  );
}

// ── Main component ───────────────────────────────────────────
export function FunnelChart({ data }: { data: FunnelData }) {
  const { total, qualified, allocated, overflow, reps } = data;

  const tot        = Math.max(total, 1);
  const nurtureCnt = total - qualified;

  // Build right-column items: reps + optional overflow node
  type RightItem = { key: string; label: string; count: number; color: string };
  const rightItems: RightItem[] = [
    ...reps.map((r, i) => ({
      key:   r.name,
      label: r.name,
      count: r.count,
      color: REP_COLORS[i % REP_COLORS.length],
    })),
    ...(overflow > 0
      ? [{ key: "_ov", label: "Chờ hạn mức", count: overflow, color: NODE_COLOR.overflow }]
      : []),
  ];

  // ── Dynamic SVG height ────────────────────────────────────
  const rightTotalH =
    rightItems.length > 0
      ? rightItems.length * MIN_NODE_H + (rightItems.length - 1) * REP_GAP
      : 0;
  const IH = Math.max(160, rightTotalH + 24);
  const VH = IH + PAD_Y * 2;

  // ── Col 1: heights ────────────────────────────────────────
  const qualH = IH * (qualified / tot);
  const nurH  = IH - qualH;

  // ── Col 2: DESTINATION node positions (sorted by count desc) ─
  // Different sort order from source creates the crossing effect
  const qualVal = Math.max(qualified, 1);
  const gapTotal = REP_GAP * Math.max(rightItems.length - 1, 0);
  const usableH  = qualH - gapTotal;

  const destOrder = [...rightItems].sort((a, b) => b.count - a.count);
  type RightNodePos = RightItem & { y: number; h: number };
  const destNodes: RightNodePos[] = [];
  let dy = PAD_Y;
  destOrder.forEach((item, i) => {
    const h = Math.max((item.count / qualVal) * usableH, MIN_NODE_H * 0.5);
    destNodes.push({ ...item, y: dy, h });
    dy += h + (i < destOrder.length - 1 ? REP_GAP : 0);
  });

  // ── SOURCE segments on Qualified right edge (sorted ALPHA) ──
  // Alpha ≠ count-desc → bands naturally cross ✓
  const sourceOrder = [...rightItems].sort((a, b) => a.label.localeCompare(b.label));
  type SourceSeg = { key: string; y: number; h: number };
  const sourceSegs: SourceSeg[] = [];
  let sy = PAD_Y;
  sourceOrder.forEach(item => {
    const h = Math.max((item.count / qualVal) * usableH, MIN_NODE_H * 0.5);
    sourceSegs.push({ key: item.key, y: sy, h });
    sy += h;
  });

  // Truncate long names for right labels
  const truncate = (s: string, max = 12) =>
    s.length > max ? s.slice(0, max - 1) + "…" : s;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ display: "block" }}
        aria-label="Sankey: phễu lọc lead"
      >
        {/* ════════ BANDS ════════ */}

        {/* Raw → Qualified */}
        {qualified > 0 && (
          <Band
            x0={C0 + NW} y0t={PAD_Y}          y0b={PAD_Y + qualH}
            x1={C1}      y1t={PAD_Y}           y1b={PAD_Y + qualH}
            color={NODE_COLOR.qualified}
          />
        )}

        {/* Raw → Nurture */}
        {nurtureCnt > 0 && (
          <Band
            x0={C0 + NW} y0t={PAD_Y + qualH}  y0b={PAD_Y + IH}
            x1={C1}      y1t={PAD_Y + qualH}   y1b={PAD_Y + IH}
            color={NODE_COLOR.nurture}
          />
        )}

        {/* Qualified → each rep / overflow  (CROSSING bands) */}
        {sourceSegs.map(seg => {
          const dest = destNodes.find(n => n.key === seg.key);
          if (!dest) return null;
          return (
            <Band
              key={seg.key}
              x0={C1 + NW} y0t={seg.y}     y0b={seg.y + seg.h}
              x1={C2}      y1t={dest.y}    y1b={dest.y + dest.h}
              color={dest.color}
              opacity={0.2}
            />
          );
        })}

        {/* ════════ NODES ════════ */}

        {/* Raw */}
        <rect x={C0} y={PAD_Y} width={NW} height={IH} rx={2} fill={NODE_COLOR.raw} />

        {/* Qualified */}
        {qualified > 0 && qualH >= 2 && (
          <rect x={C1} y={PAD_Y} width={NW} height={qualH} rx={2} fill={NODE_COLOR.qualified} />
        )}

        {/* Nurture */}
        {nurtureCnt > 0 && nurH >= 2 && (
          <rect x={C1} y={PAD_Y + qualH} width={NW} height={nurH} rx={2} fill={NODE_COLOR.nurture} />
        )}

        {/* Right nodes */}
        {destNodes.map(n => (
          <rect key={n.key} x={C2} y={n.y} width={NW} height={n.h} rx={2} fill={n.color} />
        ))}

        {/* ════════ LABELS ════════ */}

        {/* Raw — left of C0 */}
        <NodeLabel x={C0 - 12} y={PAD_Y} value={total}    name="Raw"       color={NODE_COLOR.raw} />

        {/* Qualified — left of C1 */}
        {qualified > 0 && (
          <NodeLabel x={C1 - 12} y={PAD_Y} value={qualified} name="Qualified" color={NODE_COLOR.qualified} />
        )}

        {/* Nurture — left of C1, at nurture node top */}
        {nurtureCnt > 0 && nurH >= 20 && (
          <NodeLabel x={C1 - 12} y={PAD_Y + qualH} value={nurtureCnt} name="Nurture" color={NODE_COLOR.nurture} />
        )}

        {/* Right node labels */}
        {destNodes.map(n => (
          <NodeLabel
            key={n.key + "-lbl"}
            x={C2 + NW + 12}
            y={n.y}
            value={n.count}
            name={truncate(n.label, 16)}
            color={n.color}
            align="start"
          />
        ))}
      </svg>

      <p className="text-cap text-ink-3 mt-1.5">
        Real-time · cập nhật khi điều chỉnh ngưỡng
      </p>
    </div>
  );
}
