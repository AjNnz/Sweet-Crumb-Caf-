"use client";

import { useStore } from "@/context/store";
import type { Product, ProductCategory } from "@/lib/types";
import { isMadeToOrder, PRODUCT_CATEGORIES } from "@/lib/types";
import { ProductThumb } from "@/components/features/customer/product-card";
import { cn, formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* The left half of the POS — category pills plus the tappable product */
/* grid. Tapping a tile signals the composition via onAdd; the ticket  */
/* quantity badge comes back in as a prop.                             */
/* ------------------------------------------------------------------ */

export function ProductGrid({
  selectable,
  ticket,
  category,
  onCategory,
  onAdd,
}: {
  selectable: Product[];
  ticket: Record<string, number>;
  category: "All" | ProductCategory;
  onCategory: (c: "All" | ProductCategory) => void;
  onAdd: (productId: string) => void;
}) {
  return (
    <div>
      <CategoryPills category={category} onSelect={onCategory} />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {selectable.map((p) => (
          <ProductTile key={p.id} product={p} qty={ticket[p.id] ?? 0} onAdd={onAdd} />
        ))}
      </div>
      {!selectable.length ? <p className="mt-10 text-center text-sm text-mocha">No products match.</p> : null}
    </div>
  );
}

/* Category filter pills — selection state lives in the composition. */
export function CategoryPills({ category, onSelect }: { category: "All" | ProductCategory; onSelect: (c: "All" | ProductCategory) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(["All", ...PRODUCT_CATEGORIES] as const).map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            category === c ? "bg-primary text-white shadow-sm" : "bg-white text-espresso shadow-sm hover:bg-latte",
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

/* One tappable product tile — shows price, live stock and the ticket badge. */
function ProductTile({ product, qty, onAdd }: { product: Product; qty: number; onAdd: (productId: string) => void }) {
  const { getStock } = useStore();
  const stock = getStock(product.id);
  const out = stock === 0;
  const madeToOrder = isMadeToOrder(product.category);
  return (
    <button
      disabled={out}
      onClick={() => onAdd(product.id)}
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-3 text-left shadow-card transition-all",
        out ? "opacity-50" : "border-primary/10 hover:-translate-y-0.5 hover:shadow-lift",
        qty > 0 && "border-secondary ring-2 ring-accent/60",
      )}
    >
      <ProductThumb product={product} className="mb-2 h-20 w-full rounded-xl" />
      <p className="line-clamp-2 min-h-10 text-xs font-semibold text-espresso">{product.name}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm font-bold text-primary">{formatCurrency(product.price)}</span>
        <span className={cn("text-[10px] font-semibold", !madeToOrder && stock <= 5 ? "text-red-600" : "text-mocha")}>
          {out ? "Sold out" : madeToOrder ? "Made to order" : `${stock} left`}
        </span>
      </div>
      {qty > 0 ? (
        <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-1 text-xs font-bold text-white">
          {qty}
        </span>
      ) : null}
    </button>
  );
}
