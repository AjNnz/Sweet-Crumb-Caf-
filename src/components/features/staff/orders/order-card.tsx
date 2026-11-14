"use client";

import { useState } from "react";

import { useStore } from "@/context/store";
import type { Order, OrderStatus } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Badge } from "@/components/common/ui/badge";
import { buttonClass } from "@/components/common/ui/button";
import { TrashIcon } from "@/components/common/icons";
import { PAYMENT_STATUS_STYLES, ORDER_STATUS_STYLES, cn, displayCustomerName, formatCurrency, formatDateTime } from "@/lib/utils";
import { allowedNext } from "./aggregation";

/* ------------------------------------------------------------------ */
/* One order card in the staff queue. Shows the ticket, the status     */
/* pill, a payment "Mark paid" shortcut and the next-step button.      */
/* The delete confirmation is local state — it lives inside the card.  */
/* ------------------------------------------------------------------ */

export function OrderCard({
  order,
  onAdvance,
}: {
  order: Order;
  /** Advance to the next status (called with the next status). */
  onAdvance: (orderId: string, status: OrderStatus) => void;
}) {
  const { updateOrderPayment, deleteOrder } = useStore();
  const { toast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const status = ORDER_STATUS_STYLES[order.orderStatus];
  const active = ["PENDING", "CONFIRMED", "PREPARING"].includes(order.orderStatus);
  const isDelivery = order.fulfillment?.mode === "DELIVERY";
  const next: OrderStatus | undefined = active ? allowedNext[order.orderStatus][0] : undefined;

  // Cancelled orders can be removed permanently (the DB also purges them a day later).
  const trash = async () => {
    const result = await deleteOrder(order.id);
    if (result.ok) toast(`Order ${order.reference} deleted.`);
    else toast(result.error ?? "Something went wrong.", "error");
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-white p-4 shadow-card",
        active ? "border-secondary/40 ring-1 ring-accent/30" : "border-primary/10",
        order.orderStatus === "CANCELLED" && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-espresso">{order.reference}</span>
        <Badge className={status.className}>
          <span className={`h-2 w-2 rounded-full ${status.dot}`} /> {status.label}
        </Badge>
      </div>
      <p className="mt-1 text-xs text-mocha">
        {order.channel} · {isDelivery ? "🛵 Delivery" : "🏬 Pickup"} · {formatDateTime(order.createdAt)}
      </p>
      <p className="mt-0.5 text-xs font-medium text-espresso">
        {displayCustomerName(order.customerName, order.channel)}
        {order.customerContact ? ` · ${order.customerContact}` : ""}
      </p>
      {isDelivery ? (
        <p className="mt-0.5 text-xs text-mocha">
          📍 {order.fulfillment?.address ?? "—"}
          {order.fulfillment?.notes ? ` · 📝 ${order.fulfillment.notes}` : ""}
        </p>
      ) : null}
      <div className="mt-2 flex-1 rounded-xl bg-cream p-2.5 text-xs">
        {order.items.map((i) => (
          <div key={i.productId} className="flex justify-between py-0.5">
            <span className="text-mocha">
              {i.quantity}× {i.name}
            </span>
            <span className="text-espresso">{formatCurrency(i.price * i.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge className={PAYMENT_STATUS_STYLES[order.paymentStatus].className}>
            {PAYMENT_STATUS_STYLES[order.paymentStatus].label}
          </Badge>
          {order.paymentStatus !== "PAID" && order.orderStatus !== "CANCELLED" ? (
            <button
              onClick={() => {
                updateOrderPayment(order.id, "PAID");
                toast("Payment recorded.");
              }}
              className="text-[10px] font-semibold text-secondary hover:underline"
            >
              Mark paid
            </button>
          ) : null}
        </div>
        <span className="font-display text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
      </div>
      <div className="mt-3 flex gap-2">
        {next ? (
          <button className={cn(buttonClass("success", "sm"), "flex-1")} onClick={() => onAdvance(order.id, next)}>
            → {ORDER_STATUS_STYLES[next].label}
          </button>
        ) : order.orderStatus === "CANCELLED" ? (
          confirmingDelete ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-xs">
              <span className="text-mocha">Delete permanently?</span>
              <button onClick={trash} className="font-semibold text-red-600 hover:underline">
                Yes, delete
              </button>
              <button onClick={() => setConfirmingDelete(false)} className="text-mocha hover:underline">
                Keep
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              title="Cancelled orders are removed automatically a day after cancellation"
              className={cn(buttonClass("ghost", "sm"), "flex-1 gap-1.5")}
            >
              <TrashIcon className="h-3.5 w-3.5" /> Delete order
            </button>
          )
        ) : (
          <p className="flex-1 text-center text-xs text-mocha">
            {order.orderStatus === "COMPLETED" ? "Order completed." : "No further status changes."}
          </p>
        )}
      </div>
    </div>
  );
}
