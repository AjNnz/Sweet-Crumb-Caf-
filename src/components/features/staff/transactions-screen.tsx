"use client";

import { useMemo } from "react";

import { useStore } from "@/context/store";
import { TransactionTable } from "@/components/shared/transaction-table";

export default function StaffTransactionsPage() {
  const { orders } = useStore();

  // Transaction history = every order in the system (staff view)
  const transactions = useMemo(() => orders, [orders]);

  const stats = useMemo(() => {
    const paid = transactions.filter((t) => t.paymentStatus === "PAID" && t.orderStatus !== "CANCELLED");
    return {
      count: paid.length,
      revenue: paid.reduce((s, t) => s + t.total, 0),
    };
  }, [transactions]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Transaction History</h1>
        <p className="text-xs text-mocha">
          All processed tickets — search, filter by channel or status, and view details.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-mocha">Paid transactions</p>
          <p className="mt-1 font-display text-2xl font-bold text-espresso">{stats.count}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-mocha">Revenue collected</p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">₱{Math.round(stats.revenue).toLocaleString()}</p>
        </div>
      </div>

      <TransactionTable orders={transactions} />
    </div>
  );
}
