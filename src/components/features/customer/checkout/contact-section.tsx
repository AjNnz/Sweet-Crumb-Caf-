"use client";

import type { FieldErrors, FulfillmentForm } from "./types";
import { Field, Input } from "@/components/common/ui/input";

/* ------------------------------------------------------------------ */
/* Contact section — name, email, phone. All values and errors flow    */
/* in as props; the composition owns the form state.                   */
/* ------------------------------------------------------------------ */

export function ContactSection({ form, errors, onChange }: { form: FulfillmentForm; errors: FieldErrors; onChange: (key: keyof FulfillmentForm, value: string) => void }) {
  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <h2 className="font-display text-lg font-bold text-espresso">Contact details</h2>
      <p className="text-xs text-mocha">Guest orders are welcome — no account needed.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name}>
          <Input value={form.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Juan Dela Cruz" />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Contact number" error={errors.contact} className="sm:col-span-2">
          <Input value={form.contact} onChange={(e) => onChange("contact", e.target.value)} placeholder="0917 000 0000" />
        </Field>
      </div>
    </section>
  );
}
