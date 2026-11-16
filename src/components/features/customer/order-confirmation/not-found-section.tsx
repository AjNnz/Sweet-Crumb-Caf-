"use client";

import Link from "next/link";

import { buttonClass } from "@/components/common/ui/button";

/* The "order not found" state — bad or missing ?ref= link. */
export function NotFoundSection({ ref: orderRef }: { ref: string | null }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-5xl">🧾</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Order not found</h1>
      <p className="mt-2 text-sm text-mocha">
        We couldn&apos;t find {orderRef ? <span className="font-semibold">{orderRef}</span> : "this order"}.
      </p>
      <Link href="/my-orders" className="mt-6 inline-block">
        <button className={buttonClass("primary", "md")}>View My Orders</button>
      </Link>
    </main>
  );
}
