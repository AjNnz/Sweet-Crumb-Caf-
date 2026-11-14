"use client";

import { Button } from "@/components/common/ui/button";
import { useToast } from "@/components/common/toast";
import { Mode, Reports, rowsFor } from "./aggregation";

/* ------------------------------------------------------------------ */
/* Page header — title + the Export CSV button. The CSV builder lives  */
/* here because this is the only place that needs it.                  */
/* ------------------------------------------------------------------ */

function csvEscape(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const FILENAMES: Record<Mode, string> = {
  DAILY: "daily-sales",
  WEEKLY: "weekly-sales",
  MONTHLY: "monthly-sales",
  PRODUCT: "product-performance",
  INVENTORY: "inventory-report",
  CHANNEL: "channel-comparison",
};

export function ReportsHeader({ mode, reports }: { mode: Mode; reports: Reports }) {
  const { toast } = useToast();

  const exportCsv = () => {
    // Same friendly column names the table headers show.
    let rows: Array<object>;
    switch (mode) {
      case "DAILY":
        rows = reports.dailyRows.map((r) => ({ Period: r.label, Orders: r.count, Units: r.units, Revenue: r.revenue }));
        break;
      case "WEEKLY":
        rows = reports.weeklyRows.map((r) => ({ Period: r.label, Orders: r.count, Units: r.units, Revenue: r.revenue }));
        break;
      case "MONTHLY":
        rows = reports.monthlyRows.map((r) => ({ Period: r.label, Orders: r.count, Units: r.units, Revenue: r.revenue }));
        break;
      case "PRODUCT":
        rows = reports.productRows;
        break;
      case "INVENTORY":
        rows = reports.inventoryRows;
        break;
      case "CHANNEL":
        rows = reports.channelRows.map((r) => ({
          Channel: r.channel,
          Orders: r.orders,
          Units: r.units,
          Revenue: r.revenue,
          RevenuePerOrder: Math.round(r.revenuePerOrder),
        }));
        break;
    }
    const keys = Object.keys(rows[0] ?? {});
    const csv = [
      keys.join(","),
      ...rows.map((r) => keys.map((k) => csvEscape((r as Record<string, unknown>)[k] as string | number)).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${FILENAMES[mode]}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Report exported as CSV.");
  };

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Reports</h1>
        <p className="text-xs text-mocha">Daily, weekly and monthly sales — plus product, inventory and channel reports.</p>
      </div>
      <Button onClick={exportCsv} disabled={!rowsFor(mode, reports).length}>
        ⬇ Export CSV
      </Button>
    </div>
  );
}
