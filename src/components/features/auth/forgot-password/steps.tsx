"use client";

import Link from "next/link";

import { Button } from "@/components/common/ui/button";
import { Field, Input } from "@/components/common/ui/input";
import { EyeIcon, EyeOffIcon } from "@/components/common/icons";

/* ------------------------------------------------------------------ */
/* The three steps of the forgot-password flow. Each renders inside    */
/* the shared white card; state lives in the composition (index).      */
/* ------------------------------------------------------------------ */

/* Step 1 — ask for the account email. */
export function EmailStep({ email, onEmail, error, onSubmit }: {
  email: string;
  onEmail: (v: string) => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl shadow-md">🔒</span>
        <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Forgot password?</h1>
        <p className="mt-1 text-sm text-mocha">Enter your account email and we&apos;ll send you a reset link.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <ErrorBanner message={error} />
        <Field label="Email">
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => onEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Button type="submit" size="lg" className="mt-1">
          Send reset link
        </Button>
      </form>
    </>
  );
}

/* Step 2 — set the new password (simulated email link). */
export function ResetStep({ email, password, onPassword, confirm, onConfirm, showPassword, onToggleShow, error, onSubmit }: {
  email: string;
  password: string;
  onPassword: (v: string) => void;
  confirm: string;
  onConfirm: (v: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl shadow-md">✉️</span>
        <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Check your inbox</h1>
        <p className="mt-1 text-sm text-mocha">
          We sent a password reset link to <span className="font-semibold text-espresso">{email}</span>.
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-latte px-4 py-3 text-xs leading-relaxed text-mocha">
        This is a front-end demo — no real email is sent. Set your new password below, as if you had opened the link.
      </div>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <ErrorBanner message={error} />
        <Field label="New password">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => onPassword(e.target.value)}
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={onToggleShow}
              className="absolute right-2 top-0 flex h-10 w-8 items-center justify-center text-mocha hover:text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>
        <Field label="Confirm new password">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => onConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1">
          Reset password
        </Button>
      </form>
    </>
  );
}

/* Step 3 — success note back to the sign-in page. */
export function DoneStep() {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl shadow-md">✅</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Password updated</h1>
      <p className="mt-1 text-sm text-mocha">Your password has been changed. Sign in with your new password.</p>
      <Link href="/login" className="mt-6 inline-block w-full">
        <Button size="lg" className="w-full">
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}

/* Shared red error banner. */
function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{message}</p>;
}
