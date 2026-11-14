"use client";

import Link from "next/link";

import { useStore } from "@/context/store";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import { buttonClass } from "@/components/common/ui/button";
import { ProductCard } from "@/components/features/customer/product-card";
import { LocationIcon, PhoneIcon } from "@/components/common/icons";

const CATEGORY_EMOJI: Record<string, string> = {
  Cupcakes: "🧁",
  Cakes: "🍰",
  Pastries: "🥐",
  Coffee: "☕",
  "Other Drinks": "🥤",
};

export default function LandingPage() {
  const { products, settings } = useStore();
  const featured = products.filter((p) => p.available && !p.archived).slice(0, 8);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-espresso text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Bake-fresh daily · Est. 2026
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Life is short.{" "}
              <span className="text-accent">Eat the cupcake.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-latte/90">
              Welcome to {settings.cafeName} — cupcakes, cakes, pastries and
              freshly-brewed coffee, baked in small batches every morning. Order
              online for pickup, or drop by and say hi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/menu" className={buttonClass("large")}>
                Order Now
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-latte/80">
              <span className="flex items-center gap-2">
                <LocationIcon /> {settings.address}
              </span>
              <span className="flex items-center gap-2">
                <PhoneIcon /> {settings.phone}
              </span>
            </div>
          </div>

          <div className="relative hidden justify-center md:flex">
            <div className="grid rotate-3 grid-cols-2 gap-4 rounded-3xl bg-white/10 p-6 shadow-lift backdrop-blur">
              {["🧁", "🍰", "☕", "🥐"].map((e, i) => (
                <div
                  key={e}
                  className={`flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br text-6xl shadow-card ${
                    i % 2 ? "from-accent-light to-cream" : "from-cream to-accent-light"
                  } ${i % 2 ? "-rotate-6" : "rotate-6"}`}
                >
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
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

      {/* Featured products */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-espresso sm:text-3xl">Featured today</h2>
          <p className="mt-1 text-sm text-mocha">Customer favorites straight from the oven.</p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/menu" className={buttonClass("secondary", "lg")}>
              See the whole menu
            </Link>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-accent/30 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <h3 className="font-display text-2xl font-bold text-espresso">
            Craving something sweet?
          </h3>
          <p className="max-w-md text-sm text-mocha">
            Skip the line — order online and pick it up warm at the counter.
          </p>
          <Link href="/menu" className={buttonClass("primary", "lg")}>
            Start your order
          </Link>
        </div>
      </section>
    </main>
  );
}
