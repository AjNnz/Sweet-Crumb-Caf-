"use client";

import { BarChart } from "@/components/common/charts";
import type { DashboardStats } from "./aggregation";

/* Unsold products per day — the end-of-shift write-offs chart. */
export function UnsoldSection({ stats, range }: { stats: DashboardStats; range: number }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-espresso">Unsold products per day</h2>
        <span className="text-xs text-mocha">end-of-shift write-offs · last {range} days</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-125">
          <BarChart
            danger
            data={stats.unsoldDay.map((d) => ({
              label: new Date(d.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
              value: d.units,
              highlight: d.date === stats.unsoldDay[stats.unsoldDay.length - 1]?.date,
            }))}
            height={170}
          />
        </div>
      </div>
    </div>
  );
}
