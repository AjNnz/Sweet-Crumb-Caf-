"use client";

import { useStore } from "@/context/store";
import { Badge } from "@/components/common/ui/badge";
import {
  DELIVERY_STATUS_STYLES,
  ORDER_STATUS_STYLES,
  cn,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";
import type { Order } from "@/lib/types";

/** An order the rider side cares about = a DELIVERY online order that is not cancelled. */
export function isDeliveryJob(order: Order) {
  return order.fulfillment?.mode === "DELIVERY" && order.orderStatus !== "CANCELLED";
}

export function DeliveryCard({ order, actions }: { order: Order; actions: React.ReactNode }) {
  const { deliveryStatusOf } = useStore();
  const status = DELIVERY_STATUS_STYLES[deliveryStatusOf(order)];
  const payLater = order.paymentMethod === "CASH ON DELIVERY" && order.paymentStatus !== "PAID";

  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold text-primary">{order.reference}</p>
          <p className="text-xs text-mocha">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge className={cn("gap-1", status.className)}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} /> {status.label}
          </Badge>
          {payLater ? <Badge className="bg-amber-100 text-amber-800">Collect ₱ on delivery</Badge> : null}
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5">👤</span>
          <div>
            <p className="font-semibold text-espresso">{order.customerName}</p>
            <p className="text-xs text-mocha">{order.customerContact ?? "No contact number"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-0.5">📍</span>
          <p className="text-xs text-mocha">{order.fulfillment?.address ?? "—"}</p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-cream p-3 text-sm">
        {order.items.map((item) => (
          <div key={item.productId} className="flex justify-between py-0.5">
            <span className="text-mocha">
              <span className="font-semibold text-espresso">{item.quantity}×</span> {item.name}
            </span>
            <span className="text-mocha">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
        {order.deliveryFee ? (
          <div className="flex justify-between py-0.5 text-xs text-mocha">
            <span>Delivery fee</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
        ) : null}
        <div className="mt-1.5 flex justify-between border-t border-primary/10 pt-1.5 font-semibold">
          <span>{payLater ? "Collect on delivery" : "Prepaid"}</span>
          <span className="font-display text-primary">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-mocha">
          {order.orderStatus === "READY"
            ? "Kitchen says it's ready for pickup 🎂"
            : order.orderStatus === "PENDING"
              ? "Waiting for the café to confirm"
              : ORDER_STATUS_STYLES[order.orderStatus].label + " at the café"}
        </p>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
