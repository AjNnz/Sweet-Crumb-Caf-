"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import { buildReports, Mode } from "./aggregation";

import { ReportsHeader } from "./header";
import { ReportsTabs } from "./tabs";
import { SalesPeriodSection } from "./sales-period-section";
import { ProductPerformanceSection } from "./product-section";
import { InventoryWastageSection } from "./inventory-section";
import { ChannelSection } from "./channel-section";

/* ------------------------------------------------------------------ */
/* Reports — the page is a thin COMPOSITION. All the math lives in     */
/* aggregation.ts, every section owns its own table/chart/card JSX,    */
/* and this file only decides WHICH sections render.                   */
/* ------------------------------------------------------------------ */
export default function ReportsScreen() {
  const { orders, products, inventory } = useStore();
  const [mode, setMode] = useState<Mode>("DAILY");
  // Optional single-day filter for Product performance + Channel comparison.
  // Empty string = all dates (the original behaviour).
  const [day, setDay] = useState("");

  const reports = useMemo(
    () => buildReports(orders, products, inventory, day || undefined),
    [orders, products, inventory, day],
  );

  const salesRows =
    mode === "DAILY" ? reports.dailyRows : mode === "WEEKLY" ? reports.weeklyRows : reports.monthlyRows;

  return (
    <div className="flex flex-col gap-4">
      <ReportsHeader mode={mode} reports={reports} />
      <ReportsTabs mode={mode} onChange={setMode} />

      {mode === "DAILY" || mode === "WEEKLY" || mode === "MONTHLY" ? <SalesPeriodSection rows={salesRows} /> : null}
      {mode === "PRODUCT" ? (
        <ProductPerformanceSection rows={reports.productRows} day={day} onDayChange={setDay} />
      ) : null}
      {mode === "INVENTORY" ? <InventoryWastageSection rows={reports.inventoryRows} /> : null}
      {mode === "CHANNEL" ? <ChannelSection rows={reports.channelRows} day={day} onDayChange={setDay} /> : null}
    </div>
  );
}
