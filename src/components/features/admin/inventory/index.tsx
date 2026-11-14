"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import type { InventoryItem, Product } from "@/lib/types";
import { isMadeToOrder } from "@/lib/types";

import { InventoryFilters, StatsRow } from "./stats-row";
import { StockTable } from "./stock-table";
import { StockActionModal } from "./stock-action-modal";
import { HistoryModal } from "./history-modal";
import { ThresholdModal } from "./threshold-modal";

/* ------------------------------------------------------------------ */
/* Inventory — a thin COMPOSITION. The table, stats, filters and the   */
/* three modals each live in their own file; this file owns the        */
/* search/filter state and which modal (if any) is open.               */
/* ------------------------------------------------------------------ */
export default function AdminInventoryScreen() {
  const { products, inventory } = useStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionItem, setActionItem] = useState<{ product: Product; inv: InventoryItem } | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [thresholdItem, setThresholdItem] = useState<{ product: Product; inv: InventoryItem } | null>(null);

  const rows = useMemo(() => {
    // Drinks are prepared to order and aren't tracked as counter stock
    let list = products
      .filter((p) => !p.archived && !isMadeToOrder(p.category))
      .map((p) => ({ product: p, inv: inventory.find((i) => i.productId === p.id) }))
      .filter((r): r is { product: Product; inv: InventoryItem } => Boolean(r.inv));
    if (statusFilter === "LOW") list = list.filter(({ product, inv }) => product.available && inv.quantity <= inv.lowStockThreshold);
    if (statusFilter === "OUT") list = list.filter((r) => r.inv.quantity === 0);
    if (search.trim()) list = list.filter((r) => r.product.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, inventory, search, statusFilter]);

  const wastedTotal = useMemo(
    () =>
      inventory.reduce(
        (s, inv) => s + inv.movements.filter((m) => m.type === "WASTED").reduce((x, m) => x + m.quantity, 0),
        0,
      ),
    [inventory],
  );

  const historyProduct = products.find((p) => p.id === historyItem?.productId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Inventory Management</h1>
        <p className="text-xs text-mocha">
          Finished products only — track availability, record stock additions, wastage and adjustments.
          Coffee and other drinks are made to order, so they aren&apos;t tracked here.
        </p>
      </div>

      {/* Summary */}
      <StatsRow rows={rows} wastedTotal={wastedTotal} />

      {/* Filters — one row on desktop; search stacks above the filter on mobile */}
      <InventoryFilters search={search} onSearch={setSearch} statusFilter={statusFilter} onStatusFilter={setStatusFilter} />

      {/* Table */}
      <StockTable
        rows={rows}
        onAdjust={setActionItem}
        onHistory={setHistoryItem}
        onThreshold={(entry) => setThresholdItem(entry)}
      />

      {/* Modals (each owns its own form state) */}
      <StockActionModal item={actionItem} onClose={() => setActionItem(null)} />
      <HistoryModal product={historyProduct} inv={historyItem} onClose={() => setHistoryItem(null)} />
      <ThresholdModal item={thresholdItem} onClose={() => setThresholdItem(null)} />
    </div>
  );
}
