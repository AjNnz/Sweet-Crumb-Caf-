"use client";

import Link from "next/link";

import { PRODUCT_CATEGORIES } from "@/lib/types";
import { CATEGORY_EMOJI } from "./aggregation";

/* The category cards linking into /menu?category=… */
export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-espresso sm:text-3xl">Browse the bakery</h2>
          <p className="mt-1 text-sm text-mocha">Everything is baked fresh each morning.</p>
        </div>
        <Link href="/menu" className="text-sm font-semibold text-secondary hover:underline">
          View full menu →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {PRODUCT_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/menu?category=${encodeURIComponent(c)}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-primary/10 bg-white p-6 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="text-4xl transition-transform group-hover:scale-110">{CATEGORY_EMOJI[c]}</span>
            <span className="text-sm font-semibold text-espresso">{c}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
