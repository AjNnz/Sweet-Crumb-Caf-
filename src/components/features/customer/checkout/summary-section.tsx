"use client";

import type { FulfillmentForm } from "./types";
import { DELIVERY_FEE } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Summary sidebar — the cart lines, the subtotal/delivery/total       */
/* breakdown and the submit button.                                    */
/* ------------------------------------------------------------------ */

export function SummarySection({
  form,
  cartLines,
  cartTotal,
  isDelivery,
  method,
  grandTotal,
  submitting,
}: {
  form: FulfillmentForm;
  cartLines: Array<{ product: { id: string; name: string }; quantity: number; lineTotal: number }>;
  cartTotal: number;
  isDelivery: boolean;
  method: string;
  grandTotal: number;
  submitting: boolean;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-primary/10 bg-white p-5 shadow-card lg:sticky lg:top-24">
      <h2 className="font-display text-lg font-bold text-espresso">Your order</h2>
      <div className="mt-4 flex flex-col gap-2.5 text-sm">
        {cartLines.map(({ product, quantity, lineTotal }) => (
          <div key={product.id} className="flex justify-between gap-2">
            <span className="text-mocha">
              <span className="font-semibold text-espresso">{quantity}×</span> {product.name}
            </span>
            <span className="shrink-0">{formatCurrency(lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-primary/10 pt-4">
        <div className="flex justify-between text-sm text-mocha">
          <span>Subtotal</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
        <div className="mt-1.5 flex justify-between text-sm text-mocha">
          <span>Delivery</span>
          <span>{isDelivery ? formatCurrency(DELIVERY_FEE) : "Free (pickup)"}</span>
        </div>
        {isDelivery ? (
          <p className="mt-1.5 text-[11px] text-mocha">🛵 Our rider will bring it to {form.address || "your address"} — within Cordova, Cebu.</p>
        ) : null}
        <div className="mt-3 flex justify-between text-base">
          <span className="font-semibold text-espresso">
            Total{isDelivery && method === "CASH ON DELIVERY" ? " (pay on delivery)" : ""}
          </span>
          <span className="font-display text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
      <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
        {submitting ? "Placing order…" : "Place Order"}
      </Button>
      <p className="mt-3 text-center text-[11px] text-mocha">
        You&apos;ll receive an order reference after placing the order.
      </p>
    </aside>
  );
}
