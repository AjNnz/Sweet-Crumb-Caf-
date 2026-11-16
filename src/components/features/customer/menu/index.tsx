"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useStore } from "@/context/store";
import type { ProductCategory } from "@/lib/types";

import { parseCategory, categoryCounts, filterMenu } from "./aggregation";
import { MenuHeader } from "./header";
import { CategoryChips } from "./category-chips";
import { ProductGrid } from "./product-grid";

/* ------------------------------------------------------------------ */
/* Menu — a thin COMPOSITION. The header/controls, the category chips  */
/* and the product grid live in their own files; this file owns the    */
/* filter state and the ?category= URL sync.                           */
/* ------------------------------------------------------------------ */
export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuContent />
    </Suspense>
  );
}

function MenuContent() {
  const { products, getStock } = useStore();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">(() => parseCategory(categoryParam) ?? "All");
  const [sort, setSort] = useState("popular");
  const [hideUnavailable, setHideUnavailable] = useState(false);

  // Keep the active category in sync when the query changes
  // (e.g. landing-page category cards navigate to /menu?category=Cakes)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing category from the URL query
    setCategory(parseCategory(categoryParam) ?? "All");
  }, [categoryParam]);

  const counts = useMemo(() => categoryCounts(products), [products]);
  const filtered = useMemo(
    () => filterMenu(products, { category, search, sort, hideUnavailable }, getStock),
    [products, category, search, sort, hideUnavailable, getStock],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <MenuHeader
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
        hideUnavailable={hideUnavailable}
        onHideUnavailable={setHideUnavailable}
      />

      {/* Category chips */}
      <CategoryChips category={category} onSelect={setCategory} counts={counts} />

      {/* Grid */}
      <ProductGrid products={filtered} />
    </main>
  );
}
