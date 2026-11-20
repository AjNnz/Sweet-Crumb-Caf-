"use client";

import { useMemo, useState } from "react";

import { Select } from "@/components/common/ui/input";
import { cn, formatNumber } from "@/lib/utils";
import { InventoryRow } from "./aggregation";

type SortMode = "DEFAULT" | "SOLD_DESC" | "WASTED_DESC";

/* Inventory & wastage — what's on the shelf, what sold (from completed
 * orders), and what was written off at the end of a shift. The sort
 * control is local to this section: the rest of the report is untouched. */
export function InventoryWastageSection({ rows }: { rows: InventoryRow[] }) {
  const [sort, setSort] = useState<SortMode>("DEFAULT");

  const sorted = useMemo(() => {
    if (sort === "SOLD_DESC") {
      return [...rows].sort((a, b) => b.sold - a.sold || a.name.localeCompare(b.name));
    }
    if (sort === "WASTED_DESC") {
      return [...rows].sort((a, b) => b.wasted - a.wasted || a.name.localeCompare(b.name));
    }
    return rows;
  }, [rows, sort]);

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
      {/* Toolbar: dimension hints + the requested sort options */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 bg-cream px-4 py-2.5">
        <p className="text-xs text-mocha">
          Sold = completed orders · Wasted = end-of-shift write-offs
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-mocha">Sort by</span>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="w-48"
            aria-label="Sort inventory and wastage rows"
          >
            <option value="DEFAULT">Default (product order)</option>
            <option value="SOLD_DESC">Sold — high to low</option>
            <option value="WASTED_DESC">Wastage — high to low</option>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-cream text-left text-xs uppercase tracking-wide text-mocha">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Available</th>
              <th className="px-4 py-3 text-right">Sold</th>
              <th className="px-4 py-3 text-right">Wasted / unsold</th>
              <th className="px-4 py-3">Threshold</th>
              <th className="px-4 py-3">Last update</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
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
