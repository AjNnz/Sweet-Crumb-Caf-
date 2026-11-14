import { Prisma } from "@prisma/client";

import { DELIVERY_FEE, ORDER_STATUS_FLOW } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Shared order helpers — used by the orders routes.                   */
/*                                                                     */
/* THE GOLDEN RULE: every rule the UI enforces is re-enforced here.    */
/* The browser is a suggestion; the server is the law.                 */
/* ------------------------------------------------------------------ */

type Tx = Prisma.TransactionClient;

export const PAYMENT_METHODS = ["CASH", "GCASH", "CARD", "CASH ON PICKUP", "CASH ON DELIVERY"] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "UNPAID", "REFUNDED"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Two-decimal money math — floats drift (0.1 + 0.2 ≠ 0.3). */
export function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Next ORD-XXXXXX reference, based on the highest existing one.
 * Awaited INSIDE the create transaction so two simultaneous checkouts
 * can never grab the same number. */
export async function nextReference(tx: Tx): Promise<string> {
  const last = await tx.order.findFirst({
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const seq = last ? parseInt(last.reference.slice(4), 10) + 1 : 1;
  return `ORD-${String(seq).padStart(6, "0")}`;
}

/**
 * The kitchen flow only moves one step at a time:
 * PENDING → CONFIRMED → PREPARING → READY → COMPLETED.
 * (Cancellation is NOT part of this ladder — customers cancel via a
 * dedicated action so the policy lives in exactly one place.)
 */
export function canAdvance(from: string, to: string): boolean {
  const i = ORDER_STATUS_FLOW.indexOf(from as (typeof ORDER_STATUS_FLOW)[number]);
  const j = ORDER_STATUS_FLOW.indexOf(to as (typeof ORDER_STATUS_FLOW)[number]);
  return i >= 0 && j === i + 1;
}

/** The one status an order may legally move to next (null when finished). */
export function nextStepOf(from: string): string | null {
  const i = ORDER_STATUS_FLOW.indexOf(from as (typeof ORDER_STATUS_FLOW)[number]);
  return i >= 0 && i + 1 < ORDER_STATUS_FLOW.length ? ORDER_STATUS_FLOW[i + 1] : null;
}

/** Validate a cart against recorded stock. Drinks (no inventory row) pass —
 * they're prepared to order. Returns the offending message or null. */
export async function stockProblem(
  tx: Tx,
  items: { productId: string; name: string; quantity: number }[],
): Promise<string | null> {
  for (const item of items) {
    const inv = await tx.inventoryItem.findUnique({ where: { productId: item.productId } });
    if (!inv) continue; // drink
    if (item.quantity > inv.quantity) {
      return `Only ${inv.quantity} left of ${item.name}.`;
    }
  }
  return null;
}

/**
 * Apply items to stock (direction −1 = deduct, +1 = restore) and write the
 * matching ledger movements. Quantity never goes below zero; the movement
 * records what ACTUALLY changed. Must run inside a transaction together
 * with the order update it belongs to.
 */
export async function applyStock(
  tx: Tx,
  items: { productId: string; quantity: number }[],
  direction: -1 | 1,
): Promise<void> {
  for (const item of items) {
    const inv = await tx.inventoryItem.findUnique({ where: { productId: item.productId } });
    if (!inv) continue; // drink
    const newQuantity = Math.max(0, inv.quantity + direction * item.quantity);
    const actual = Math.abs(newQuantity - inv.quantity);
    if (actual === 0) continue;
    await tx.inventoryItem.update({ where: { id: inv.id }, data: { quantity: newQuantity } });
    await tx.stockMovement.create({
      data: {
        inventoryItemId: inv.id,
        type: direction === -1 ? "SOLD" : "ADJUSTMENT",
        quantity: actual,
        note: direction === -1 ? "Sale" : "Order cancelled — stock restored",
      },
    });
  }
}

export const deliveryFeeFor = (mode: string): number => (mode === "DELIVERY" ? DELIVERY_FEE : 0);
