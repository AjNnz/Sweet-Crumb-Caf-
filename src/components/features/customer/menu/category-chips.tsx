"use client";

import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

/* The category chips with per-category counts. */
export function CategoryChips({
  category,
  onSelect,
  counts,
}: {
  category: ProductCategory | "All";
  onSelect: (c: ProductCategory | "All") => void;
  counts: Record<string, number>;
}) {
  const chips: Array<ProductCategory | "All"> = ["All", ...PRODUCT_CATEGORIES];
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            category === c ? "bg-primary text-white shadow-sm" : "bg-white text-espresso shadow-sm hover:bg-latte",
          )}
        >
          {c}
          <span className="ml-1.5 text-xs opacity-60">{counts[c]}</span>
        </button>
      ))}
    </div>
  );
}
