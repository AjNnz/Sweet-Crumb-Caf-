"use client";

import { useMemo } from "react";

import { useStore } from "@/context/store";
import type { Order } from "@/lib/types";
import { useToast } from "@/components/common/toast";

import { buildHandoffQueues } from "./aggregation";
import { HandoffCard } from "./handoff-card";

/* ------------------------------------------------------------------ */
/* Ready for Handoff — a thin COMPOSITION. The card lives in its own   */
/* file; this file owns the two queues and the complete/mark-paid       */
/* actions.                                                            */
/*                                                                     */
/* The handoff counter: every order the kitchen marked READY lands     */
/* here — pickup waits to be collected, delivery travels with its      */
/* rider. Staff close the loop with "Completed".                       */
/* ------------------------------------------------------------------ */
export default function ReadyForHandoffPage() {
  const { orders, users, updateOrderStatus, updateOrderPayment } = useStore();
  const { toast } = useToast();

  const { ready, pickup, delivery } = useMemo(() => buildHandoffQueues(orders), [orders]);

  const complete = (order: Order) => {
    updateOrderStatus(order.id, "COMPLETED");
    toast(`Order ${order.reference} completed.`);
  };

  const markPaid = (order: Order) => {
    updateOrderPayment(order.id, "PAID");
    toast("Payment recorded.");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Ready for Handoff</h1>
        <p className="text-xs text-mocha">
          Orders the kitchen has finished. Hand 🏬 pickup orders over the counter; 🛵 delivery orders leave
          with their rider and can be completed once they&apos;re delivered.
        </p>
      </div>

      {!ready.length ? (
        <p className="rounded-2xl border border-dashed border-primary/20 bg-white/60 p-10 text-center text-sm text-mocha">
          Nothing is waiting for handoff right now. Orders appear here the moment the kitchen marks them ready.
        </p>
      ) : (
        <>
          {/* Pickup lane */}
          {pickup.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-bold text-espresso">🏬 Ready for pickup ({pickup.length})</h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {pickup.map((order) => (
                  <HandoffCard key={order.id} order={order} users={users} onComplete={complete} onMarkPaid={markPaid} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Delivery lane */}
          {delivery.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-bold text-espresso">🛵 With riders ({delivery.length})</h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {delivery.map((order) => (
                  <HandoffCard key={order.id} order={order} users={users} onComplete={complete} onMarkPaid={markPaid} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
