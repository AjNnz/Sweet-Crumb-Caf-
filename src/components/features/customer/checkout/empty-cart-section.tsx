"use client";

import Link from "next/link";

import { Button } from "@/components/common/ui/button";

/* The empty-cart state — nothing to check out. */
export function EmptyCartSection() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-6xl">🛒</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Nothing to check out</h1>
      <p className="mt-2 text-sm text-mocha">Your cart is empty.</p>
      <Link href="/menu" className="mt-6 inline-block">
        <Button size="lg">Browse the Menu</Button>
      </Link>
    </main>
  );
}
