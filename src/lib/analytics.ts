import type { InventoryItem, Order, Product, ProductCategory } from "./types";
import { isMadeToOrder } from "./types";
import { toDateKey } from "./utils";

/* ------------------------------------------------------------------ */
/* Core filters — a "sale" is a completed, paid order                  */
/* ------------------------------------------------------------------ */

export function isCompletedSale(order: Order) {
  return order.orderStatus === "COMPLETED" && order.paymentStatus === "PAID";
}

export function completedSales(orders: Order[]) {
  return orders.filter(isCompletedSale);
}

export function withinDays(orders: Order[], days: number, now = new Date()) {
  const cutoff = now.getTime() - days * 24 * 3600 * 1000;
  return orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
}

/** Group orders by local date key */
export function dailySeries(orders: Order[], days = 30, now = new Date()) {
  const buckets = new Map<string, { revenue: number; count: number; units: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    buckets.set(toDateKey(d.toISOString()), { revenue: 0, count: 0, units: 0 });
  }
  for (const order of completedSales(orders)) {
    const key = toDateKey(order.createdAt);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += order.total;
    bucket.count += 1;
    bucket.units += order.items.reduce((s, i) => s + i.quantity, 0);
  }
  return [...buckets.entries()].map(([date, v]) => ({ date, ...v }));
}

/* ------------------------------------------------------------------ */
/* Descriptive analytics                                               */
/* ------------------------------------------------------------------ */

export interface CategoryStat {
  category: ProductCategory;
  revenue: number;
  units: number;
}

export function salesByCategory(orders: Order[], products: Product[]): CategoryStat[] {
  const map = new Map<ProductCategory, CategoryStat>();
  for (const order of completedSales(orders)) {
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      const entry = map.get(product.category) ?? { category: product.category, revenue: 0, units: 0 };
      entry.revenue += item.price * item.quantity;
      entry.units += item.quantity;
      map.set(product.category, entry);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

export interface ChannelStat {
  channel: "WALK-IN" | "ONLINE";
  revenue: number;
  orders: number;
  units: number;
}

export function salesByChannel(orders: Order[]): ChannelStat[] {
  const result: ChannelStat[] = [
    { channel: "WALK-IN", revenue: 0, orders: 0, units: 0 },
    { channel: "ONLINE", revenue: 0, orders: 0, units: 0 },
  ];
  for (const order of completedSales(orders)) {
    const entry = result.find((r) => r.channel === order.channel)!;
    entry.revenue += order.total;
    entry.orders += 1;
    entry.units += order.items.reduce((s, i) => s + i.quantity, 0);
  }
  return result;
}

export interface ProductStat {
  productId: string;
  name: string;
  units: number;
  revenue: number;
}

export function unitsSold(orders: Order[]) {
  const map = new Map<string, number>();
  for (const order of completedSales(orders)) {
    for (const item of order.items) {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
    }
  }
  return map;
}

export function productPerformance(orders: Order[], products: Product[]) {
  const sold = unitsSold(orders);
  const stats: ProductStat[] = products
    .filter((p) => !p.archived)
    .map((p) => ({
      productId: p.id,
      name: p.name,
      units: sold.get(p.id) ?? 0,
      revenue: (sold.get(p.id) ?? 0) * p.price,
    }));
  return stats.sort((a, b) => b.units - a.units);
}

export function wastagePerProduct(inventoryItems: { productId: string; movements: { type: string; quantity: number }[] }[]) {
  return inventoryItems.map((inv) => ({
    productId: inv.productId,
    wasted: inv.movements
      .filter((m) => m.type === "WASTED")
      .reduce((s, m) => s + m.quantity, 0),
  }));
}

/* ------------------------------------------------------------------ */
/* Unsold products (end-of-shift write-offs)                           */
/* ------------------------------------------------------------------ */

/** Units discarded at closing time, bucketed per local day. */
export function dailyUnsold(inventory: InventoryItem[], days = 30, now = new Date()) {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    buckets.set(toDateKey(d.toISOString()), 0);
  }
  for (const inv of inventory) {
    for (const m of inv.movements) {
      if (m.type !== "WASTED") continue;
      const key = toDateKey(m.date);
      const bucket = buckets.get(key);
      if (bucket === undefined) continue; // outside the window
      buckets.set(key, bucket + m.quantity);
    }
  }
  return [...buckets.entries()].map(([date, units]) => ({ date, units }));
}

export interface SellThroughStat {
  productId: string;
  name: string;
  sold: number;
  wasted: number;
  soldPct: number;
  wastedPct: number;
}

/**
 * Per-product share of sold vs unsold (written off) over the window —
 * batch-baked goods only, since drinks are prepared to order.
 */
export function productSellThrough(
  orders: Order[],
  inventory: InventoryItem[],
  products: Product[],
  days = 30,
  now = new Date(),
): SellThroughStat[] {
  const cutoff = now.getTime() - days * 24 * 3600 * 1000;
  const sold = new Map<string, number>();
  for (const order of completedSales(orders)) {
    if (new Date(order.createdAt).getTime() < cutoff) continue;
    for (const item of order.items) {
      sold.set(item.productId, (sold.get(item.productId) ?? 0) + item.quantity);
    }
  }
  const wasted = new Map<string, number>();
  for (const inv of inventory) {
    for (const m of inv.movements) {
      if (m.type !== "WASTED" || new Date(m.date).getTime() < cutoff) continue;
      wasted.set(inv.productId, (wasted.get(inv.productId) ?? 0) + m.quantity);
    }
  }
  return products
    .filter((p) => !p.archived && !isMadeToOrder(p.category))
    .map((p) => {
      const s = sold.get(p.id) ?? 0;
      const w = wasted.get(p.id) ?? 0;
      const total = s + w;
      return {
        productId: p.id,
        name: p.name,
        sold: s,
        wasted: w,
        soldPct: total ? (s / total) * 100 : 100,
        wastedPct: total ? (w / total) * 100 : 0,
      };
    });
}
