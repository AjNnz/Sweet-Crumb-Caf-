"use client";

import Link from "next/link";

import { Badge } from "@/components/common/ui/badge";
import { buttonClass } from "@/components/common/ui/button";
import { ProductThumb } from "@/components/features/customer/product-card";
import { ORDER_STATUS_STYLES, cn, displayCustomerName, formatCurrency, formatDateTime } from "@/lib/utils";
import type { Product } from "@/lib/types";
import type { InventoryItem } from "@/lib/types";
import type { DashboardStats } from "./aggregation";

/* ------------------------------------------------------------------ */
/* The right-hand activity row: the 6 most recent transactions and the */
/* low-stock alerts, each with its own jump-to link.                   */
/* ------------------------------------------------------------------ */

export function RecentTransactionsSection({ recent }: { recent: DashboardStats["recent"] }) {
  return (
    <div className="min-w-0 rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-espresso">Recent transactions</h2>
        <Link href="/admin/transactions" className="text-xs font-semibold text-secondary hover:underline">
          View all →
        </Link>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {recent.map((o) => (
          <div key={o.id} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-xs font-semibold text-espresso">
                {o.reference}
                <Badge className={ORDER_STATUS_STYLES[o.orderStatus].className}>
                  {ORDER_STATUS_STYLES[o.orderStatus].label}
                </Badge>
              </p>
              <p className="truncate text-[10px] text-mocha">
                {o.channel} · {displayCustomerName(o.customerName, o.channel)} · {formatDateTime(o.createdAt)}
              </p>
            </div>
            <span className="text-sm font-bold text-primary">{formatCurrency(o.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LowStockSection({
  lowStockItems,
  products,
}: {
  lowStockItems: InventoryItem[];
  products: Product[];
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-espresso">Low-stock alerts</h2>
        <Link href="/admin/inventory" className="text-xs font-semibold text-secondary hover:underline">
          Manage inventory →
        </Link>
      </div>
      {lowStockItems.length ? (
        <div className="mt-3 flex flex-col gap-2">
          {lowStockItems.map((inv) => {
            const p = products.find((x) => x.id === inv.productId);
            const critical = inv.quantity <= inv.lowStockThreshold * 0.5;
            return (
              <div key={inv.productId} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2">
                {/* Product photo (or emoji fallback) — ProductThumb needs a
                 * product, and the inventory row may point at a deleted one. */}
                {p ? (
                  <ProductThumb product={p} className="h-9 w-9 shrink-0 rounded-lg text-lg" />
                ) : (
                  <span className="text-lg">❔</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-espresso">{p?.name}</p>
                  <p className="text-[10px] text-mocha">
                    {inv.quantity} pcs · threshold {inv.lowStockThreshold}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    critical ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {critical ? "CRITICAL" : "LOW"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-mocha">All stock levels are healthy. 🎉</p>
      )}
    </div>
  );
}

/* The bottom quick links. */
export function QuickLinks() {
  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
      <p className="text-xs text-mocha">Jump to:</p>
      <Link href="/admin/reports" className={buttonClass("outline", "sm")}>
        Reports
      </Link>
      <Link href="/admin/inventory" className={buttonClass("outline", "sm")}>
        Inventory
      </Link>
    </div>
  );
}
