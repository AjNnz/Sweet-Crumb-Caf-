"use client";

import { useState } from "react";

import { useStore } from "@/context/store";
import type { Order } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Modal } from "@/components/common/ui/modal";
import { Badge } from "@/components/common/ui/badge";
import { buttonClass } from "@/components/common/ui/button";
import {
  DELIVERY_STATUS_STYLES,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  cn,
  deliveryStageOf,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Order detail modal — full ticket breakdown plus the customer's own  */
/* cancel action (allowed until the cafe starts preparing). Owns the   */
/* two-step "are you sure" state locally; mounted only while an order  */
/* is selected, so it resets on every open.                            */
/* ------------------------------------------------------------------ */

export function OrderDetailModal({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { cancelOwnOrder } = useStore();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const confirmCancel = async () => {
    if (!order) return;
    const result = await cancelOwnOrder(order.id);
    if (!result.ok) {
      toast(result.error ?? "Could not cancel the order.", "error");
      return;
    }
    toast(`Order ${order.reference} cancelled.`);
    onClose();
  };

  return (
    <Modal open={!!order} onClose={onClose} title={order ? `Order ${order.reference}` : ""} wide>
      {order ? (
        <div className="flex flex-col gap-4 text-sm">
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("gap-1", ORDER_STATUS_STYLES[order.orderStatus].className)}>
              <span className={`h-2 w-2 rounded-full ${ORDER_STATUS_STYLES[order.orderStatus].dot}`} />
              {ORDER_STATUS_STYLES[order.orderStatus].label}
            </Badge>
            <Badge className={PAYMENT_STATUS_STYLES[order.paymentStatus].className}>
              {PAYMENT_STATUS_STYLES[order.paymentStatus].label}
            </Badge>
            <Badge className="bg-latte text-mocha">{order.channel}</Badge>
            {order.fulfillment?.mode === "DELIVERY" ? <DeliveryBadge order={order} /> : null}
          </div>
          <p className="text-mocha">
            Placed {formatDateTime(order.createdAt)} · {order.paymentMethod}
          </p>
          {/* Ticket */}
          <div className="rounded-xl bg-cream p-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between py-1">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            {order.deliveryFee ? (
              <div className="flex justify-between py-1 text-xs text-mocha">
                <span>Delivery fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between border-t border-primary/10 pt-2 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
          {order.fulfillment ? (
            <p className="text-xs text-mocha">
              {order.fulfillment.mode === "DELIVERY"
                ? `🛵 Delivering to: ${order.fulfillment.address ?? "—"}`
                : "🏬 Pickup at the counter"}{" "}
              {order.fulfillment.notes ? `· Notes: ${order.fulfillment.notes}` : ""}
            </p>
          ) : null}
          {/* Cancel (only before the kitchen starts) */}
          {order.orderStatus === "PENDING" || order.orderStatus === "CONFIRMED" ? (
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
              {!confirming ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-mocha">Changed your mind? You can cancel until the cafe starts preparing.</p>
                  <button className={buttonClass("danger", "sm")} onClick={() => setConfirming(true)}>
                    Cancel this order
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-red-700">
                    Cancel order {order.reference}? This can&apos;t be undone.
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
  );
}

/* The delivery progress badge (claimed → out for delivery → delivered). */
function DeliveryBadge({ order }: { order: Order }) {
  const stage = deliveryStageOf(order);
  if (!stage) return null;
  const delivery = DELIVERY_STATUS_STYLES[stage];
  return (
    <Badge className={cn("gap-1", delivery.className)}>
      <span className={`h-2 w-2 rounded-full ${delivery.dot}`} /> {delivery.emoji} {delivery.label}
    </Badge>
  );
}

