"use client";

import { useStore } from "@/context/store";
import { buttonClass } from "@/components/common/ui/button";
import { DeliveryCard } from "@/components/features/rider/delivery-card";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Lane 3 — jobs already claimed by other riders (read-only).          */
/* ------------------------------------------------------------------ */

export function OthersSection({ orders }: { orders: Order[] }) {
  const { users } = useStore();
  const riderName = (riderId?: string) => users.find((u) => u.id === riderId)?.name ?? "A rider";

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold text-espresso">👥 Handled by other riders</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {orders.map((order) => (
          <DeliveryCard
            key={order.id}
            order={order}
            actions={
              <span className={cn(buttonClass("ghost", "sm"), "pointer-events-none text-[11px]")}>
                {riderName(order.riderId)}
              </span>
            }
          />
        ))}
      </div>
    </section>
  );
}
