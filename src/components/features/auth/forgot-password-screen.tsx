"use client";

import { useState } from "react";
import Link from "next/link";

import { useStore } from "@/context/store";
import { Button } from "@/components/common/ui/button";
import { Field, Input } from "@/components/common/ui/input";
import { EyeIcon, EyeOffIcon } from "@/components/common/icons";
import { isValidEmail } from "@/lib/utils";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useStore();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // The server is the authority on whether the email exists — no client-side
  // directory check (visitors don't have the account list anymore).
  const sendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email.trim().toLowerCase())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStep("reset");
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const result = await resetPassword(email, password);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setError("");
    setStep("done");
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-espresso px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-lift">
          {step === "email" ? (
            <>
              <div className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl shadow-md">
                  🔒
                </span>
                <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Forgot password?</h1>
                <p className="mt-1 text-sm text-mocha">
                  Enter your account email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={sendLink} className="mt-6 flex flex-col gap-4" noValidate>
                {error ? (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{error}</p>
                ) : null}
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <Button type="submit" size="lg" className="mt-1">
                  Send reset link
                </Button>
              </form>
            </>
          ) : null}

          {step === "reset" ? (
            <>
              <div className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl shadow-md">
                  ✉️
                </span>
                <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Check your inbox</h1>
                <p className="mt-1 text-sm text-mocha">
                  We sent a password reset link to <span className="font-semibold text-espresso">{email}</span>.
                </p>
              </div>

              <div className="mt-5 rounded-xl bg-latte px-4 py-3 text-xs leading-relaxed text-mocha">
                This is a front-end demo — no real email is sent. Set your new password below, as if you had
                opened the link.
              </div>

              <form onSubmit={submitReset} className="mt-5 flex flex-col gap-4" noValidate>
                {error ? (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{error}</p>
                ) : null}
                <Field label="New password">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
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
                <Field label="Confirm new password">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
                <Button type="submit" size="lg" className="mt-1">
                  Reset password
                </Button>
              </form>
            </>
          ) : null}

          {step === "done" ? (
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl shadow-md">
                ✅
              </span>
              <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Password updated</h1>
              <p className="mt-1 text-sm text-mocha">
                Your password has been changed. Sign in with your new password.
              </p>
              <Link href="/login" className="mt-6 inline-block w-full">
                <Button size="lg" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : null}

          <p className="mt-5 text-center text-sm text-mocha">
            <Link href="/login" className="font-medium text-espresso hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
