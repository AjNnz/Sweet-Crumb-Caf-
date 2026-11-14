"use client";

import { SellThroughBars } from "@/components/common/charts";
import type { DashboardStats } from "./aggregation";

/* Sell-through by product — combined two-tone sold-vs-unsold bar list;
 * slow movers stand out at a glance. */
export function SellThroughSection({ stats, range }: { stats: DashboardStats; range: number }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-espresso">Sell-through by product</h2>
          <p className="text-[11px] text-mocha">
            share sold vs unsold · batch-baked goods · last {range} days
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-mocha">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" /> sold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> unsold
          </span>
        </div>
      </div>
      <div className="mt-4">
        <SellThroughBars
          data={stats.sellThrough.map((p) => ({
            label: p.name.replace(" (Slice)", ""),
            sold: p.sold,
            wasted: p.wasted,
            soldPct: p.soldPct,
            wastedPct: p.wastedPct,
          }))}
        />
      </div>
    </div>
  );
}
