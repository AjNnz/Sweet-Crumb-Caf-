"use client";

import Link from "next/link";

import { useStore } from "@/context/store";
import { buttonClass } from "@/components/common/ui/button";
import { LocationIcon, PhoneIcon } from "@/components/common/icons";

/* The gradient hero — headline, CTA, contact details, emoji collage. */
export function HeroSection() {
  const { settings } = useStore();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-espresso text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Bake-fresh daily · Est. 2026</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Life is short. <span className="text-accent">Eat the cupcake.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-latte/90">
            Welcome to {settings.cafeName} — cupcakes, cakes, pastries and freshly-brewed coffee, baked in small
            batches every morning. Order online for pickup, or drop by and say hi.
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

        {/* Decorative emoji collage */}
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
  );
}
