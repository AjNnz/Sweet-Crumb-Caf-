"use client";

import Link from "next/link";

import type { Product } from "@/lib/types";
import { ProductThumb } from "@/components/features/customer/product-card";
import { formatCurrency } from "@/lib/utils";

/* Related products strip — same category, up to four. */
export function RelatedSection({ related, category }: { related: Product[]; category: string }) {
  if (!related.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-xl font-bold text-espresso">More {category.toLowerCase()}</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((p) => (
          <Link
            key={p.id}
            href={`/menu/${p.id}`}
            className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white p-3 shadow-card hover:shadow-lift"
          >
            <ProductThumb product={p} className="h-16 w-16 shrink-0 rounded-xl text-3xl" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-espresso">{p.name}</p>
              <p className="text-sm text-secondary">{formatCurrency(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
