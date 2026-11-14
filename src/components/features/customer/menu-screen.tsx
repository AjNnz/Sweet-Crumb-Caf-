"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useStore } from "@/context/store";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import type { ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input, Select } from "@/components/common/ui/input";
import { SearchIcon } from "@/components/common/icons";
import { ProductCard } from "@/components/features/customer/product-card";

/** Narrow a raw ?category= value to a known category, else null. */
function parseCategory(value: string | null): ProductCategory | null {
  return value && (PRODUCT_CATEGORIES as string[]).includes(value) ? (value as ProductCategory) : null;
}

function MenuContent() {
  const { products, getStock } = useStore();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">(
    () => parseCategory(categoryParam) ?? "All",
  );
  const [sort, setSort] = useState("popular");
  const [hideUnavailable, setHideUnavailable] = useState(false);

  // Keep the active category in sync when the query changes
  // (e.g. landing-page category cards navigate to /menu?category=Cakes)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing category from the URL query
    setCategory(parseCategory(categoryParam) ?? "All");
  }, [categoryParam]);

  const chips: Array<ProductCategory | "All"> = ["All", ...PRODUCT_CATEGORIES];

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: products.length };
    for (const c of PRODUCT_CATEGORIES) {
      map[c] = products.filter((p) => p.category === c).length;
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => !p.archived);
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
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
  }, [products, category, search, sort, hideUnavailable, getStock]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-espresso sm:text-4xl">Our Menu</h1>
        <p className="mt-2 text-sm text-mocha">
          Baked goods are made in limited daily batches; drinks are prepared to order.
        </p>
      </div>

      {/* Search & filters */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-0 flex h-10 items-center text-mocha">
            <SearchIcon />
          </span>
          <Input
            placeholder="Search the menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="sm:w-44">
          <option value="popular">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </Select>
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-mocha">
          <input
            type="checkbox"
            checked={hideUnavailable}
            onChange={(e) => setHideUnavailable(e.target.checked)}
            className="h-4 w-4 accent-[#5C4033]"
          />
          Available only
        </label>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              category === c
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-espresso shadow-sm hover:bg-latte",
            )}
          >
            {c}
            <span className="ml-1.5 text-xs opacity-60">{counts[c]}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-4 font-semibold text-espresso">Nothing matches your search</p>
          <p className="mt-1 text-sm text-mocha">Try a different keyword or category.</p>
        </div>
      )}
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuContent />
    </Suspense>
  );
}
