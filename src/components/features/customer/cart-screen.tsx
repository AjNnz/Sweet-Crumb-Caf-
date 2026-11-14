"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import { Button } from "@/components/common/ui/button";
import { ProductThumb } from "@/components/features/customer/product-card";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/common/icons";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/common/toast";

export default function CartPage() {
  const { cartLines, cartTotal, cartCount, setCartQuantity, removeFromCart, clearCart } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  if (!cartLines.length) {
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-espresso">Shopping Cart</h1>
      <p className="mt-1 text-sm text-mocha">
        {cartCount} item{cartCount !== 1 ? "s" : ""} ready for checkout
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Lines */}
        <div className="flex flex-col gap-3">
          {cartLines.map(({ product, quantity, lineTotal }) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-3 shadow-card sm:p-4"
            >
              <Link href={`/menu/${product.id}`} className="shrink-0">
                <ProductThumb product={product} className="h-20 w-20 rounded-xl sm:h-24 sm:w-24" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/menu/${product.id}`} className="line-clamp-1 font-semibold text-espresso hover:text-primary">
                  {product.name}
                </Link>
                <p className="text-xs text-mocha">{formatCurrency(product.price)} each</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-primary/15 bg-cream p-0.5">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-latte disabled:opacity-40"
                      onClick={() => setCartQuantity(product.id, quantity - 1)}
                      aria-label="Decrease"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-latte disabled:opacity-40"
                      onClick={() => setCartQuantity(product.id, quantity + 1)}
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
          ))}
          <div className="mt-2 flex justify-between">
            <Link href="/menu" className="text-sm font-semibold text-secondary hover:underline">
              ← Continue shopping
            </Link>
            <button
              onClick={() => {
                clearCart();
                toast("Cart cleared.", "info");
              }}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Clear cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-primary/10 bg-white p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold text-espresso">Order Summary</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            {cartLines.map(({ product, quantity, lineTotal }) => (
              <div key={product.id} className="flex justify-between text-mocha">
                <span className="truncate pr-2">
                  {quantity} × {product.name}
                </span>
                <span>{formatCurrency(lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-primary/10 pt-4">
            <div className="flex justify-between text-base">
              <span className="font-semibold text-espresso">Total</span>
              <span className="font-display text-xl font-bold text-primary">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={() => router.push("/checkout")}>
            Proceed to Checkout
          </Button>
          <p className="mt-3 text-center text-[11px] text-mocha">
            Pickup or delivery options available at checkout.
          </p>
        </aside>
      </div>
    </main>
  );
}
