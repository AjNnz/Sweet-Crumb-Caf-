import { isDeliveryJob } from "@/components/features/rider/delivery-card";
import { deliveryStageOf, toDateKey } from "@/lib/utils";
import type { Order } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure board math — splits all delivery jobs into the rider's lanes.  */
/* No React in here.                                                  */
/* ------------------------------------------------------------------ */

export function buildDeliveryQueues(orders: Order[], currentUserId?: string) {
  const jobs = orders.filter(isDeliveryJob).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Orders still moving through the kitchen / waiting to be handed over
  const open = jobs.filter((o) => o.orderStatus !== "COMPLETED");
  return {
    /** Every delivery job in the system (for the delivered-today stat). */
    jobs,
    /** Kitchen-marked READY and still unclaimed — the rider queue. */
    queued: open.filter((o) => deliveryStageOf(o) === "QUEUED"),
    /** Claimed by this rider and not yet delivered. */
    mine: open.filter(
      (o) => o.riderId === currentUserId && (deliveryStageOf(o) === "CLAIMED" || deliveryStageOf(o) === "OUT_FOR_DELIVERY"),
    ),
    /** Claimed by other riders. */
    withOthers: open.filter((o) => o.riderId && o.riderId !== currentUserId),
    /** Finished today — powers the "Delivered today" counter. */
    deliveredToday: jobs.filter((o) => {
      const today = toDateKey(new Date().toISOString());
      return o.deliveryStatus === "DELIVERED" && toDateKey(o.deliveredAt ?? "") === today;
    }),
  };
}
