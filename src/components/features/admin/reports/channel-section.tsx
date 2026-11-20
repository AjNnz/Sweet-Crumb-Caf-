"use client";

import { HorizontalBars } from "@/components/common/charts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ChannelRow } from "./aggregation";
import { DayFilter } from "./day-filter";

/* Channel comparison — online vs walk-in, table on the left and the
 * order-volume bars on the right. The day picker narrows both views. */
export function ChannelSection({
  rows,
  day,
  onDayChange,
}: {
  rows: ChannelRow[];
  day: string;
  onDayChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
        <DayFilter day={day} onChange={onDayChange} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-cream text-left text-xs uppercase tracking-wide text-mocha">
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Units</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Avg / order</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.channel} className="border-b border-primary/5">
                <td className="px-4 py-3 font-semibold text-espresso">{r.channel}</td>
                <td className="px-4 py-3 text-right text-mocha">{r.orders}</td>
                <td className="px-4 py-3 text-right text-mocha">{formatNumber(r.units)}</td>
                <td className="px-4 py-3 text-right font-bold text-primary">{formatCurrency(r.revenue)}</td>
                <td className="px-4 py-3 text-right text-mocha">{formatCurrency(r.revenuePerOrder)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="min-w-0 rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-espresso">Order volume by channel</h2>
        <div className="mt-4">
          <HorizontalBars data={rows.map((r) => ({ label: r.channel, value: r.orders }))} />
        </div>
      </div>
      </div>
    </div>
  );
}
