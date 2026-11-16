import type { Order } from "@/lib/types";
import { deliveryStageOf, displayCustomerName, formatDateTime } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Pure receipt math — the meta rows and subtotal for the paper.       */
/* No React in here.                                                   */
/* ------------------------------------------------------------------ */

export type ReceiptMeta = Array<[string, string]>;

/** The DATE/REF/ADDRESS/TEL rows (plus DELIVER TO for delivery orders). */
export function buildReceiptMeta(order: Order, settings: { address: string; phone: string }): ReceiptMeta {
  const isDelivery = order.fulfillment?.mode === "DELIVERY";
  const meta: ReceiptMeta = [
    ["DATE", formatDateTime(order.createdAt)],
    ["REF NO", order.reference],
    ["ADDRESS", settings.address],
    ["TEL", settings.phone],
  ];
  if (isDelivery) {
    meta.push([
      "DELIVER TO",
      `${order.fulfillment?.address ?? ""}${order.fulfillment?.notes ? ` · ${order.fulfillment.notes}` : ""}`,
    ]);
  }
  return meta;
}

/** Line total before the delivery fee. */
export function subtotalOf(order: Order): number {
  return order.total - (order.deliveryFee ?? 0);
}

/** Whether this confirmation shows the delivery-handoff status. */
export function deliveryStatusOfOrder(order: Order) {
  const isDelivery = order.fulfillment?.mode === "DELIVERY";
  const stage = isDelivery ? deliveryStageOf(order) : null;
  return {
    guestName: displayCustomerName(order.customerName, order.channel),
    isDelivery,
    stage,
  };
}
