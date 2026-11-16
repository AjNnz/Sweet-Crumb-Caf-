"use client";

import Link from "next/link";
import Image from "next/image";

import { useStore } from "@/context/store";
import type { Product } from "@/lib/types";
import { isMadeToOrder } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/common/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Cupcakes: "from-rose-200 via-pink-100 to-amber-100",
  Cakes: "from-amber-200 via-orange-100 to-rose-100",
  Pastries: "from-yellow-200 via-amber-100 to-orange-50",
  Coffee: "from-amber-200 via-yellow-800/20 to-stone-200",
  "Other Drinks": "from-emerald-100 via-teal-50 to-lime-100",
};

export function ProductThumb({ product, className }: { product: Product; className?: string }) {
  const emojiSize = className?.includes("h-16")
    ? "text-3xl"
    : className?.includes("h-24")
      ? "text-4xl"
      : "text-6xl";
  // Photos sit on plain white so the WHOLE product is always visible;
  // emoji placeholders keep the per-category gradient behind them.
  const backdrop = product.imageUrl ? "bg-white" : CATEGORY_GRADIENTS[product.category] ?? "from-amber-100 to-rose-100";
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        backdrop,
        className,
      )}
    >
      {product.imageUrl ? (
        /* Real product photo (files live in /public). object-contain letterboxes
         * the full image inside the box — never cropped or stretched, no matter
         * the photo's aspect ratio or the size of the container. */
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 90vw, 300px"
          className="object-contain"
        />
      ) : (
        <span className={cn("drop-shadow-sm", emojiSize)}>{product.emoji}</span>
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { getStock, addToCart } = useStore();
  const stock = getStock(product.id);
  const madeToOrder = isMadeToOrder(product.category);
  const soldOut = !product.available || (!madeToOrder && stock === 0);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={`/menu/${product.id}`} className="block">
        <ProductThumb product={product} className="h-40 w-full" />
        {soldOut ? (
          <span className="absolute left-2 top-2 rounded-full bg-espresso/85 px-2.5 py-1 text-[10px] font-bold text-white">
            {product.available ? "Sold out" : "Unavailable"}
          </span>
        ) : stock <= 5 ? (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">
            Only {stock} left
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
          {product.category}
        </div>
        <Link href={`/menu/${product.id}`} className="mt-0.5 line-clamp-1 font-semibold text-espresso hover:text-primary">
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 flex-1 text-xs text-mocha">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
          {soldOut ? (
            <Button size="sm" disabled>
              Sold out
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => addToCart(product.id, 1)}
              aria-label={`Add ${product.name} to cart`}
            >
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
