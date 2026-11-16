"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useStore } from "@/context/store";
import { buttonClass } from "@/components/common/ui/button";

import { HeaderBand, Receipt } from "./receipt";
import { ReceiptEdge } from "./receipt-edge";
import { NotFoundSection } from "./not-found-section";

/* ------------------------------------------------------------------ */
/* Order confirmation — a thin COMPOSITION. The header band, the       */
/* receipt paper and the torn-paper edges live in their own files;     */
/* this file finds the order by ?ref= and lays the pieces out.         */
/* ------------------------------------------------------------------ */
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const { orders } = useStore();
  const ref = useSearchParams().get("ref");
  const order = orders.find((o) => o.reference === ref);

  if (!order) {
    return <NotFoundSection ref={ref} />;
  }

  return (
    <main className="pb-16">
      {/* Thank-you band */}
      <HeaderBand order={order} />

      {/* Receipt paper with torn edges */}
      <div className="mx-auto -mt-14 max-w-md px-4 drop-shadow-[0_18px_28px_rgba(41,35,31,0.25)]">
        <ReceiptEdge />
        <Receipt order={order} />
        <ReceiptEdge flip />
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3 px-4">
        <Link href="/my-orders" className={buttonClass("primary", "lg")}>
          View My Orders
        </Link>
        <Link href="/menu" className={buttonClass("outline", "lg")}>
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
