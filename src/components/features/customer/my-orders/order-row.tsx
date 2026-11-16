"use client";

import type { Order } from "@/lib/types";
import { Badge } from "@/components/common/ui/badge";
import { DELIVERY_STATUS_STYLES, ORDER_STATUS_STYLES, PAYMENT_STATUS_STYLES, cn, deliveryStageOf, formatCurrency, formatDateTime } from "@/lib/utils";

/* One row in the My Orders list — clicking it opens the detail modal. */
export function OrderRow({ order, onSelect }: { order: Order; onSelect: (order: Order) => void }) {
  const status = ORDER_STATUS_STYLES[order.orderStatus];
  const payment = PAYMENT_STATUS_STYLES[order.paymentStatus];
  const isDelivery = order.fulfillment?.mode === "DELIVERY";
  const stage = deliveryStageOf(order);
  const delivery = stage && order.orderStatus !== "COMPLETED" ? DELIVERY_STATUS_STYLES[stage] : null;

  return (
    <button
      onClick={() => onSelect(order)}
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
}
