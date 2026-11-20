"use client";

import { cn, formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Vertical bar chart (e.g. daily revenue)                             */
/* ------------------------------------------------------------------ */

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

export function BarChart({ data, money = false, height = 180, className, danger = false }: {
  data: BarDatum[];
  money?: boolean;
  height?: number;
  className?: string;
  /** Red bars — used for unsold/waste figures. */
  danger?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  // With 60 daily bars, a label under EVERY bar overlaps into an
  // unreadable smear. Keep all bars (no data is lost) but show only
  // ~9 evenly spaced labels, plus the latest day when it isn't cramped.
  // The exact date is always in the hover tooltip.
  const labelStep = Math.max(1, Math.ceil(data.length / 9));
  const lastIndex = data.length - 1;
  const showLastLabel = lastIndex - Math.floor(lastIndex / labelStep) * labelStep >= 4;
  return (
    <div className={cn("flex items-end gap-1", className)} style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <div
            className={cn(
              "w-full rounded-t-md transition-all",
              danger
                ? d.highlight
                  ? "bg-red-500"
                  : "bg-red-400/70 group-hover:bg-red-500"
                : d.highlight
                  ? "bg-secondary"
                  : "bg-accent/70 group-hover:bg-accent",
            )}
            style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
          />
          <span className="truncate text-[9px] text-mocha">
            {i % labelStep === 0 || (i === lastIndex && showLastLabel) ? d.label : "\u00a0"}
          </span>
          <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-espresso px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            {d.label} — {money ? formatCurrency(d.value) : d.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal bar list (categories, best sellers)                      */
/* ------------------------------------------------------------------ */

export function HorizontalBars({ data, money = false }: {
  data: Array<{ label: string; value: number; sub?: string }>;
  money?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate font-medium text-espresso sm:w-36">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-latte">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-accent"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-16 shrink-0 text-right font-semibold text-primary">
            {money ? formatCurrency(d.value) : d.value.toLocaleString()}
          </span>
        </div>
      ))}
      {data.length === 0 ? <p className="text-xs text-mocha">No data yet.</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sell-through: sold vs unsold share per product (two-tone bars)      */
/* ------------------------------------------------------------------ */

export interface SellThroughDatum {
  label: string;
  sold: number;
  wasted: number;
  soldPct: number;
  wastedPct: number;
}

export function SellThroughBars({ data }: { data: SellThroughDatum[] }) {
  if (!data.length) return <p className="text-xs text-mocha">No data yet.</p>;
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate font-medium text-espresso sm:w-36">{d.label}</span>
          <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-latte">
            <div
              className="h-full bg-gradient-to-r from-secondary to-accent"
              style={{ width: `${d.soldPct}%` }}
              title={`${d.sold} sold`}
            />
            <div
              className="h-full bg-red-400/80"
              style={{ width: `${d.wastedPct}%` }}
              title={`${d.wasted} unsold (end of shift)`}
            />
          </div>
          <span className="w-28 shrink-0 text-right text-[11px] font-semibold text-mocha sm:w-32">
            {Math.round(d.soldPct)}% sold · {Math.round(d.wastedPct)}% unsold
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Line / trend chart (daily sales trend)                              */
/* ------------------------------------------------------------------ */

export function LineChart({ data, height = 200 }: {
  data: Array<{ label: string; value: number }>;
  height?: number;
}) {
  const w = 600;
  const h = 220;
  const pad = { top: 14, right: 8, bottom: 26, left: 46 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const line = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `${pad.left},${pad.top + innerH} ${line} ${x(data.length - 1)},${pad.top + innerH}`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} className="overflow-visible">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6A77A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((g) => (
        <g key={g}>
          <line
            x1={pad.left}
            x2={w - pad.right}
            y1={pad.top + innerH - g * innerH}
            y2={pad.top + innerH - g * innerH}
            stroke="#EDE4D5"
            strokeWidth="1"
          />
          <text x={pad.left - 6} y={pad.top + innerH - g * innerH + 3} textAnchor="end" fontSize="9" fill="#6F5B4C">
            {max * g >= 1000 ? `${Math.round((max * g) / 1000)}k` : Math.round(max * g)}
          </text>
        </g>
      ))}
      <polygon points={area} fill="url(#areaFill)" />
      <polyline points={line} fill="none" stroke="#5C4033" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.value)} r="2.5" fill="#A47551">
          <title>{`${d.label}: ₱${d.value.toLocaleString()}`}</title>
        </circle>
      ))}
      {/* X labels — first, middle, last */}
      {data.length > 0 &&
        [0, Math.floor((data.length - 1) / 2), data.length - 1].map((i) => (
          <text key={i} x={x(i)} y={h - 8} textAnchor="middle" fontSize="9" fill="#6F5B4C">
            {data[i].label}
          </text>
        ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Donut chart (channel split)                                         */
/* ------------------------------------------------------------------ */

export function DonutChart({ data, height = 190 }: {
  data: Array<{ label: string; value: number }>;
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const colors = ["#5C4033", "#D6A77A", "#A47551", "#F0E6D8"];
  if (total === 0) data = data.map((d) => ({ ...d, value: 1 }));
  const totalDraw = data.reduce((s, d) => s + d.value, 0);

  let angle = -Math.PI / 2;
  const cx = 80;
  const cy = 80;
  const rOuter = 66;
  const rInner = 42;

  const arcs = data.map((d, i) => {
    const slice = (d.value / totalDraw) * Math.PI * 2;
    const start = angle;
    const end = angle + slice;
    angle = end; // eslint-disable-line react-hooks/immutability -- sequential arc accumulation, not render state
    const path = [
      `M ${cx + rOuter * Math.cos(start)} ${cy + rOuter * Math.sin(start)}`,
      `A ${rOuter} ${rOuter} 0 ${slice > Math.PI ? 1 : 0} 1 ${cx + rOuter * Math.cos(end)} ${cy + rOuter * Math.sin(end)}`,
      `L ${cx + rInner * Math.cos(end)} ${cy + rInner * Math.sin(end)}`,
      `A ${rInner} ${rInner} 0 ${slice > Math.PI ? 1 : 0} 0 ${cx + rInner * Math.cos(start)} ${cy + rInner * Math.sin(start)}`,
      "Z",
    ].join(" ");
    return { path, color: colors[i % colors.length], label: d.label, value: d.value };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 160 160" style={{ width: height, height }}>
        {arcs.map((a) => (
          <path key={a.label} d={a.path} fill={a.color}>
            <title>{`${a.label}`}</title>
          </path>
        ))}
        <text x="80" y="76" textAnchor="middle" fontSize="15" fontWeight="700" fill="#29231F">
          ₱{total >= 1000 ? `${(Math.round(total / 100) / 10).toLocaleString()}k` : Math.round(total)}
        </text>
        <text x="80" y="92" textAnchor="middle" fontSize="9" fill="#6F5B4C">
          revenue
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="font-medium text-espresso">{d.label}</span>
            <span className="text-mocha">
              {total > 0 ? `${Math.round((d.value / total) * 100)}%` : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
