import type { Product } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure landing math — the featured picks and category emoji map.      */
/* No React in here.                                                   */
/* ------------------------------------------------------------------ */

export const CATEGORY_EMOJI: Record<string, string> = {
  Cupcakes: "🧁",
  Cakes: "🍰",
  Pastries: "🥐",
  Coffee: "☕",
  "Other Drinks": "🥤",
};

/** First 8 active products — the "Featured today" grid. */
export function featuredProductsOf(products: Product[]): Product[] {
  return products.filter((p) => p.available && !p.archived).slice(0, 8);
}
