import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure menu math — category parsing, chip counts and the big          */
/* filter+sort. No React in here.                                      */
/* ------------------------------------------------------------------ */

export type MenuFilters = {
  category: ProductCategory | "All";
  search: string;
  sort: string;
  hideUnavailable: boolean;
};

/** Narrow a raw ?category= value to a known category, else null. */
export function parseCategory(value: string | null): ProductCategory | null {
  return value && (PRODUCT_CATEGORIES as string[]).includes(value) ? (value as ProductCategory) : null;
}

/** Product counts per category for the chips. */
export function categoryCounts(products: Product[]): Record<string, number> {
  const map: Record<string, number> = { All: products.length };
  for (const c of PRODUCT_CATEGORIES) {
    map[c] = products.filter((p) => p.category === c).length;
  }
  return map;
}

/** The visible menu: archived excluded, then category/search/availability
 * filters, then the chosen sort order. */
export function filterMenu(
  products: Product[],
  { category, search, sort, hideUnavailable }: MenuFilters,
  getStock: (productId: string) => number,
): Product[] {
  let list = products.filter((p) => !p.archived);
  if (category !== "All") list = list.filter((p) => p.category === category);
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (hideUnavailable) list = list.filter((p) => p.available && getStock(p.id) > 0);

  switch (sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case "name":
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break; // natural order
  }
  return list;
}
