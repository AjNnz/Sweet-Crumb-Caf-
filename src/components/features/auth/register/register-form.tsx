"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import { Button } from "@/components/common/ui/button";
import { Field, Input } from "@/components/common/ui/input";
import { isValidEmail } from "@/lib/utils";
import { useToast } from "@/components/common/toast";

/* ------------------------------------------------------------------ */
/* The customer sign-up card — profile fields, password + confirm,     */
/* with the duplicate-email error surfacing on the email field.        */
/* ------------------------------------------------------------------ */

export function RegisterForm() {
  const { registerCustomer } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", contact: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!isValidEmail(form.email)) errs.email = "Enter a valid email address.";
    if (form.contact && !/^[0-9+\-\s()]{7,}$/.test(form.contact)) errs.contact = "Enter a valid contact number.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const result = await registerCustomer({
      name: form.name,
      email: form.email,
      password: form.password,
      contact: form.contact || undefined,
    });
    if (!result.ok) {
      if (result.error) setErrors({ email: result.error });
      return;
    }
    toast("Account created! Welcome to the cafe.");
    router.push("/menu");
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lift">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl shadow-md">
          🧁
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Create your account</h1>
        <p className="mt-1 text-sm text-mocha">Faster checkout and your own order history</p>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        <Field label="Full name" error={errors.name}>
          <Input placeholder="Juan Dela Cruz" value={form.name} onChange={set("name")} autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} autoComplete="email" />
        </Field>
        <Field label="Contact number (optional)" error={errors.contact}>
          <Input placeholder="0917 000 0000" value={form.contact} onChange={set("contact")} autoComplete="tel" />
        </Field>
        <Field label="Password" error={errors.password}>
          <Input type="password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <Input type="password" placeholder="Repeat password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
        </Field>
        <Button type="submit" size="lg" className="mt-1">
          Create Account
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-mocha">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-secondary hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-mocha">
        <Link href="/menu" className="font-medium text-espresso hover:underline">
          Continue browsing as guest →
        </Link>
      </p>
    </div>
  );
}
