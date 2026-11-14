"use client";

import { ORDER_STATUS_FLOW } from "@/lib/types";
import { Input, Select } from "@/components/common/ui/input";
import { ORDER_STATUS_STYLES } from "@/lib/utils";
import { SearchIcon } from "@/components/common/icons";

/* Page header — explains what the queue is for. */
export function OrdersHeader() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-espresso">Order Management</h1>
      <p className="text-xs text-mocha">
        Incoming online orders and tickets awaiting action. Update status as food is prepared — orders marked
        Ready move to the Ready for Handoff page.
      </p>
    </div>
  );
}

/* Search + status filter with live counts. */
export function OrderFilters({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  statusCounts,
}: {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  statusCounts: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-52 flex-1">
        <span className="absolute left-3 top-0 flex h-10 items-center text-mocha">
          <SearchIcon />
        </span>
        <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search reference, name, contact…" className="pl-9" />
      </div>
      <Select value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)} className="w-44">
        <option value="ALL">All statuses</option>
        {/* Ready orders are managed on the Ready for Handoff page, so they're
            not offered as a filter here. */}
        {ORDER_STATUS_FLOW.filter((s) => s !== "READY").map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_STYLES[s].label} ({statusCounts[s] ?? 0})
          </option>
        ))}
        <option value="CANCELLED">Cancelled ({statusCounts["CANCELLED"] ?? 0})</option>
      </Select>
    </div>
  );
}
