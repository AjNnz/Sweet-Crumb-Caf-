"use client";

import { useStore } from "@/context/store";
import { Badge } from "@/components/common/ui/badge";
import { DELIVERY_STATUS_STYLES, cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { isDeliveryJob } from "@/components/features/rider/delivery-card";

export default function DeliveryHistoryPage() {
  const { orders, users, currentUser, deliveryStatusOf } = useStore();

  const delivered = orders
    .filter((o) => isDeliveryJob(o) && deliveryStatusOf(o) === "DELIVERED")
    .sort((a, b) => (b.deliveredAt ?? b.createdAt).localeCompare(a.deliveredAt ?? a.createdAt));

  const myCount = delivered.filter((o) => o.riderId === currentUser?.id).length;

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-bold text-espresso">Delivered</h1>
        <p className="mt-1 text-sm text-mocha">
          Every completed delivery — <span className="font-semibold text-espresso">{myCount}</span> of them yours.
        </p>
      </header>

      {delivered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-primary/20 bg-white/60 p-10 text-center text-sm text-mocha">
          No deliveries completed yet. They will show up here once riders mark them delivered.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wide text-mocha">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="hidden px-4 py-3 md:table-cell">Delivered by</th>
                <th className="hidden px-4 py-3 sm:table-cell">Delivered at</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {delivered.map((order) => (
                <tr key={order.id} className={cn("border-t border-primary/10", order.riderId === currentUser?.id && "bg-latte/50")}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-espresso">{order.reference}</p>
                    <Badge className={cn("mt-1", DELIVERY_STATUS_STYLES.DELIVERED.className)}>
                      {DELIVERY_STATUS_STYLES.DELIVERED.emoji} Delivered
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-espresso">{order.customerName}</p>
                    <p className="line-clamp-1 max-w-56 text-xs text-mocha">{order.fulfillment?.address}</p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {order.riderId === currentUser?.id ? (
                      <span className="font-semibold text-primary">You 🎉</span>
                    ) : (
                      <span className="text-mocha">{users.find((u) => u.id === order.riderId)?.name ?? "—"}</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-mocha sm:table-cell">{formatDateTime(order.deliveredAt ?? order.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-display font-bold text-primary">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
