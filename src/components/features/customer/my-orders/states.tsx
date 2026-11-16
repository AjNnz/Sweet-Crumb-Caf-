"use client";

import Link from "next/link";

import { Button, buttonClass } from "@/components/common/ui/button";

/* Signed-out state — track orders requires an account. */
export function SignInSection() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-5xl">📋</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Track your orders</h1>
      <p className="mt-2 text-sm text-mocha">
        Sign in to see your order history — or check a single order using its reference link.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/login?next=/my-orders" className={buttonClass("primary", "lg")}>
          Sign In
        </Link>
        <Link href="/menu" className={buttonClass("outline", "lg")}>
          Browse Menu
        </Link>
      </div>
    </main>
  );
}

/* Empty state — nothing ordered yet. */
export function EmptyOrdersSection() {
  return (
    <div className="mt-10 rounded-3xl border border-primary/10 bg-white p-10 text-center shadow-card">
      <p className="text-5xl">🍩</p>
      <p className="mt-4 font-semibold text-espresso">No orders yet</p>
      <p className="mt-1 text-sm text-mocha">Your first order is waiting to happen.</p>
      <Link href="/menu" className="mt-5 inline-block">
        <Button>Order Now</Button>
      </Link>
    </div>
  );
}
