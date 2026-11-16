"use client";

import { useState } from "react";
import Link from "next/link";

import { useStore } from "@/context/store";
import { isValidEmail } from "@/lib/utils";

import { EmailStep, ResetStep, DoneStep } from "./steps";

/* ------------------------------------------------------------------ */
/* Forgot password — a thin COMPOSITION. The three step cards live in  */
/* their own file; this file owns the step state and the two submits.  */
/* ------------------------------------------------------------------ */
export default function ForgotPasswordScreen() {
  const { resetPassword } = useStore();

  const [step, setStep] = useState<"email" | "reset" | "done">("email");
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
          {step === "email" ? <EmailStep email={email} onEmail={setEmail} error={error} onSubmit={sendLink} /> : null}
          {step === "reset" ? (
            <ResetStep
              email={email}
              password={password}
              onPassword={setPassword}
              confirm={confirm}
              onConfirm={setConfirm}
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(!showPassword)}
              error={error}
              onSubmit={submitReset}
            />
          ) : null}
          {step === "done" ? <DoneStep /> : null}

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
