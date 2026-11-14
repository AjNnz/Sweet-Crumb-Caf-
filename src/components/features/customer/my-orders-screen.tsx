"use client";

import Link from "next/link";

import { useStore } from "@/context/store";
import { Button, buttonClass } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import {
  DELIVERY_STATUS_STYLES,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  cn,
  deliveryStageOf,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";
import { Modal } from "@/components/common/ui/modal";
import { useState } from "react";
import type { Order } from "@/lib/types";
import { useToast } from "@/components/common/toast";

export default function MyOrdersPage() {
  const { myOrders, currentUser, cancelOwnOrder } = useStore();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Order | null>(null);
  const [confirming, setConfirming] = useState(false);

  const closeModal = () => {
    setSelected(null);
    setConfirming(false);
  };

  const confirmCancel = async () => {
    if (!selected) return;
    const result = await cancelOwnOrder(selected.id);
    if (!result.ok) {
      toast(result.error ?? "Could not cancel the order.", "error");
      return;
    }
    toast(`Order ${selected.reference} cancelled.`);
    closeModal();
  };

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-5xl">📋</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Track your orders</h1>
        <p className="mt-2 text-sm text-mocha">
          Sign in to see your order history — or check a single order using its reference link.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login?next=/my-orders" className={buttonClass("primary", "lg")}>
            Sign In
          </Link>
          <Link href="/menu" className={buttonClass("outline", "lg")}>
            Browse Menu
          </Link>
        </div>
      </main>
    );
  }

  const onlineOrders = myOrders;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-espresso">My Orders</h1>
      <p className="mt-1 text-sm text-mocha">Your current and previous orders.</p>

      {onlineOrders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-primary/10 bg-white p-10 text-center shadow-card">
          <p className="text-5xl">🍩</p>
          <p className="mt-4 font-semibold text-espresso">No orders yet</p>
          <p className="mt-1 text-sm text-mocha">Your first order is waiting to happen.</p>
          <Link href="/menu" className="mt-5 inline-block">
            <Button>Order Now</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {onlineOrders.map((order) => {
            const status = ORDER_STATUS_STYLES[order.orderStatus];
            const payment = PAYMENT_STATUS_STYLES[order.paymentStatus];
            const isDelivery = order.fulfillment?.mode === "DELIVERY";
            const stage = deliveryStageOf(order);
            const delivery = stage && order.orderStatus !== "COMPLETED" ? DELIVERY_STATUS_STYLES[stage] : null;
            return (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/10 bg-white p-4 text-left shadow-card transition-all hover:shadow-lift sm:gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-latte text-xl">
                  {order.channel === "ONLINE" ? (isDelivery ? "🛵" : "🏬") : "🧾"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-espresso">{order.reference}</span>
                    <Badge className={status.className}>{status.label}</Badge>
                    <Badge className={payment.className}>{payment.label}</Badge>
                    {delivery && order.orderStatus !== "COMPLETED" ? (
                      <Badge className={cn("gap-1", delivery.className)}>
                        <span className={`h-2 w-2 rounded-full ${delivery.dot}`} /> {delivery.emoji} {delivery.label}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-mocha">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                  </p>
                  <p className="mt-0.5 text-xs text-mocha">
                    {isDelivery ? `Delivery to ${order.fulfillment?.address ?? "your address"}` : "Pickup at the counter"} ·{" "}
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <span className="font-display text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={closeModal}
        title={selected ? `Order ${selected.reference}` : ""}
        wide
      >
        {selected ? (
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("gap-1", ORDER_STATUS_STYLES[selected.orderStatus].className)}>
                <span className={`h-2 w-2 rounded-full ${ORDER_STATUS_STYLES[selected.orderStatus].dot}`} />
                {ORDER_STATUS_STYLES[selected.orderStatus].label}
              </Badge>
              <Badge className={PAYMENT_STATUS_STYLES[selected.paymentStatus].className}>
                {PAYMENT_STATUS_STYLES[selected.paymentStatus].label}
              </Badge>
              <Badge className="bg-latte text-mocha">{selected.channel}</Badge>
              {selected.fulfillment?.mode === "DELIVERY" ? (
                (() => {
                  const stage = deliveryStageOf(selected);
                  if (!stage) return null;
                  const delivery = DELIVERY_STATUS_STYLES[stage];
                  return (
                    <Badge className={cn("gap-1", delivery.className)}>
                      <span className={`h-2 w-2 rounded-full ${delivery.dot}`} /> {delivery.emoji} {delivery.label}
                    </Badge>
                  );
                })()
              ) : null}
            </div>
            <p className="text-mocha">
              Placed {formatDateTime(selected.createdAt)} · {selected.paymentMethod}
            </p>
            <div className="rounded-xl bg-cream p-3">
              {selected.items.map((item) => (
                <div key={item.productId} className="flex justify-between py-1">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              {selected.deliveryFee ? (
                <div className="flex justify-between py-1 text-xs text-mocha">
                  <span>Delivery fee</span>
                  <span>{formatCurrency(selected.deliveryFee)}</span>
                </div>
              ) : null}
              <div className="mt-2 flex justify-between border-t border-primary/10 pt-2 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(selected.total)}</span>
              </div>
            </div>
            {selected.fulfillment ? (
              <p className="text-xs text-mocha">
                {selected.fulfillment.mode === "DELIVERY"
                  ? `🛵 Delivering to: ${selected.fulfillment.address ?? "—"}`
                  : "🏬 Pickup at the counter"}{" "}
                {selected.fulfillment.notes ? `· Notes: ${selected.fulfillment.notes}` : ""}
              </p>
            ) : null}
            {selected.orderStatus === "PENDING" || selected.orderStatus === "CONFIRMED" ? (
              <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
                {!confirming ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-mocha">
                      Changed your mind? You can cancel until the cafe starts preparing.
                    </p>
                    <button className={buttonClass("danger", "sm")} onClick={() => setConfirming(true)}>
                      Cancel this order
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-red-700">
                      Cancel order {selected.reference}? This can&apos;t be undone.
                    </p>
                    <div className="flex gap-2">
                      <button className={buttonClass("danger", "sm")} onClick={confirmCancel}>
                        Yes, cancel my order
                      </button>
                      <button className={buttonClass("outline", "sm")} onClick={() => setConfirming(false)}>
                        Keep order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </main>
  );
}
