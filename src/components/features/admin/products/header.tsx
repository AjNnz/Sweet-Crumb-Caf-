"use client";

import { SearchIcon } from "@/components/common/icons";
import { Button } from "@/components/common/ui/button";
import { Input, Select } from "@/components/common/ui/input";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

/* Page header — title + the Add Product entry point. */
export function ProductsHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Product Management</h1>
        <p className="text-xs text-mocha">Add, edit, archive or remove products sold in the cafe.</p>
      </div>
      <Button onClick={onAdd}>＋ Add Product</Button>
    </div>
  );
}

/* Search + category filter + the archived-view toggle. */
export function ProductFilters({
  search,
  onSearch,
  categoryFilter,
  onCategoryFilter,
  showArchived,
  onShowArchived,
}: {
  search: string;
  onSearch: (v: string) => void;
  categoryFilter: string;
  onCategoryFilter: (v: string) => void;
  showArchived: boolean;
  onShowArchived: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 sm:flex-1">
        <span className="absolute left-3 top-0 flex h-10 items-center text-mocha">
          <SearchIcon />
        </span>
        <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search products…" className="pl-9" />
      </div>
      <div className="flex flex-1 gap-2 sm:flex-none">
        <Select value={categoryFilter} onChange={(e) => onCategoryFilter(e.target.value)} className="w-full sm:w-40">
          <option value="ALL">All categories</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <button
          onClick={onShowArchived}
          className={cn("shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium", showArchived ? "bg-primary text-white" : "bg-white text-espresso shadow-sm hover:bg-latte")}
        >
          {showArchived ? "✓ Viewing archived" : "View archived"}
        </button>
      </div>
    </div>
  );
}
