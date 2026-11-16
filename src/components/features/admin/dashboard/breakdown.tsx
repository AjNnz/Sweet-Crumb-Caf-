"use client";

import { DonutChart, HorizontalBars } from "@/components/common/charts";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "./aggregation";

/* The three-column breakdown row: categories, channels, best sellers. */
export function BreakdownSection({ stats, range }: { stats: DashboardStats; range: number }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {/* Categories */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-espresso">Sales by category</h2>
        <p className="text-[11px] text-mocha">revenue share in the last {range} days</p>
        <div className="mt-4">
          <HorizontalBars
            data={stats.categories.map((c) => ({ label: c.category, value: Math.round(c.revenue), money: true }))}
            money
          />
        </div>
      </div>

      {/* Channel comparison */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-espresso">Walk-in vs Online</h2>
        <p className="text-[11px] text-mocha">revenue by ordering channel</p>
        <div className="mt-4">
          <DonutChart
            data={stats.channels.map((c) => ({ label: c.channel, value: Math.round(c.revenue) }))}
            height={170}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px]">
          {stats.channels.map((c) => (
            <div key={c.channel} className="rounded-xl bg-cream p-2">
              <p className="font-bold text-espresso">{c.orders} orders</p>
              <p className="truncate text-mocha">{formatCurrency(c.revenue)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Best sellers */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-espresso">Best-selling products</h2>
        <p className="text-[11px] text-mocha">by units sold, last {range} days</p>
        <div className="mt-4">
          <HorizontalBars data={stats.best.map((p) => ({ label: p.name.replace(" (Slice)", ""), value: p.units }))} />
        </div>
      </div>
    </div>
  );
}
