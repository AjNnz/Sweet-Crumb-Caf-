"use client";

import { RegisterForm } from "./register-form";

/* ------------------------------------------------------------------ */
/* Register — a thin COMPOSITION: the gradient backdrop plus the       */
/* sign-up card.                                                       */
/* ------------------------------------------------------------------ */
export default function RegisterPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-espresso px-4 py-10">
      <RegisterForm />
    </div>
  );
}
