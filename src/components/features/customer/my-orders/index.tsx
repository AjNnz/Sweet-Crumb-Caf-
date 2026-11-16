"use client";

import { useState } from "react";

import { useStore } from "@/context/store";
import type { Order } from "@/lib/types";

import { SignInSection, EmptyOrdersSection } from "./states";
import { OrderRow } from "./order-row";
import { OrderDetailModal } from "./order-detail-modal";

/* ------------------------------------------------------------------ */
/* My Orders — a thin COMPOSITION. The sign-in/empty states, the list  */
/* rows and the detail modal live in their own files; this file owns   */
/* which order (if any) is open.                                       */
/* ------------------------------------------------------------------ */
export default function MyOrdersPage() {
  const { myOrders, currentUser } = useStore();
  const [selected, setSelected] = useState<Order | null>(null);

  if (!currentUser) {
    return <SignInSection />;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-espresso">My Orders</h1>
      <p className="mt-1 text-sm text-mocha">Your current and previous orders.</p>

      {myOrders.length === 0 ? (
        <EmptyOrdersSection />
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {myOrders.map((order) => (
            <OrderRow key={order.id} order={order} onSelect={setSelected} />
          ))}
        </div>
      )}

      {/* Detail modal (owns its own cancel-confirm state) */}
      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
