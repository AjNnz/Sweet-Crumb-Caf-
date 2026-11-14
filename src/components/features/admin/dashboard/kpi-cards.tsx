"use client";

import { cn } from "@/lib/utils";

/* The four KPI cards (revenue, transactions, units, availability). */
export function KpiCards({ kpis }: { kpis: Array<{ label: string; value: string; sub: string; icon: string; tone: string }> }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl", k.tone)}>
            {k.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-mocha">{k.label}</p>
            <p className="font-display text-xl font-bold text-espresso">{k.value}</p>
            <p className="truncate text-[10px] text-mocha">{k.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
