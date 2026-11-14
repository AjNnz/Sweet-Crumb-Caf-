import { displayCustomerName } from "@/lib/utils";
import type { Order } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure queue math — the workflow "options list" and the filter+sort   */
/* used by the composition. No React in here.                          */
/* ------------------------------------------------------------------ */

/** Staff advance the workflow up to READY (handoff takes it from there);
 * cancelling is the customer's decision (My Orders). */
export const allowedNext: Record<Order["orderStatus"], Order["orderStatus"][]> = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: [],
  COMPLETED: [],
  CANCELLED: [],
};

/** The queue order — active first (newest on top), then cancelled, then
 * completed, so a wave of cancellations can never bury the live queue. READY
 * orders live on the Ready for Handoff page and never appear here. */
export function filterOrders(orders: Order[], search: string, statusFilter: string): Order[] {
  const rank = (o: Order) => {
    if (o.orderStatus === "CANCELLED") return 1;
    if (o.orderStatus === "COMPLETED") return 2;
    return 0;
  };
  let list = [...orders]
    .filter((o) => o.orderStatus !== "READY")
    .sort((a, b) => {
      const byRank = rank(a) - rank(b);
      return byRank !== 0 ? byRank : b.createdAt.localeCompare(a.createdAt);
    });
  if (statusFilter !== "ALL") list = list.filter((o) => o.orderStatus === statusFilter);
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        displayCustomerName(o.customerName, o.channel).toLowerCase().includes(q) ||
        (o.customerContact ?? "").includes(q),
    );
  }
  return list;
}

/** Counts per status for the filter dropdown labels. */
export function statusCountsOf(orders: Order[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const o of orders) map[o.orderStatus] = (map[o.orderStatus] ?? 0) + 1;
  return map;
}
