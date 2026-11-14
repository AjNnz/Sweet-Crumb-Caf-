"use client";

import { cn, formatNumber } from "@/lib/utils";
import { InventoryRow } from "./aggregation";

/* Inventory & wastage — what's on the shelf, what sold (as recorded by
 * the ledger), what was written off at the end of a shift. */
export function InventoryWastageSection({ rows }: { rows: InventoryRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-cream text-left text-xs uppercase tracking-wide text-mocha">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Available</th>
              <th className="px-4 py-3 text-right">Sold (recorded)</th>
              <th className="px-4 py-3 text-right">Wasted / unsold</th>
              <th className="px-4 py-3">Threshold</th>
              <th className="px-4 py-3">Last update</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-primary/5 hover:bg-cream/60">
                <td className="px-4 py-2.5 font-medium text-espresso">{r.name}</td>
                <td className="px-4 py-2.5 text-mocha">{r.category}</td>
                <td className="px-4 py-2.5 text-right">{formatNumber(r.available)}</td>
                <td className="px-4 py-2.5 text-right text-mocha">{formatNumber(r.sold)}</td>
                <td className={cn("px-4 py-2.5 text-right", r.wasted > 0 ? "font-bold text-red-600" : "text-mocha")}>
                  {formatNumber(r.wasted)}
                </td>
                <td className="px-4 py-2.5 text-right text-mocha">{r.threshold}</td>
                <td className="px-4 py-2.5 text-xs text-mocha">{r.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
