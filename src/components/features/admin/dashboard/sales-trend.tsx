"use client";

import { BarChart } from "@/components/common/charts";
import type { DashboardStats } from "./aggregation";

/* Daily sales trend — revenue per day, today highlighted. */
export function SalesTrendSection({ stats, range }: { stats: DashboardStats; range: number }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-espresso">Daily sales trend</h2>
        <span className="text-xs text-mocha">last {range} days · completed sales only</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-125">
          <BarChart
            data={stats.day.map((d) => ({
              label: new Date(d.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
              value: Math.round(d.revenue),
              highlight: d.date === stats.day[stats.day.length - 1]?.date,
            }))}
            money
            height={190}
          />
        </div>
      </div>
    </div>
  );
}
