"use client";

import type { Order, User } from "@/lib/types";
import { Badge } from "@/components/common/ui/badge";
import { buttonClass } from "@/components/common/ui/button";
import { PAYMENT_STATUS_STYLES, ORDER_STATUS_STYLES, cn, deliveryStageOf, displayCustomerName, formatCurrency, formatDateTime } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* One handoff card. Shows the ticket, who is involved, and the        */
/* staff actions: mark paid + complete (pickup anytime; delivery only  */
/* once the rider has handed it over).                                 */
/* ------------------------------------------------------------------ */

export function HandoffCard({
  order,
  users,
  onComplete,
  onMarkPaid,
}: {
  order: Order;
  users: User[];
  onComplete: (order: Order) => void;
  onMarkPaid: (order: Order) => void;
}) {
  const isDelivery = order.fulfillment?.mode === "DELIVERY";
  const stage = isDelivery ? deliveryStageOf(order) : null;
  const riderName = users.find((u) => u.id === order.riderId)?.name ?? "a rider";
  const status = ORDER_STATUS_STYLES[order.orderStatus];
  // Delivery orders can only be completed once the rider has handed them over.
  const canComplete = !stage || stage === "DELIVERED";

  return (
    <div className="flex flex-col rounded-2xl border border-secondary/40 bg-white p-4 shadow-card ring-1 ring-accent/30">
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
      {!stage || stage === "DELIVERED" ? (
        <p className="mt-2 text-xs text-mocha">
          {stage ? `✅ Delivered by ${riderName}` : "🏬 Customer will collect at the counter"}
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge className={PAYMENT_STATUS_STYLES[order.paymentStatus].className}>
            {PAYMENT_STATUS_STYLES[order.paymentStatus].label}
          </Badge>
          {order.paymentStatus !== "PAID" ? (
            <button onClick={() => onMarkPaid(order)} className="text-[10px] font-semibold text-secondary hover:underline">
              Mark paid
            </button>
          ) : null}
        </div>
        <span className="font-display text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
      </div>
      <div className="mt-3 flex gap-2">
        {canComplete ? (
          <button className={cn(buttonClass("success", "sm"), "flex-1")} onClick={() => onComplete(order)}>
            → Completed
          </button>
        ) : (
          <p className="flex-1 text-center text-xs font-medium text-mocha">
            {stage === "QUEUED"
              ? "⏳ Waiting for a rider to claim…"
              : stage === "CLAIMED"
                ? `🛵 ${riderName} accepted the delivery`
                : `🛵 Out for delivery — ${riderName}`}
          </p>
        )}
      </div>
    </div>
  );
}
