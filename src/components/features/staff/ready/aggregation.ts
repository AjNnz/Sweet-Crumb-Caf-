import type { Order } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure handoff queue math — split READY orders into the pickup and    */
/* delivery lanes. No React in here.                                   */
/* ------------------------------------------------------------------ */

export function buildHandoffQueues(orders: Order[]) {
  const ready = orders.filter((o) => o.orderStatus === "READY").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    /** All READY orders, newest first. */
    ready,
    /** READY orders the customer collects at the counter. */
    pickup: ready.filter((o) => o.fulfillment?.mode !== "DELIVERY"),
    /** READY orders assigned to (or waiting for) a rider. */
    delivery: ready.filter((o) => o.fulfillment?.mode === "DELIVERY"),
  };
}
