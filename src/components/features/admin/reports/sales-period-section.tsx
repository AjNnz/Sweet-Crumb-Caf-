"use client";

import { BarChart } from "@/components/common/charts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ReportRow } from "./aggregation";

/* ------------------------------------------------------------------ */
/* Daily / Weekly / Monthly — one section serves all three period      */
/* reports: the chronological table plus the revenue chart and the     */
/* best / average period cards.                                        */
/* ------------------------------------------------------------------ */
export function SalesPeriodSection({ rows }: { rows: ReportRow[] }) {
  return (
    <div className="grid gap-4">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-cream text-left text-xs uppercase tracking-wide text-mocha">
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Units sold</th>
                <th className="px-4 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 45).map((r) => (
                <tr key={r.label} className="border-b border-primary/5 hover:bg-cream/60">
                  <td className="px-4 py-2.5 font-medium text-espresso">{r.label}</td>
                  <td className="px-4 py-2.5 text-right text-mocha">{r.count}</td>
                  <td className="px-4 py-2.5 text-right text-mocha">{formatNumber(r.units)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-primary">{formatCurrency(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="min-w-0 h-fit rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-espresso">Revenue by period</h2>
        <div className="mt-4">
          <BarChart
            data={[...rows].slice(0, 14).reverse().map((r) => ({ label: r.short, value: Math.round(r.revenue) }))}
            money
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-cream p-3">
            <p className="text-[10px] font-semibold uppercase text-mocha">Best period</p>
            <p className="truncate font-display font-bold text-espresso">
              {[...rows].sort((a, b) => b.revenue - a.revenue)[0]?.label ?? "—"}
            </p>
          </div>
          <div className="rounded-xl bg-cream p-3">
            <p className="text-[10px] font-semibold uppercase text-mocha">Avg period</p>
            <p className="font-display font-bold text-espresso">
              {formatCurrency(rows.length ? rows.reduce((s, r) => s + r.revenue, 0) / rows.length : 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
