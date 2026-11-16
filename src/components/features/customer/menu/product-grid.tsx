"use client";

import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/features/customer/product-card";

/* The product grid — or the "nothing matches" state. */
export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="mt-16 text-center">
        <p className="text-5xl">🔍</p>
        <p className="mt-4 font-semibold text-espresso">Nothing matches your search</p>
        <p className="mt-1 text-sm text-mocha">Try a different keyword or category.</p>
      </div>
    );
  }
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
