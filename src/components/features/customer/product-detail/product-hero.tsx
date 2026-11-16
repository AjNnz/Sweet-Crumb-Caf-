"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import type { Product } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/common/ui/button";
import { ProductThumb } from "@/components/features/customer/product-card";
import { CartIcon, MinusIcon, PlusIcon } from "@/components/common/icons";
import { formatCurrency } from "@/lib/utils";
import { stockPillOf, quantityMaxOf } from "./aggregation";

/* ------------------------------------------------------------------ */
/* The product hero — big image, name/description, the stock pill,     */
/* the quantity stepper and the add-to-cart / buy-now actions.         */
/* The quantity is local state, reset when a different product mounts. */
/* ------------------------------------------------------------------ */

export function ProductHero({ product }: { product: Product }) {
  const { getStock, addToCart } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const stock = getStock(product.id);
  const pill = stockPillOf(product, stock);
  const max = quantityMaxOf(stock);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    addToCart(product.id, quantity);
    toast(`${quantity} × ${product.name} added to cart.`);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductThumb product={product} className="h-80 w-full rounded-3xl shadow-card sm:h-[28rem]" />
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{product.category}</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-espresso">{product.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-mocha">{product.description}</p>

        {/* Price + stock pill */}
        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-display text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
          {pill.label ? (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${pill.cls}`}>{pill.label}</span>
          ) : null}
        </div>

        {/* Quantity + add to cart */}
        {pill.soldOut ? (
          <p className="mt-8 rounded-2xl bg-latte px-4 py-3 text-sm text-mocha">
            This item is fully sold out for today — check back tomorrow or try one of our other treats.
          </p>
        ) : (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-primary/20 bg-white p-1">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-espresso hover:bg-latte disabled:opacity-40"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <MinusIcon />
              </button>
              <span className="w-12 text-center text-base font-semibold">{quantity}</span>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-espresso hover:bg-latte disabled:opacity-40"
                onClick={() => setQuantity((q) => Math.min(max, q + 1))}
                disabled={quantity >= max}
                aria-label="Increase quantity"
              >
                <PlusIcon />
              </button>
            </div>
            <span className="text-sm text-mocha">
              Total: <span className="font-semibold text-espresso">{formatCurrency(product.price * quantity)}</span>
            </span>
            <Button size="lg" variant="primary" className="flex-1" onClick={handleAdd}>
              <CartIcon /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                handleAdd();
                router.push("/cart");
              }}
            >
              Buy Now
            </Button>
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-mocha">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-lg">🥐</p>Freshly baked
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-lg">🛍️</p>Pickup ready
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-lg">💛</p>Made with love
          </div>
        </div>
      </div>
    </div>
  );
}
