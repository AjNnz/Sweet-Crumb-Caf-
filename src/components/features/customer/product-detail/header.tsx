"use client";

import Link from "next/link";

import { Button } from "@/components/common/ui/button";

/* The missing-product state — deleted or bad deep link. */
export function NotFoundSection() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-5xl">🍩</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Product not found</h1>
      <p className="mt-2 text-sm text-mocha">It may have been removed from the menu.</p>
      <Link href="/menu" className="mt-6 inline-block">
        <Button>Back to Menu</Button>
      </Link>
    </main>
  );
}

/* The Menu / Category / Product breadcrumb. */
export function Breadcrumb({ product }: { product: { category: string; name: string } }) {
  return (
    <nav className="text-xs text-mocha">
      <Link href="/menu" className="hover:underline">
        Menu
      </Link>
      <span className="mx-1.5">/</span>
      <Link href={`/menu?category=${encodeURIComponent(product.category)}`} className="hover:underline">
        {product.category}
      </Link>
      <span className="mx-1.5">/</span>
      <span className="text-espresso">{product.name}</span>
    </nav>
  );
}
