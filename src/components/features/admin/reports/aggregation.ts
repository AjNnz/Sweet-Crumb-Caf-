import type { InventoryItem, Order, Product } from "@/lib/types";
import { completedSales, salesByChannel } from "@/lib/analytics";
import { formatDateTime, toDateKey } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Pure report aggregation — no React in here. The reports screen      */
/* calls buildReports() inside a useMemo and hands slices down to      */
/* each section, so every section file stays dumb and presentational.  */
/* ------------------------------------------------------------------ */

export type Mode = "DAILY" | "WEEKLY" | "MONTHLY" | "PRODUCT" | "INVENTORY" | "CHANNEL";

export const TABS: Array<{ id: Mode; label: string }> = [
  { id: "DAILY", label: "Daily sales" },
  { id: "WEEKLY", label: "Weekly sales" },
  { id: "MONTHLY", label: "Monthly sales" },
  { id: "PRODUCT", label: "Product performance" },
  { id: "INVENTORY", label: "Inventory & wastage" },
  { id: "CHANNEL", label: "Channel comparison" },
];

export interface ReportRow {
  /** Raw sortable key, e.g. 2026-11-04 · 2026-W44 · 2026-11 */
  id: string;
  label: string;
  /** Compact label for chart axes */
  short: string;
  count: number;
  units: number;
  revenue: number;
}

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  units: number;
  revenue: number;
}

export interface InventoryRow {
  id: string;
  name: string;
  category: string;
  available: number;
  threshold: number;
  sold: number;
  wasted: number;
  lastUpdated: string;
}

export interface ChannelRow {
  channel: string;
  orders: number;
  units: number;
  revenue: number;
  revenuePerOrder: number;
}

export interface Reports {
  dailyRows: ReportRow[];
  weeklyRows: ReportRow[];
  monthlyRows: ReportRow[];
  productRows: ProductRow[];
  inventoryRows: InventoryRow[];
  channelRows: ChannelRow[];
}

/** Every report the screen can show, computed in one pass over the data. */
export function buildReports(
  orders: Order[],
  products: Product[],
  inventory: InventoryItem[],
  day?: string,
): Reports {
  const sales = completedSales(orders);
  const withMeta = sales.map((o) => {
    const date = new Date(o.createdAt);
    return { order: o, dateKey: toDateKey(o.createdAt), week: isoWeekKey(date), month: o.createdAt.slice(0, 7) };
  });

  // Product performance and channel comparison can be narrowed to ONE day
  // with the calendar picker. Sales-over-time and inventory reports keep
  // using the full `withMeta` set so their periods stay comparable.
  const scoped = day ? withMeta.filter((r) => r.dateKey === day) : withMeta;

  // "Sold" in the inventory report comes from actual completed order
  // items — the SAME source as Product performance. The stock ledger's
  // SOLD movements only exist for sales made through the live API (the
  // imported demo history has none), so using them here would show 0
  // for every seeded product. Counting order items also includes those
  // real sales, so nothing is double-counted.
  const soldByProduct = new Map<string, number>();
  for (const { order } of withMeta) {
    for (const item of order.items) {
      soldByProduct.set(item.productId, (soldByProduct.get(item.productId) ?? 0) + item.quantity);
    }
  }

  const dailyRows = group(withMeta, "dateKey", {
    label: (k) => new Date(`${k}T00:00:00`).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }),
    short: (k) => new Date(`${k}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
  });
  const weeklyRows = group(withMeta, "week", { label: weekLabel, short: weekShort });
  const monthlyRows = group(withMeta, "month", { label: monthLabel, short: monthShort });

  const productRows: ProductRow[] = products
    .filter((p) => !p.archived)
    .map((p) => {
      let units = 0;
      let revenue = 0;
      for (const r of scoped) {
        for (const item of r.order.items) {
          if (item.productId === p.id) {
            units += item.quantity;
            revenue += item.price * item.quantity;
          }
        }
      }
      return { id: p.id, name: p.name, category: p.category, units, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const inventoryRows: InventoryRow[] = products
    .filter((p) => !p.archived)
    .map((p) => {
      const inv = inventory.find((i) => i.productId === p.id);
      // Wastage is still a stock-ledger figure (end-of-shift write-offs).
      const wasted = inv ? inv.movements.filter((m) => m.type === "WASTED").reduce((s, m) => s + m.quantity, 0) : 0;
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        available: inv?.quantity ?? 0,
        threshold: inv?.lowStockThreshold ?? 0,
        sold: soldByProduct.get(p.id) ?? 0,
        wasted,
        lastUpdated: inv ? formatDateTime(inv.lastUpdated) : "—",
      };
    });

  const channelRows: ChannelRow[] = salesByChannel(scoped.map((r) => r.order)).map((c) => ({
    ...c,
    revenuePerOrder: c.orders ? c.revenue / c.orders : 0,
  }));

  return { dailyRows, weeklyRows, monthlyRows, productRows, inventoryRows, channelRows };
}

/** The row slice a given report mode shows (also decides export-ability).
 * Typed loosely on purpose — only the header's length check touches it;
 * the sections each take their own strongly-typed slice. */
export function rowsFor(mode: Mode, reports: Reports): ReadonlyArray<unknown> {
  switch (mode) {
    case "DAILY":
      return reports.dailyRows;
    case "WEEKLY":
      return reports.weeklyRows;
    case "MONTHLY":
      return reports.monthlyRows;
    case "PRODUCT":
      return reports.productRows;
    case "INVENTORY":
      return reports.inventoryRows;
    case "CHANNEL":
      return reports.channelRows;
  }
}

function group(
  meta: Array<{ order: { total: number; items: { quantity: number }[] }; dateKey: string; week: string; month: string }>,
  key: "dateKey" | "week" | "month",
  fmt: { label: (id: string) => string; short: (id: string) => string },
): ReportRow[] {
  const map = new Map<string, ReportRow>();
  for (const r of meta) {
    const id = r[key];
    const entry = map.get(id) ?? { id, label: fmt.label(id), short: fmt.short(id), count: 0, units: 0, revenue: 0 };
    entry.count += 1;
    entry.units += r.order.items.reduce((s, i) => s + i.quantity, 0);
    entry.revenue += r.order.total;
    map.set(id, entry);
  }
  // Sort by the raw chronological key — labels alone sort alphabetically
  return [...map.values()].sort((a, b) => b.id.localeCompare(a.id));
}

function weekLabel(key: string) {
  const [year, week] = key.split("-W");
  return `Week ${Number(week)}, ${year}`;
}

function weekShort(key: string) {
  return `W${Number(key.split("-W")[1])}`;
}

function monthLabel(key: string) {
  return new Date(`${key}-01T00:00:00`).toLocaleDateString("en-PH", { year: "numeric", month: "long" });
}

function monthShort(key: string) {
  return new Date(`${key}-01T00:00:00`).toLocaleDateString("en-PH", { month: "short", year: "2-digit" });
}

function isoWeekKey(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
