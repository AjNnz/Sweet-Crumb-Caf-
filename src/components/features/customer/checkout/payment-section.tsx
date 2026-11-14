"use client";

import type { PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Payment section — the three simulated payment choices, with the     */
/* cash option relabelled for delivery (Cash on Delivery).             */
/* ------------------------------------------------------------------ */

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; hint: string }> = [
  { value: "CASH ON PICKUP", label: "Cash on Pickup", hint: "Pay cash when you collect your order" },
  { value: "GCASH", label: "GCash (simulated)", hint: "Simulated mobile wallet payment — no real charge" },
  { value: "CARD", label: "Card (simulated)", hint: "Simulated card payment — no real charge" },
];

export function PaymentSection({
  paymentMethod,
  onSelect,
  isDelivery,
}: {
  paymentMethod: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  isDelivery: boolean;
}) {
  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <h2 className="font-display text-lg font-bold text-espresso">Payment method</h2>
      <p className="text-xs text-mocha">Simulated payments — no real gateway is used.</p>
      <div className="mt-4 flex flex-col gap-2.5">
        {PAYMENT_METHODS.map((m) => {
          const cashLabel = isDelivery ? "Cash on Delivery" : m.label;
          const cashHint = isDelivery
            ? "Pay our rider in cash when your order arrives"
            : m.hint;
          return (
            <label
              key={m.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors",
                paymentMethod === m.value
                  ? "border-primary bg-latte ring-2 ring-accent/50"
                  : "border-primary/15 hover:bg-cream",
              )}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === m.value}
                onChange={() => onSelect(m.value)}
                className="h-4 w-4 accent-[#5C4033]"
              />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-espresso">
                  {m.value === "CASH ON PICKUP" ? cashLabel : m.label}
                </span>
                <span className="block text-[11px] text-mocha">
                  {m.value === "CASH ON PICKUP" ? cashHint : m.hint}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
