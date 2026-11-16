"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import type { PaymentMethod } from "@/lib/types";
import { useToast } from "@/components/common/toast";

import { resolvePaymentMethod, grandTotalOf, validateCheckout } from "./aggregation";
import type { FulfillmentForm, FieldErrors } from "./types";
import { EmptyCartSection } from "./empty-cart-section";
import { ContactSection } from "./contact-section";
import { FulfillmentSection } from "./fulfillment-section";
import { PaymentSection } from "./payment-section";
import { SummarySection } from "./summary-section";

/* ------------------------------------------------------------------ */
/* Checkout — a thin COMPOSITION. The contact/fulfillment/payment      */
/* sections and the summary sidebar live in their own files; this file */
/* owns the form state and the submit action.                          */
/* ------------------------------------------------------------------ */
export default function CheckoutPage() {
  const { cartLines, cartTotal, currentUser, placeOnlineOrder } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  // Pre-fills from the signed-in account; guests type over it.
  const [form, setForm] = useState<FulfillmentForm>({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    contact: currentUser?.contact ?? "",
    mode: "PICKUP",
    address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH ON PICKUP");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isDelivery = form.mode === "DELIVERY";
  const method = resolvePaymentMethod(isDelivery, paymentMethod);
  const grandTotal = grandTotalOf(cartTotal, isDelivery);

  const onChange = (key: keyof FulfillmentForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (!cartLines.length) {
    return <EmptyCartSection />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCheckout(form);
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
          <ContactSection form={form} errors={errors} onChange={onChange} />

          {/* Pickup vs delivery */}
          <FulfillmentSection form={form} errors={errors} onChange={onChange} />

          {/* Payment */}
          <PaymentSection paymentMethod={paymentMethod} onSelect={setPaymentMethod} isDelivery={isDelivery} />
        </div>

        {/* Summary sidebar (submits the form) */}
        <SummarySection
          form={form}
          cartLines={cartLines}
          cartTotal={cartTotal}
          isDelivery={isDelivery}
          method={method}
          grandTotal={grandTotal}
          submitting={submitting}
        />
      </form>
    </main>
  );
}
