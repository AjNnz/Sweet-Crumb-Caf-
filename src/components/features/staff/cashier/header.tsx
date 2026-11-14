"use client";

import { Input } from "@/components/common/ui/input";
import { useStore } from "@/context/store";

/* Page header — title + the product search field (state owned by the composition). */
export function CashierHeader({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  const { settings } = useStore();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Cashier / POS</h1>
        <p className="text-xs text-mocha">{settings.cafeName} — registered walk-in sales.</p>
      </div>
      <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search products…" className="w-full sm:w-64" />
    </div>
  );
}
