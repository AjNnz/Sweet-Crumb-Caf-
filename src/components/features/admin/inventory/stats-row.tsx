"use client";

import { SearchIcon } from "@/components/common/icons";
import { Input, Select } from "@/components/common/ui/input";
import { cn, formatNumber } from "@/lib/utils";
import type { InventoryItem, Product } from "@/lib/types";

/* Summary cards — counts across the currently filtered rows plus all-time waste. */
export function StatsRow({
  rows,
  wastedTotal,
}: {
  rows: Array<{ product: Product; inv: InventoryItem }>;
  wastedTotal: number;
}) {
  const lowCount = rows.filter(({ product, inv }) => product.available && inv.quantity <= inv.lowStockThreshold).length;
  const outCount = rows.filter((r) => r.inv.quantity === 0).length;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-mocha">Tracked products</p>
        <p className="mt-1 font-display text-2xl font-bold text-espresso">{rows.length}</p>
      </div>
      <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-mocha">Low stock alerts</p>
        <p className={cn("mt-1 font-display text-2xl font-bold", lowCount ? "text-amber-600" : "text-espresso")}>
          {lowCount}
        </p>
      </div>
      <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-mocha">Out of stock</p>
        <p className={cn("mt-1 font-display text-2xl font-bold", outCount ? "text-red-600" : "text-espresso")}>
          {outCount}
        </p>
      </div>
      <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-mocha">Units wasted (all time)</p>
        <p className="mt-1 font-display text-2xl font-bold text-espresso">{formatNumber(wastedTotal)}</p>
      </div>
    </div>
  );
}

/* Search + stock-level filter. */
export function InventoryFilters({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
}: {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 sm:flex-1">
        <span className="absolute left-3 top-0 flex h-10 items-center text-mocha">
          <SearchIcon />
        </span>
        <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search inventory…" className="pl-9" />
      </div>
      <Select value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)} className="w-full sm:w-40">
        <option value="ALL">All stock levels</option>
        <option value="LOW">Low stock only</option>
        <option value="OUT">Out of stock only</option>
      </Select>
    </div>
  );
}
