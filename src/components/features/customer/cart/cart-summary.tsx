"use client";

import type { Product } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { formatCurrency } from "@/lib/utils";

/* The sticky order summary — line recap, total, checkout button. */
export function CartSummary({
  cartLines,
  cartTotal,
  onCheckout,
}: {
  cartLines: Array<{ product: Product; quantity: number; lineTotal: number }>;
  cartTotal: number;
  onCheckout: () => void;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-primary/10 bg-white p-5 shadow-card lg:sticky lg:top-24">
      <h2 className="font-display text-lg font-bold text-espresso">Order Summary</h2>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        {cartLines.map(({ product, quantity, lineTotal }) => (
          <div key={product.id} className="flex justify-between text-mocha">
            <span className="truncate pr-2">
              {quantity} × {product.name}
            </span>
            <span>{formatCurrency(lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-primary/10 pt-4">
        <div className="flex justify-between text-base">
          <span className="font-semibold text-espresso">Total</span>
          <span className="font-display text-xl font-bold text-primary">{formatCurrency(cartTotal)}</span>
        </div>
      </div>
      <Button size="lg" className="mt-5 w-full" onClick={onCheckout}>
        Proceed to Checkout
      </Button>
      <p className="mt-3 text-center text-[11px] text-mocha">Pickup or delivery options available at checkout.</p>
    </aside>
  );
}
