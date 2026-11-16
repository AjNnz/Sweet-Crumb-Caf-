"use client";

import Link from "next/link";

import { useStore } from "@/context/store";
import type { Product } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { ProductThumb } from "@/components/features/customer/product-card";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/common/icons";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/common/toast";

/* The empty-cart state. */
export function EmptyCartSection() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-6xl">🛒</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-espresso">Your cart is empty</h1>
      <p className="mt-2 text-sm text-mocha">Add something delicious from the menu.</p>
      <Link href="/menu" className="mt-6 inline-block">
        <Button size="lg">Browse the Menu</Button>
      </Link>
    </main>
  );
}

/* One cart line — thumb, stepper, remove link and line subtotal. */
export function CartLine({
  product,
  quantity,
  lineTotal,
  onSetQuantity,
}: {
  product: Product;
  quantity: number;
  lineTotal: number;
  onSetQuantity: (productId: string, quantity: number) => void;
}) {
  const { removeFromCart } = useStore();
  const { toast } = useToast();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-3 shadow-card sm:p-4">
      <Link href={`/menu/${product.id}`} className="shrink-0">
        <ProductThumb product={product} className="h-20 w-20 rounded-xl sm:h-24 sm:w-24" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/menu/${product.id}`} className="line-clamp-1 font-semibold text-espresso hover:text-primary">
          {product.name}
        </Link>
        <p className="text-xs text-mocha">{formatCurrency(product.price)} each</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {/* Quantity stepper (store rejects over-stock and 0-and-below) */}
          <div className="flex items-center gap-1 rounded-lg border border-primary/15 bg-cream p-0.5">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-latte disabled:opacity-40"
              onClick={() => onSetQuantity(product.id, quantity - 1)}
              aria-label="Decrease"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-latte disabled:opacity-40"
              onClick={() => onSetQuantity(product.id, quantity + 1)}
              aria-label="Increase"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <button
            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
            onClick={() => {
              removeFromCart(product.id);
              toast(`${product.name} removed.`, "info");
            }}
          >
            <TrashIcon className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-mocha">Subtotal</p>
        <p className="font-display text-lg font-bold text-primary">{formatCurrency(lineTotal)}</p>
      </div>
    </div>
  );
}
