"use client";

import type { CafeSettings, User } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { Field, Input } from "@/components/common/ui/input";

/* Cafe information — the editable public details. */
export function CafeInfoSection({
  form,
  dirty,
  onChange,
  onSave,
}: {
  form: CafeSettings;
  dirty: boolean;
  onChange: (patch: Partial<CafeSettings>) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <h2 className="font-display text-lg font-bold text-espresso">Cafe information</h2>
      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <Field label="Cafe name" className="sm:col-span-2">
          <Input value={form.cafeName} onChange={(e) => onChange({ cafeName: e.target.value })} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <Input value={form.address} onChange={(e) => onChange({ address: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => onChange({ phone: e.target.value })} />
        </Field>
        <Field label="Email">
          <Input value={form.email} onChange={(e) => onChange({ email: e.target.value })} />
        </Field>
        <Field label="Opening hours" className="sm:col-span-2">
          <Input value={form.openingHours} onChange={(e) => onChange({ openingHours: e.target.value })} />
        </Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onSave} disabled={!dirty}>
          {dirty ? "Save changes" : "Saved"}
        </Button>
      </div>
    </section>
  );
}

/* Profile — read-only summary of the signed-in account. */
export function ProfileSection({ user }: { user?: Partial<Pick<User, "name" | "email" | "role">> }) {
  const { name, email, role } = user ?? {};
  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <h2 className="font-display text-lg font-bold text-espresso">Profile</h2>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
          {name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </span>
        <div>
          <p className="font-semibold text-espresso">{name}</p>
          <p className="text-xs text-mocha">
            {email} · role {role}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-mocha">
        Profile editing and password changes will be handled by the backend account system in a later phase.
      </p>
    </section>
  );
}

/* System — the demo reset and logout entries. */
export function SystemSection({
  onReset,
  onLogout,
}: {
  onReset: () => void;
  onLogout: () => void;
}) {
  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <h2 className="font-display text-lg font-bold text-espresso">System</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-cream p-3">
          <div>
            <p className="font-medium text-espresso">Reset demo data</p>
            <p className="text-xs text-mocha">Restores the original products, inventory and 60 days of seed transactions.</p>
          </div>
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3">
          <div>
            <p className="font-medium text-espresso">Log out</p>
            <p className="text-xs text-mocha">End your admin session.</p>
          </div>
          <Button variant="danger" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </section>
  );
}
