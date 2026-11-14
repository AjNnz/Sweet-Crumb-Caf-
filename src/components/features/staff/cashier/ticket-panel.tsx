"use client";

import { Button } from "@/components/common/ui/button";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/common/icons";
import { formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* The sticky right-hand ticket: line items with +/− steppers, the     */
/* running total, and the entry point to the payment modal. All state  */
/* and actions come in as props from the composition.                  */
/* ------------------------------------------------------------------ */

export function TicketPanel({
  items,
  total,
  onAdd,
  onClear,
  onPay,
}: {
  items: Array<{ product: { id: string; name: string; price: number }; quantity: number; lineTotal: number }>;
  total: number;
  onAdd: (productId: string, delta?: number) => void;
  onClear: () => void;
  onPay: () => void;
}) {
  return (
    <aside className="flex h-fit flex-col rounded-2xl border border-primary/10 bg-white shadow-card lg:sticky lg:top-6">
      <div className="flex items-center justify-between border-b border-primary/10 p-4">
        <h2 className="font-display text-lg font-bold text-espresso">Current Ticket</h2>
        {items.length ? (
          <button onClick={onClear} className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline">
            <TrashIcon className="h-3.5 w-3.5" /> Clear
          </button>
        ) : null}
      </div>

      <div className="max-h-80 overflow-y-auto p-3">
        {!items.length ? (
          <p className="py-10 text-center text-sm text-mocha">Tap products to add them to the ticket.</p>
        ) : (
          items.map(({ product, quantity, lineTotal }) => (
            <div key={product.id} className="flex items-center gap-2 rounded-xl p-2 hover:bg-cream">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md bg-latte hover:bg-accent"
                onClick={() => onAdd(product.id, -1)}
                aria-label="Remove one"
              >
                <MinusIcon className="h-3.5 w-3.5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-espresso">{product.name}</p>
                <p className="text-[10px] text-mocha">
                  {formatCurrency(product.price)} × {quantity} = {formatCurrency(lineTotal)}
                </p>
              </div>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md bg-latte hover:bg-accent"
                onClick={() => onAdd(product.id, 1)}
                aria-label="Add one"
              >
                <PlusIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-primary/10 p-4">
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold text-espresso">Total</span>
          <span className="font-display text-2xl font-bold text-primary">{formatCurrency(total)}</span>
        </div>
        <Button size="lg" className="mt-3 w-full" disabled={!items.length} onClick={onPay}>
          💵 Receive Payment
        </Button>
      </div>
    </aside>
  );
}
