import type { Product } from "@/lib/types";
import { isMadeToOrder } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure product-detail math — stock pills, quantity cap and the        */
/* related-products list. No React in here.                            */
/* ------------------------------------------------------------------ */

/** How the stock badge should read for this product. `label: null` means
 * no badge at all (drinks are made to order — no note needed). */
export function stockPillOf(product: Product, stock: number) {
  const madeToOrder = isMadeToOrder(product.category);
  const soldOut = !product.available || (!madeToOrder && stock === 0);
  if (soldOut) return { madeToOrder, soldOut, label: "Sold out", cls: "bg-red-100 text-red-700" };
  if (madeToOrder) return { madeToOrder, soldOut, label: null, cls: "" };
  if (stock <= 5) return { madeToOrder, soldOut, label: `Only ${stock} left!`, cls: "bg-amber-100 text-amber-800" };
  return { madeToOrder, soldOut, label: `${stock} available`, cls: "bg-emerald-100 text-emerald-700" };
}

/** The stepper ceiling: stock, capped at 99 per order. */
export function quantityMaxOf(stock: number): number {
  return Math.min(stock, 99);
}

/** Up to 4 other products from the same category. */
export function relatedProductsOf(products: Product[], product: Product): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id && !p.archived)
    .slice(0, 4);
}
