"use client";

import type { FulfillmentForm, FieldErrors } from "./types";
import { DELIVERY_FEE } from "@/lib/types";
import { Field, Textarea } from "@/components/common/ui/input";
import { cn, formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Fulfillment section — pickup vs delivery cards, plus the delivery   */
/* address and order notes when delivery is selected.                  */
/* ------------------------------------------------------------------ */

export function FulfillmentSection({
  form,
  errors,
  onChange,
}: {
  form: FulfillmentForm;
  errors: FieldErrors;
  onChange: (key: keyof FulfillmentForm, value: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <h2 className="font-display text-lg font-bold text-espresso">Fulfillment</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {(["PICKUP", "DELIVERY"] as const).map((mode) => (
          <button
            type="button"
            key={mode}
            onClick={() => onChange("mode", mode)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
              form.mode === mode
                ? "border-primary bg-latte ring-2 ring-accent/50"
                : "border-primary/15 hover:bg-cream",
            )}
          >
            <span className="text-lg">{mode === "PICKUP" ? "🏬" : "🛵"}</span>
            <span className="text-sm font-semibold text-espresso">{mode === "PICKUP" ? "Store pickup" : "Delivery"}</span>
            <span className="text-[11px] text-mocha">
              {mode === "PICKUP" ? "Collect at the counter — free" : `To your door — ${formatCurrency(DELIVERY_FEE)} fee`}
            </span>
          </button>
        ))}
      </div>
      {form.mode === "DELIVERY" ? (
        <Field label="Delivery address" error={errors.address} className="mt-4">
          <Textarea value={form.address} onChange={(e) => onChange("address", e.target.value)} placeholder="Street, barangay, city…" className="min-h-16" />
        </Field>
      ) : null}
      <Field label="Order notes (optional)" className="mt-4">
        <Textarea value={form.notes} onChange={(e) => onChange("notes", e.target.value)} placeholder="e.g. less sweet, birthday candle…" className="min-h-16" />
      </Field>
    </section>
  );
}
