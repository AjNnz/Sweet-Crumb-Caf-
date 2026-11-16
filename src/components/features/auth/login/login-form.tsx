"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useStore } from "@/context/store";
import type { Role } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { Field, Input } from "@/components/common/ui/input";
import { EyeIcon, EyeOffIcon } from "@/components/common/icons";
import { isValidEmail } from "@/lib/utils";
import { roleHome } from "@/components/features/layout/auth-guard";
import { useToast } from "@/components/common/toast";
import { DemoAccounts } from "./demo-accounts";

/* ------------------------------------------------------------------ */
/* The sign-in card — email/password with the show-password toggle,    */
/* field errors and the server-side form error banner.                 */
/* ------------------------------------------------------------------ */

export function LoginForm() {
  const { login } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const next = params.get("next");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!isValidEmail(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // The server checks the bcrypt hash and sets the session cookie.
    const result = await login(email, password);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    const role = result.role as Role;
    toast(`Welcome back! Signed in as ${role.toLowerCase()}.`);
    router.push(next && next.startsWith("/") ? next : roleHome(role));
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white p-8 shadow-lift">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl shadow-md">
            ☕
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Welcome back</h1>
          <p className="mt-1 text-sm text-mocha">Sign in to your cafe account</p>
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
          {errors.form ? (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{errors.form}</p>
          ) : null}
          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-0 flex h-10 w-8 items-center justify-center text-mocha hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>
          <div className="-mt-1 flex justify-end">
            <Link href="/forgot-password" className="text-xs font-semibold text-secondary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" size="lg" className="mt-1">
            Sign In
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-mocha">
          New customer?{" "}
          <Link href="/register" className="font-semibold text-secondary hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-mocha">
          <Link href="/menu" className="font-medium text-espresso hover:underline">
            Continue as guest →
          </Link>
        </p>
      </div>

      {/* Demo account quick-fill */}
      <DemoAccounts
        onFill={(mail, pass) => {
          setEmail(mail);
          setPassword(pass);
          setErrors({});
        }}
      />
    </div>
  );
}
