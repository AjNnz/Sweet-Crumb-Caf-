"use client";

import { Input, Select } from "@/components/common/ui/input";
import { SearchIcon } from "@/components/common/icons";

/* Page title + the search/sort/availability controls. */
export function MenuHeader({
  search,
  onSearch,
  sort,
  onSort,
  hideUnavailable,
  onHideUnavailable,
}: {
  search: string;
  onSearch: (v: string) => void;
  sort: string;
  onSort: (v: string) => void;
  hideUnavailable: boolean;
  onHideUnavailable: (v: boolean) => void;
}) {
  return (
    <>
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
          <Input placeholder="Search the menu…" value={search} onChange={(e) => onSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sort} onChange={(e) => onSort(e.target.value)} className="sm:w-44">
          <option value="popular">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </Select>
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-mocha">
          <input
            type="checkbox"
            checked={hideUnavailable}
            onChange={(e) => onHideUnavailable(e.target.checked)}
            className="h-4 w-4 accent-[#5C4033]"
          />
          Available only
        </label>
      </div>
    </>
  );
}
