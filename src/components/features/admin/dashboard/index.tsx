"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import { buildDashboardStats, kpisOf } from "./aggregation";

import { DashboardHeader } from "./header";
import { KpiCards } from "./kpi-cards";
import { SalesTrendSection } from "./sales-trend";
import { UnsoldSection } from "./unsold-chart";
import { SellThroughSection } from "./sell-through";
import { BreakdownSection } from "./breakdown";
import { LowStockSection, QuickLinks, RecentTransactionsSection } from "./activity";

/* ------------------------------------------------------------------ */
/* Dashboard — a thin COMPOSITION. The math lives in aggregation.ts,   */
/* every card lives in its own section file, and this file only        */
/* decides which sections render (and how the range filter connects).  */
/* ------------------------------------------------------------------ */
export default function AdminDashboardScreen() {
  const { orders, products, inventory, lowStockItems } = useStore();
  const [range, setRange] = useState(30);

  const stats = useMemo(
    () => buildDashboardStats(orders, products, inventory, range),
    [orders, products, inventory, range],
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader range={range} onChange={setRange} />

      {/* KPI cards */}
      <KpiCards kpis={kpisOf(stats, range)} />

      {/* Daily sales trend */}
      <SalesTrendSection stats={stats} range={range} />

      {/* Unsold products per day (end-of-shift write-offs) */}
      <UnsoldSection stats={stats} range={range} />

      {/* Sell-through by product */}
      <SellThroughSection stats={stats} range={range} />

      {/* Categories · channels · best sellers */}
      <BreakdownSection stats={stats} range={range} />

      {/* Recent transactions + low stock alerts */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <RecentTransactionsSection recent={stats.recent} />
        <LowStockSection lowStockItems={lowStockItems} products={products} />
      </div>

      <QuickLinks />
    </div>
  );
}
