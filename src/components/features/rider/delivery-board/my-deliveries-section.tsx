"use client";

import { useStore } from "@/context/store";
import { Button } from "@/components/common/ui/button";
import { DeliveryCard } from "@/components/features/rider/delivery-card";
import type { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useDeliveryRun } from "./use-delivery-run";

/* ------------------------------------------------------------------ */
/* Lane 2 — this rider's active deliveries: start / release / mark     */
/* delivered, with the COD collection hint.                            */
/* ------------------------------------------------------------------ */

export function MyDeliveriesSection({ orders }: { orders: Order[] }) {
  const { startDelivery, completeDelivery, releaseDeliveryOrder, deliveryStatusOf } = useStore();
  const { busy, run } = useDeliveryRun();

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold text-espresso">🧾 My active deliveries</h2>
      {orders.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-primary/20 bg-white/60 p-6 text-center text-sm text-mocha">
          Nothing on your handlebars yet — claim a delivery above.
        </p>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {orders.map((order) => {
            const status = deliveryStatusOf(order);
            return (
              <DeliveryCard
                key={order.id}
                order={order}
                actions={
                  <div className="flex flex-col items-end gap-2">
                    {status === "CLAIMED" ? (
                      <>
                        {/* Picked up → out for delivery; can back out to the queue */}
                        <Button
                          size="sm"
                          disabled={busy === order.id}
                          onClick={() => run(order.id, () => startDelivery(order.id), `${order.reference} is out for delivery!`)}
                        >
                          Start delivery
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => run(order.id, () => releaseDeliveryOrder(order.id), `${order.reference} released back to the queue.`)}
                        >
                          Release
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* CASH ON DELIVERY must be collected in person */}
                        <Button
                          size="sm"
                          disabled={busy === order.id}
                          onClick={() =>
                            run(
                              order.id,
                              () => completeDelivery(order.id),
                              order.paymentMethod === "CASH ON DELIVERY"
                                ? `${order.reference} delivered — collected ${formatCurrency(order.total)}.`
                                : `${order.reference} delivered. 🎉`,
                            )
                          }
                        >
                          Mark delivered
                        </Button>
                        <p className="text-[10px] text-mocha">
                          {order.paymentMethod === "CASH ON DELIVERY"
                            ? `Collect ${formatCurrency(order.total)} from the customer`
                            : "Already paid online"}
                        </p>
                      </>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
