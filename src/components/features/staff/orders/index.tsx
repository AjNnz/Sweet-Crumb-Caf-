"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_STYLES } from "@/lib/utils";
import { useToast } from "@/components/common/toast";

import { filterOrders, statusCountsOf } from "./aggregation";
import { OrdersHeader, OrderFilters } from "./header";
import { OrderCard } from "./order-card";

/* ------------------------------------------------------------------ */
/* Order Management — a thin COMPOSITION. The header/filters and the   */
/* order cards live in their own files; this file owns the filter      */
/* state and the "advance status" action.                              */
/* ------------------------------------------------------------------ */
export default function OrderManagementPage() {
  const { orders, updateOrderStatus } = useStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => filterOrders(orders, search, statusFilter), [orders, search, statusFilter]);
  const statusCounts = useMemo(() => statusCountsOf(orders), [orders]);

  const advance = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    toast(`Order marked as ${ORDER_STATUS_STYLES[status].label.toLowerCase()}.`);
  };

  return (
    <div className="flex flex-col gap-4">
      <OrdersHeader />

      {/* Filters */}
      <OrderFilters search={search} onSearch={setSearch} statusFilter={statusFilter} onStatusFilter={setStatusFilter} statusCounts={statusCounts} />

      {/* Queue (cap at 60 cards so a huge history can't freeze the page) */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.slice(0, 60).map((order) => (
          <OrderCard key={order.id} order={order} onAdvance={advance} />
        ))}
      </div>
      {!filtered.length ? <p className="py-10 text-center text-sm text-mocha">No orders match the filter.</p> : null}
    </div>
  );
}
