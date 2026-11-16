import {
  dailySeries,
  dailyUnsold,
  salesByCategory,
  salesByChannel,
  productPerformance,
  productSellThrough,
  completedSales,
} from "@/lib/analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { InventoryItem, Order, Product } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Pure dashboard math — returns every number the sections render.     */
/* No React in here. The screen calls buildDashboardStats() in a       */
/* useMemo and passes slices down as props.                            */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  sales: number;
  revenue: number;
  units: number;
  availableProducts: number;
  day: Array<{ date: string; revenue: number }>;
  best: Array<{ name: string; units: number }>;
  categories: Array<{ category: string; revenue: number }>;
  channels: Array<{ channel: string; orders: number; revenue: number }>;
  unsoldDay: Array<{ date: string; units: number }>;
  sellThrough: Array<{ name: string; sold: number; wasted: number; soldPct: number; wastedPct: number }>;
  recent: Order[];
}

export function buildDashboardStats(
  orders: Order[],
  products: Product[],
  inventory: InventoryItem[],
  range: number,
): DashboardStats {
  const cutoff = Date.now() - range * 24 * 3600 * 1000;
  const sales = completedSales(orders).filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  const revenue = sales.reduce((s, o) => s + o.total, 0);
  const units = sales.reduce((s, o) => s + o.items.reduce((x, i) => x + i.quantity, 0), 0);
  const availableProducts = products.filter((p) => !p.archived && p.available).length;
  const day = dailySeries(orders, range);
  const best = productPerformance(
    orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff),
    products,
  ).slice(0, 6);
  const categories = salesByCategory(
    orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff),
    products,
  );
  const channels = salesByChannel(orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff));
  // End-of-shift write-offs: daily totals + per-product sold/unsold shares
  const unsoldDay = dailyUnsold(inventory, range);
  const sellThrough = productSellThrough(
    orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff),
    inventory,
    products,
    range,
  ).sort((a, b) => b.wasted - a.wasted || a.soldPct - b.soldPct);
  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  return { sales: sales.length, revenue, units, availableProducts, day, best, categories, channels, unsoldDay, sellThrough, recent };
}

/** The four KPI cards across the top. */
export function kpisOf(stats: DashboardStats, range: number) {
  return [
    { label: "Total Revenue", value: formatCurrency(stats.revenue), sub: `last ${range} days`, icon: "💰", tone: "bg-emerald-50 text-emerald-700" },
    { label: "Transactions", value: formatNumber(stats.sales), sub: "completed & paid", icon: "🧾", tone: "bg-sky-50 text-sky-700" },
    { label: "Products Sold", value: formatNumber(stats.units), sub: "pieces sold", icon: "📦", tone: "bg-amber-50 text-amber-700" },
    { label: "Available Products", value: formatNumber(stats.availableProducts), sub: "active in menu", icon: "🧁", tone: "bg-rose-50 text-rose-700" },
  ];
}
