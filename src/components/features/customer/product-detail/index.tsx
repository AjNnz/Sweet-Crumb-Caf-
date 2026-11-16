"use client";

import { use, useMemo } from "react";

import { useStore } from "@/context/store";

import { relatedProductsOf } from "./aggregation";
import { NotFoundSection, Breadcrumb } from "./header";
import { ProductHero } from "./product-hero";
import { RelatedSection } from "./related-section";

/* ------------------------------------------------------------------ */
/* Product detail — a thin COMPOSITION. The hero (with quantity        */
/* stepper), breadcrumb and related strip live in their own files.     */
/* ------------------------------------------------------------------ */
export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products } = useStore();

  const product = products.find((p) => p.id === id);
  const related = useMemo(() => (product ? relatedProductsOf(products, product) : []), [product, products]);

  if (!product) {
    return <NotFoundSection />;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumb product={product} />

      {/* Image + info + add to cart */}
      <div className="mt-6">
        <ProductHero product={product} />
      </div>

      {/* More from this category */}
      <RelatedSection related={related} category={product.category} />
    </main>
  );
}
