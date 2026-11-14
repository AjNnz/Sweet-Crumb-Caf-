import type { PaymentMethod } from "@/lib/types";
import { DELIVERY_FEE } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure checkout math — the payment choices and the price resolution.  */
/* No React in here.                                                  */
/* ------------------------------------------------------------------ */

export const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; hint: string }> = [
  { value: "CASH ON PICKUP", label: "Cash on Pickup", hint: "Pay cash when you collect your order" },
  { value: "GCASH", label: "GCash (simulated)", hint: "Simulated mobile wallet payment — no real charge" },
  { value: "CARD", label: "Card (simulated)", hint: "Simulated card payment — no real charge" },
];

/** COD for delivery orders is recorded as CASH ON DELIVERY. */
export function resolvePaymentMethod(isDelivery: boolean, paymentMethod: PaymentMethod): PaymentMethod {
  return isDelivery && paymentMethod === "CASH ON PICKUP" ? "CASH ON DELIVERY" : paymentMethod;
}

/** Cart total + delivery fee when applicable. */
export function grandTotalOf(cartTotal: number, isDelivery: boolean): number {
  return cartTotal + (isDelivery ? DELIVERY_FEE : 0);
}

/** Client-side checkout validation — returns per-field error strings. */
export function validateCheckout(form: { name: string; email: string; contact: string; mode: "PICKUP" | "DELIVERY"; address: string }): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!form.name.trim()) errs.name = "Name is required.";
  if (!form.email.trim()) errs.email = "Email is required for the order receipt.";
  else if (!isValidEmail(form.email)) errs.email = "Enter a valid email address.";
  if (!form.contact.trim()) errs.contact = "Contact number is required so we can reach you.";
  else if (!/^[0-9+\-\s()]{7,}$/.test(form.contact)) errs.contact = "Enter a valid contact number.";
  if (form.mode === "DELIVERY" && !form.address.trim()) errs.address = "Delivery address is required.";
  return errs;
}
