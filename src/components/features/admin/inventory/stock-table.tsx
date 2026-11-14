"use client";

import type { InventoryItem, Product } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { ProductThumb } from "@/components/features/customer/product-card";
import { cn, formatDateTime, formatNumber } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* The stock table — one row per tracked product. Columns for qty,     */
/* threshold (click to edit), computed health status, and the two      */
/* row actions. Opening modals is delegated via the four callbacks.    */
/* ------------------------------------------------------------------ */

function stockStatus(inv: InventoryItem, product: Product) {
  if (!product.available) return { label: "Inactive", cls: "bg-stone-200 text-stone-600" };
  if (inv.quantity === 0) return { label: "Out of stock", cls: "bg-red-100 text-red-700" };
  if (inv.quantity <= inv.lowStockThreshold * 0.5) return { label: "Critical", cls: "bg-red-100 text-red-700" };
  if (inv.quantity <= inv.lowStockThreshold) return { label: "Low stock", cls: "bg-amber-100 text-amber-700" };
  return { label: "Healthy", cls: "bg-emerald-100 text-emerald-700" };
}

export function StockTable({
  rows,
  onAdjust,
  onHistory,
  onThreshold,
}: {
  rows: Array<{ product: Product; inv: InventoryItem }>;
  onAdjust: (entry: { product: Product; inv: InventoryItem }) => void;
  onHistory: (inv: InventoryItem) => void;
  onThreshold: (entry: { product: Product; inv: InventoryItem }) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-cream text-left text-xs uppercase tracking-wide text-mocha">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Inventory ID</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Available qty</th>
              <th className="px-4 py-3 text-right">Threshold</th>
              <th className="px-4 py-3">Stock status</th>
              <th className="px-4 py-3">Last update</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, inv }) => {
              const status = stockStatus(inv, product);
              return (
                <tr key={product.id} className="border-b border-primary/5 transition-colors hover:bg-cream/60">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <ProductThumb product={product} className="h-10 w-10 rounded-lg" />
                      <span className="font-semibold text-espresso">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-mocha">inv-{product.id.replace("prd-", "")}</td>
                  <td className="px-4 py-2.5 text-mocha">{product.category}</td>
                  <td className="px-4 py-2.5 text-right font-bold">
                    <span className={cn(inv.quantity === 0 ? "text-red-600" : "text-espresso")}>{formatNumber(inv.quantity)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-mocha">
                    <button
                      className=" underline decoration-dotted underline-offset-2 hover:text-primary"
                      onClick={() => onThreshold({ product, inv })}
                    >
                      {inv.lowStockThreshold}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", status.cls)}>{status.label}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-mocha">{formatDateTime(inv.lastUpdated)}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => onAdjust({ product, inv })}>
                        Adjust
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onHistory(inv)}>
                        History
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!rows.length ? <p className="py-10 text-center text-sm text-mocha">Nothing matches the filter.</p> : null}
    </div>
  );
}
