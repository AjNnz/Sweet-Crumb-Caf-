"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import { isMadeToOrder } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { ProductThumb } from "@/components/features/customer/product-card";
import { CartIcon, MinusIcon, PlusIcon } from "@/components/common/icons";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/common/toast";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getStock, addToCart, products } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const product = products.find((p) => p.id === id);
  const stock = product ? getStock(product.id) : 0;
  const madeToOrder = product ? isMadeToOrder(product.category) : false;
  const soldOut = !product?.available || (!madeToOrder && stock === 0);
  const [quantity, setQuantity] = useState(1);

  const related = useMemo(
    () =>
      product
        ? products
            .filter((p) => p.category === product.category && p.id !== product.id && !p.archived)
            .slice(0, 4)
        : [],
    [product, products],
  );

  if (!product) {
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

  const max = Math.min(stock, 99);

  const handleAdd = () => {
    addToCart(product.id, quantity);
    toast(`${quantity} × ${product.name} added to cart.`);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
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

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <ProductThumb product={product} className="h-72 w-full rounded-3xl shadow-card sm:h-96" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
            {product.category}
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-espresso">{product.name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-mocha">{product.description}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
            {soldOut ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                Sold out
              </span>
            ) : madeToOrder ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Made to order — prepared fresh
              </span>
            ) : stock <= 5 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Only {stock} left!
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {stock} available
              </span>
            )}
          </div>

          {/* Quantity + add to cart */}
          {soldOut ? (
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
              <Button size="lg" variant="secondary" className="flex-1" onClick={() => { handleAdd(); router.push("/cart"); }}>
                Buy Now
              </Button>
            </div>
          )}

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

      {/* Related */}
      {related.length ? (
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold text-espresso">
            More {product.category.toLowerCase()}
          </h2>
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
      ) : null}
    </main>
  );
}
