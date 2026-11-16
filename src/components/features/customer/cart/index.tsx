"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import { useToast } from "@/components/common/toast";

import { EmptyCartSection, CartLine } from "./cart-line";
import { CartSummary } from "./cart-summary";

/* ------------------------------------------------------------------ */
/* Cart — a thin COMPOSITION. The empty state, cart lines and the      */
/* summary live in their own files; this file owns the clear-cart      */
/* action and the checkout navigation.                                 */
/* ------------------------------------------------------------------ */
export default function CartPage() {
  const { cartLines, cartTotal, cartCount, setCartQuantity, clearCart } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  if (!cartLines.length) {
    return <EmptyCartSection />;
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
            <CartLine key={product.id} product={product} quantity={quantity} lineTotal={lineTotal} onSetQuantity={setCartQuantity} />
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
        <CartSummary cartLines={cartLines} cartTotal={cartTotal} onCheckout={() => router.push("/checkout")} />
      </div>
    </main>
  );
}
