"use client";

import { useState } from "react";
import Link from "next/link";

import { useStore } from "@/context/store";
import type { User } from "@/lib/types";
import { isValidEmail } from "@/lib/utils";
import { Button } from "@/components/common/ui/button";
import { Field, Input } from "@/components/common/ui/input";
import { useToast } from "@/components/common/toast";

export default function SettingsPage() {
  const { currentUser, isHydrated } = useStore();

  // Wait for the persisted session to hydrate before judging auth state
  if (!isHydrated) return null;

  // Signed-in customers only (same client-side guard as my-orders)
  if (!currentUser || currentUser.role !== "CUSTOMER") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-5xl">⚙️</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Account settings</h1>
        <p className="mt-2 text-sm text-mocha">Sign in to manage your profile.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login?next=/settings" className="inline-block">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/menu" className="inline-block">
            <Button variant="outline" size="lg">
              Browse Menu
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return <SettingsForm key={currentUser.id} user={currentUser} />;
}

function SettingsForm({ user }: { user: User }) {
  const { updateOwnProfile } = useStore();
  const { toast } = useToast();

  // Seeded on mount — this component only renders once the session is loaded
  const [form, setForm] = useState({ name: user.name, email: user.email, contact: user.contact ?? "" });
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!isValidEmail(form.email)) errs.email = "Enter a valid email address.";
    if (passwords.next) {
      if (!passwords.current) errs.currentPassword = "Enter your current password to change it.";
      if (passwords.next.length < 6) errs.newPassword = "New password must be at least 6 characters.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Please fix the errors before saving.", "error");
      return;
    }

    setSaving(true);
    const result = await updateOwnProfile({
      name: form.name,
      email: form.email,
      contact: form.contact,
      currentPassword: passwords.current || undefined,
      newPassword: passwords.next || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      toast(result.error ?? "Could not save your changes.", "error");
      return;
    }
    setPasswords({ current: "", next: "" });
    toast("Profile updated.");
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-espresso">Account settings</h1>
      <p className="mt-2 text-sm text-mocha">Update your name, email or password.</p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-6" noValidate>
        {/* Profile */}
        <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-bold text-espresso">Profile</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Full name" error={errors.name}>
              <Input value={form.name} onChange={set("name")} placeholder="Juan Dela Cruz" />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input value={form.email} onChange={set("email")} type="email" placeholder="you@example.com" />
            </Field>
            <Field label="Contact number (optional)">
              <Input value={form.contact} onChange={set("contact")} placeholder="0917 000 0000" />
            </Field>
          </div>
        </section>

        {/* Password */}
        <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-bold text-espresso">Change password</h2>
          <p className="text-xs text-mocha">Leave blank to keep your current password.</p>
          <div className="mt-4 grid gap-4">
            <Field label="Current password" error={errors.currentPassword}>
              <Input
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                type="password"
                autoComplete="current-password"
              />
            </Field>
            <Field label="New password" error={errors.newPassword}>
              <Input
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                type="password"
                autoComplete="new-password"
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </main>
  );
}
