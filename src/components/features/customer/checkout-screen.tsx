"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import type { PaymentMethod } from "@/lib/types";
import { DELIVERY_FEE } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { Field, Input, Textarea } from "@/components/common/ui/input";
import { formatCurrency, isValidEmail } from "@/lib/utils";
import { useToast } from "@/components/common/toast";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; hint: string }> = [
  { value: "CASH ON PICKUP", label: "Cash on Pickup", hint: "Pay cash when you collect your order" },
  { value: "GCASH", label: "GCash (simulated)", hint: "Simulated mobile wallet payment — no real charge" },
  { value: "CARD", label: "Card (simulated)", hint: "Simulated card payment — no real charge" },
];

export default function CheckoutPage() {
  const { cartLines, cartTotal, currentUser, placeOnlineOrder } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    contact: currentUser?.contact ?? "",
    mode: "PICKUP" as "PICKUP" | "DELIVERY",
    address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH ON PICKUP");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isDelivery = form.mode === "DELIVERY";
  // COD for delivery orders is recorded as CASH ON DELIVERY
  const method = isDelivery && paymentMethod === "CASH ON PICKUP" ? "CASH ON DELIVERY" : paymentMethod;
  const grandTotal = cartTotal + (isDelivery ? DELIVERY_FEE : 0);

  if (!cartLines.length) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Nothing to check out</h1>
        <p className="mt-2 text-sm text-mocha">Your cart is empty.</p>
        <Link href="/menu" className="mt-6 inline-block">
          <Button size="lg">Browse the Menu</Button>
        </Link>
      </main>
    );
  }

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required for the order receipt.";
    else if (!isValidEmail(form.email)) errs.email = "Enter a valid email address.";
    if (!form.contact.trim()) errs.contact = "Contact number is required so we can reach you.";
    else if (!/^[0-9+\-\s()]{7,}$/.test(form.contact)) errs.contact = "Enter a valid contact number.";
    if (form.mode === "DELIVERY" && !form.address.trim()) errs.address = "Delivery address is required.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Please fix the errors before placing the order.", "error");
      return;
    }

    setSubmitting(true);
    const result = await placeOnlineOrder({
      customerName: form.name.trim(),
      customerContact: form.contact.trim(),
      paymentMethod: method,
      fulfillment: { mode: form.mode, address: form.address || undefined, notes: form.notes || undefined },
    });
    if (!result.ok || !result.order) {
      setSubmitting(false);
      toast(result.error ?? "Could not place the order.", "error");
      return;
    }
    toast(`Order placed! Reference ${result.order.reference}.`);
    router.push(`/order-confirmation?ref=${result.order.reference}`);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-espresso">Checkout</h1>

      <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]" noValidate>
        <div className="flex flex-col gap-6">
          {/* Contact */}
          <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-espresso">Contact details</h2>
            <p className="text-xs text-mocha">Guest orders are welcome — no account needed.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <Input value={form.name} onChange={set("name")} placeholder="Juan Dela Cruz" />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input value={form.email} onChange={set("email")} placeholder="you@example.com" />
              </Field>
              <Field label="Contact number" error={errors.contact} className="sm:col-span-2">
                <Input value={form.contact} onChange={set("contact")} placeholder="0917 000 0000" />
              </Field>
            </div>
          </section>

          {/* Fulfillment */}
          <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-espresso">Fulfillment</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["PICKUP", "DELIVERY"] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setForm((f) => ({ ...f, mode }))}
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
                <Textarea value={form.address} onChange={set("address")} placeholder="Street, barangay, city…" className="min-h-16" />
              </Field>
            ) : null}
            <Field label="Order notes (optional)" className="mt-4">
              <Textarea value={form.notes} onChange={set("notes")} placeholder="e.g. less sweet, birthday candle…" className="min-h-16" />
            </Field>
          </section>

          {/* Payment */}
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
                      onChange={() => setPaymentMethod(m.value)}
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
        </div>

        {/* Summary */}
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
      </form>
    </main>
  );
}
