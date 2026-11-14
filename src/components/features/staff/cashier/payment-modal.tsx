"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import type { OrderItem, PaymentMethod, Product } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";
import { cn, formatCurrency } from "@/lib/utils";
import type { Receipt } from "./aggregation";

/* ------------------------------------------------------------------ */
/* Receive-payment modal. Owns the payment method + amount received    */
/* locally, so they reset every time it is mounted. The server         */
/* snapshots prices from the database and refuses short payments —     */
/* the receipt is built from the SAVED order.                          */
/* ------------------------------------------------------------------ */

type PricedRow = { product: Product; quantity: number; lineTotal: number };

export function PaymentModal({
  ticketItems,
  onClose,
  onSaved,
}: {
  ticketItems: PricedRow[];
  onClose: () => void;
  /** Called with the built receipt after a successful save. */
  onSaved: (receipt: Receipt) => void;
}) {
  const { createWalkInOrder } = useStore();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [amountReceived, setAmountReceived] = useState("");

  const total = useMemo(() => ticketItems.reduce((s, i) => s + i.lineTotal, 0), [ticketItems]);
  const received = Number(amountReceived) || 0;
  const change = received - total;
  const insufficient = received < total;

  const confirmPayment = async () => {
    if (insufficient) {
      toast("Amount received is not enough.", "error");
      return;
    }
    const items: OrderItem[] = ticketItems.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }));
    const result = await createWalkInOrder({ items, paymentMethod, amountReceived: received });
    if (!result.ok || !result.order) {
      toast(result.error ?? "Could not save the transaction.", "error");
      return;
    }
    onSaved({
      items,
      total: result.order.total,
      amountReceived: received,
      change: result.order.change ?? 0,
      reference: result.order.reference,
    });
  };

  return (
    <Modal open={true} onClose={onClose} title="Receive Payment">
      <div className="flex flex-col gap-4">
        {/* Amount due banner */}
        <div className="rounded-xl bg-cream p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-mocha">Amount due</p>
          <p className="font-display text-4xl font-bold text-primary">{formatCurrency(total)}</p>
        </div>

        {/* Payment method chooser */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-mocha">Payment method</p>
          <div className="grid grid-cols-3 gap-2">
            {(["CASH", "GCASH", "CARD"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                  paymentMethod === m
                    ? "border-primary bg-latte text-espresso ring-2 ring-accent/50"
                    : "border-primary/15 text-mocha hover:bg-cream",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === "CASH" ? (
          <>
            {/* Amount received + quick-cash buttons */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-mocha">Amount received</p>
              <Input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="0.00"
                className="text-center text-xl font-bold"
                autoFocus
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[total, 500, 1000].map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setAmountReceived(String(v))}
                    className="rounded-lg bg-latte px-3 py-1.5 text-xs font-semibold text-espresso hover:bg-accent"
                  >
                    {i === 0 ? "Exact" : formatCurrency(v)}
                  </button>
                ))}
              </div>
            </div>
            {/* Change calculator */}
            <div className={cn("rounded-xl p-3 text-center", insufficient ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700")}>
              <p className="text-xs font-semibold uppercase tracking-wide">Change</p>
              <p className="font-display text-2xl font-bold">{formatCurrency(Math.max(change, 0))}</p>
              {insufficient ? <p className="mt-1 text-xs font-medium">Still short by {formatCurrency(total - received)}</p> : null}
            </div>
          </>
        ) : (
          <p className="rounded-xl bg-sky-50 p-3 text-center text-xs text-sky-800">
            {paymentMethod} payment will be recorded as paid (simulated).
          </p>
        )}

        <Button size="lg" variant="success" disabled={paymentMethod === "CASH" && insufficient} onClick={confirmPayment}>
          ✓ Confirm Transaction
        </Button>
      </div>
    </Modal>
  );
}
