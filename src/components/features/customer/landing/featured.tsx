"use client";

import Link from "next/link";

import { useStore } from "@/context/store";
import { buttonClass } from "@/components/common/ui/button";
import { ProductCard } from "@/components/features/customer/product-card";
import { featuredProductsOf } from "./aggregation";

/* "Featured today" — the first 8 active products plus a menu link. */
export function FeaturedSection() {
  const { products } = useStore();
  const featured = featuredProductsOf(products);

  return (
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
  );
}

/* The bottom call-to-action strip. */
export function CtaSection() {
  return (
    <section className="bg-accent/30 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <h3 className="font-display text-2xl font-bold text-espresso">Craving something sweet?</h3>
        <p className="max-w-md text-sm text-mocha">Skip the line — order online and pick it up warm at the counter.</p>
        <Link href="/menu" className={buttonClass("primary", "lg")}>
          Start your order
        </Link>
      </div>
    </section>
  );
}
