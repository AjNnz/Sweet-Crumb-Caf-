"use client";

import { useStore } from "@/context/store";
import { Button } from "@/components/common/ui/button";
import { DeliveryCard } from "@/components/features/rider/delivery-card";
import type { Order } from "@/lib/types";
import { useDeliveryRun } from "./use-delivery-run";

/* ------------------------------------------------------------------ */
/* Lane 1 — unclaimed deliveries the kitchen has marked ready.         */
/* ------------------------------------------------------------------ */

export function QueuedSection({ orders }: { orders: Order[] }) {
  const { claimDeliveryOrder } = useStore();
  const { busy, run } = useDeliveryRun();

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold text-espresso">🛵 Waiting for a rider</h2>
      <p className="text-xs text-mocha">Food that&apos;s ready at the café — claim one and pick it up.</p>
      {orders.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-primary/20 bg-white/60 p-6 text-center text-sm text-mocha">
          No deliveries waiting. Orders appear here once the kitchen marks them ready.
        </p>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              actions={
                <Button
                  size="sm"
                  disabled={busy === order.id}
                  onClick={() => run(order.id, () => claimDeliveryOrder(order.id), `You claimed ${order.reference}.`)}
                >
                  Claim delivery
                </Button>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
