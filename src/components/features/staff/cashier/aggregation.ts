import type { OrderItem, Product } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure cashier math — turns the {productId: qty} ticket into item     */
/* rows. No React in here; the screen calls it inside a useMemo.       */
/* ------------------------------------------------------------------ */

export type Receipt = {
  items: OrderItem[];
  total: number;
  amountReceived: number;
  change: number;
  reference: string;
};

/** Ticket map → priced line items (products may have vanished between renders). */
export function buildTicketItems(
  ticket: Record<string, number>,
  products: Product[],
): Array<{ product: Product; quantity: number; lineTotal: number }> {
  return Object.entries(ticket)
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      return { product, quantity, lineTotal: product.price * quantity };
    })
    .filter(Boolean) as Array<{ product: Product; quantity: number; lineTotal: number }>;
}

/** Sum of all priced line rows. */
export function ticketTotal(items: Array<{ lineTotal: number }>): number {
  return items.reduce((s, i) => s + i.lineTotal, 0);
}
