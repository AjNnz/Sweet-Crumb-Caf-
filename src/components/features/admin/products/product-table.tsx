"use client";

import { useStore } from "@/context/store";
import type { Product } from "@/lib/types";
import { isMadeToOrder } from "@/lib/types";
import { ProductThumb } from "@/components/features/customer/product-card";
import { TrashIcon } from "@/components/common/icons";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* The product table — one row per product. Stock comes from the       */
/* inventory rows; row actions are delegated to the composition via    */
/* the four callbacks below.                                           */
/* ------------------------------------------------------------------ */

export function ProductTable({
  rows,
  showArchived,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: {
  rows: Product[];
  showArchived: boolean;
  onEdit: (p: Product) => void;
  onArchive: (p: Product) => void;
  onRestore: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-194 text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-cream text-left text-xs uppercase tracking-wide text-mocha">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-primary/5 transition-colors hover:bg-cream/60">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <ProductThumb product={p} className="h-10 w-10 rounded-lg" />
                    <span className="font-semibold text-espresso">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-mocha">{p.id}</td>
                <td className="px-4 py-2.5 text-mocha">{p.category}</td>
                <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(p.price)}</td>
                <td className="px-4 py-2.5 text-right">
                  <StockCell product={p} />
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      p.archived ? "bg-stone-200 text-stone-600" : p.available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
                    )}
                  >
                    {p.archived ? "Archived" : p.available ? "Active" : "Unavailable"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button className="text-xs font-semibold text-secondary hover:underline" onClick={() => onEdit(p)}>
                    Edit
                  </button>
                  {!p.archived ? (
                    <button className="ml-3 text-xs font-semibold text-amber-700 hover:underline" onClick={() => onArchive(p)}>
                      Archive
                    </button>
                  ) : (
                    <button className="ml-3 text-xs font-semibold text-emerald-700 hover:underline" onClick={() => onRestore(p)}>
                      Restore
                    </button>
                  )}
                  <button className="ml-3 text-xs font-semibold text-red-600 hover:underline" onClick={() => onDelete(p)} aria-label="Delete">
                    <TrashIcon className="inline h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length ? (
        <p className="py-10 text-center text-sm text-mocha">{showArchived ? "No archived products." : "No products match."}</p>
      ) : null}
    </div>
  );
}

/* Drinks are made to order — they have no counter stock to count. */
function StockCell({ product }: { product: Product }) {
  const { getStock } = useStore();
  if (isMadeToOrder(product.category)) return <span className="text-mocha">Made to order</span>;
  const stock = getStock(product.id);
  return (
    <span className={cn(stock === 0 ? "text-red-600" : stock <= 5 ? "text-amber-700" : "text-mocha")}>{formatNumber(stock)}</span>
  );
}
