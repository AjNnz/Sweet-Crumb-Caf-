"use client";

import { useStore } from "@/context/store";
import type { Order } from "@/lib/types";
import { DELIVERY_STATUS_STYLES, ORDER_STATUS_STYLES, formatCurrency } from "@/lib/utils";
import { buildReceiptMeta, subtotalOf, deliveryStatusOfOrder } from "./aggregation";

/* ------------------------------------------------------------------ */
/* The gradient thank-you band above the receipt.                      */
/* ------------------------------------------------------------------ */

export function HeaderBand({ order }: { order: Order }) {
  const { guestName, isDelivery } = deliveryStatusOfOrder(order);
  return (
    <div className="bg-gradient-to-b from-primary via-primary to-secondary px-4 pb-20 pt-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl ring-1 ring-white/25">
        ✅
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Order received!</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
        Thank you, {guestName}.{" "}
        {isDelivery
          ? "We'll prepare your order, then a rider brings it to your address."
          : "Our staff will prepare your order — pick it up at the counter."}
      </p>
    </div>
  );
}

/* The receipt paper itself: cafe header, meta rows, items, totals. */
export function Receipt({ order }: { order: Order }) {
  const { settings } = useStore();
  const { stage } = deliveryStatusOfOrder(order);
  const status = ORDER_STATUS_STYLES[order.orderStatus];
  const delivery = stage && order.orderStatus !== "COMPLETED" ? DELIVERY_STATUS_STYLES[stage] : null;
  const deliveryFee = order.deliveryFee ?? 0;
  const subtotal = subtotalOf(order);
  const meta = buildReceiptMeta(order, settings);

  return (
    <article className="bg-white px-6 pt-7 font-mono text-[13px] leading-relaxed text-espresso">
      {/* Cafe header */}
      <header className="text-center">
        <p className="font-display text-2xl font-bold tracking-wide text-primary">{settings.cafeName}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-mocha">Official Receipt</p>
      </header>

      <div className="mt-4 border-t border-dashed border-espresso/25" />

      {/* Meta */}
      <div className="mt-3 flex flex-col gap-1">
        {meta.map(([label, value]) => (
          <p key={label} className="flex justify-between gap-4">
            <span className="shrink-0 text-mocha">{label}</span>
            <span className="text-right">{value}</span>
          </p>
        ))}
      </div>

      <div className="mt-3 border-t border-dashed border-espresso/25" />

      {/* Items */}
      <div className="mt-3 grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-2 text-[10px] uppercase tracking-widest text-mocha">
        <span>Qty</span>
        <span>Desc</span>
        <span className="text-right">Amt</span>
      </div>
      <div className="mt-1.5 flex flex-col gap-1.5">
        {order.items.map((item) => (
          <div key={item.productId} className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-2">
            <span>{item.quantity}</span>
            <span className="min-w-0 break-words">
              {item.name}
              {item.quantity > 1 ? <span className="block text-xs text-mocha">@ {formatCurrency(item.price)}</span> : null}
            </span>
            <span className="text-right">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-dashed border-espresso/25" />

      {/* Totals */}
      <div className="mt-3 flex flex-col gap-1">
        <p className="flex justify-between gap-4">
          <span className="text-mocha">SUBTOTAL</span>
          <span>{formatCurrency(subtotal)}</span>
        </p>
        {deliveryFee ? (
          <p className="flex justify-between gap-4">
            <span className="text-mocha">DELIVERY FEE</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </p>
        ) : null}
        <p className="mt-1 flex items-baseline justify-between gap-4 border-t border-dashed border-espresso/25 pt-2 text-base font-bold">
          <span>TOTAL AMOUNT</span>
          <span className="text-primary">{formatCurrency(order.total)}</span>
        </p>
      </div>

      <div className="mt-3 border-t border-dashed border-espresso/25" />

      {/* Payment / status */}
      <div className="mt-3 flex flex-col gap-1">
        <p className="flex justify-between gap-4">
          <span className="text-mocha">PAYMENT</span>
          <span className="text-right">
            {order.paymentMethod} · {order.paymentStatus}
          </span>
        </p>
        <p className="flex justify-between gap-4">
          <span className="text-mocha">STATUS</span>
          <span className="text-right">
            {status.label}
            {delivery ? ` · ${delivery.emoji} ${delivery.label}` : ""}
          </span>
        </p>
      </div>

      <p className="mt-6 text-center tracking-[0.3em]">** THANK YOU **</p>
      <p className="mt-1 text-center text-[10px] text-mocha">This serves as your order slip.</p>

      {/* Checkered tear-off strip */}
      <div
        className="mt-4 h-3.5 w-full opacity-40"
        style={{
          backgroundImage: "repeating-conic-gradient(var(--color-accent) 0% 25%, transparent 0% 50%)",
          backgroundSize: "14px 14px",
        }}
      />
    </article>
  );
}
