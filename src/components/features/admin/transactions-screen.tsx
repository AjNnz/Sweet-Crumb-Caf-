"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import { TransactionTable } from "@/components/shared/transaction-table";
import { cn } from "@/lib/utils";

const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 3650, label: "All time" },
];

export default function AdminTransactionsPage() {
  const { orders } = useStore();
  const [rangeDays, setRangeDays] = useState(30);

  const { filtered, revenue, paidCount } = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- date filters are relative to "now" by design
    const cutoff = Date.now() - rangeDays * 24 * 3600 * 1000;
    const list = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
    const paid = list.filter((o) => o.paymentStatus === "PAID" && o.orderStatus !== "CANCELLED");
    return {
      filtered: list,
      revenue: paid.reduce((s, o) => s + o.total, 0),
      paidCount: paid.length,
    };
  }, [orders, rangeDays]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Transaction Management</h1>
        <p className="text-xs text-mocha">
          Every sale across both channels, with customer details where provided.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRangeDays(r.days)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                rangeDays === r.days ? "bg-primary text-white" : "text-mocha hover:bg-latte",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-xs">
          <span className="rounded-xl bg-white px-4 py-2 shadow-sm">
            <span className="font-semibold text-espresso">{paidCount}</span> paid transactions
          </span>
          <span className="rounded-xl bg-white px-4 py-2 shadow-sm">
            Revenue: <span className="font-semibold text-primary">₱{Math.round(revenue).toLocaleString()}</span>
          </span>
        </div>
      </div>

      <TransactionTable orders={filtered} showCustomer />
    </div>
  );
}
