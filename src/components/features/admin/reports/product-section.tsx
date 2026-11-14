"use client";

import { formatCurrency, formatNumber } from "@/lib/utils";
import { ProductRow } from "./aggregation";

/* Product performance — which items sell units and bring revenue. */
export function ProductPerformanceSection({ rows }: { rows: ProductRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-cream text-left text-xs uppercase tracking-wide text-mocha">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Units sold</th>
              <th className="px-4 py-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-primary/5 hover:bg-cream/60">
                <td className="px-4 py-2.5 font-medium text-espresso">{r.name}</td>
                <td className="px-4 py-2.5 text-mocha">{r.category}</td>
                <td className="px-4 py-2.5 text-right text-mocha">{formatNumber(r.units)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-primary">{formatCurrency(r.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
