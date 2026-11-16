"use client";

import { Suspense } from "react";

import { LoginForm } from "./login-form";

/* ------------------------------------------------------------------ */
/* Login page — a thin COMPOSITION: the gradient backdrop plus the     */
/* sign-in card (with its demo-account quick-fill panel).              */
/* ------------------------------------------------------------------ */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-espresso px-4 py-10">
        <LoginForm />
      </div>
    </Suspense>
  );
}
