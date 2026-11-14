import type { DeliveryStatus, Order, OrderChannel, OrderStatus, PaymentStatus } from "./types";

/**
 * The delivery leg only starts once the cafe finishes preparing the food
 * (orderStatus READY). Before that there is no rider stage to show — the
 * order is still in the kitchen. Returns null when no rider stage applies yet.
 */
export function deliveryStageOf(order: Order): DeliveryStatus | null {
  if (order.fulfillment?.mode !== "DELIVERY") return null;
  const status = order.deliveryStatus ?? "QUEUED";
  if (status === "QUEUED" && order.orderStatus !== "READY" && order.orderStatus !== "COMPLETED") return null;
  return status;
}

/** Join conditional class names — tiny replacement for clsx. */
export function cn(...classes: Array<string | false | null | undefined>) {
  const tokens = classes
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean);
  // Keep only the LAST width utility, so a caller's `w-40` overrides a base
  // class `w-full` regardless of Tailwind's stylesheet order.
  const lastWidth = tokens.reduce((last, t, i) => (/^w-./.test(t) ? i : last), -1);
  return tokens.filter((t, i) => !/^w-./.test(t) || i === lastWidth).join(" ");
}

export function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(n: number) {
  return n.toLocaleString("en-PH");
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Placeholder/legacy guest names that normalize to a channel-specific label. */
const GUEST_NAMES = new Set(["Guest", "Walk-in Guest", "Online Guest"]);

/**
 * Guest naming convention: "Walk-in Guest" on the WALK-IN channel and
 * "Online Guest" on the ONLINE channel. Older seed/localStorage data may
 * say just "Guest" — normalize to the channel-appropriate label at display time.
 */
export function displayCustomerName(name: string, channel: OrderChannel) {
  if (!GUEST_NAMES.has(name)) return name;
  return channel === "WALK-IN" ? "Walk-in Guest" : "Online Guest";
}

/* ------------------------------------------------------------------ */
/* Statuses                                                            */
/* ------------------------------------------------------------------ */

export const ORDER_STATUS_STYLES: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
  },
  PREPARING: {
    label: "Preparing",
    className: "bg-indigo-100 text-indigo-800",
    dot: "bg-indigo-500",
  },
  READY: {
    label: "Ready",
    className: "bg-teal-100 text-teal-800",
    dot: "bg-teal-500",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

export const PAYMENT_STATUS_STYLES: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PAID: { label: "Paid", className: "bg-emerald-100 text-emerald-800" },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  UNPAID: { label: "Unpaid", className: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", className: "bg-stone-200 text-stone-700" },
};

export const DELIVERY_STATUS_STYLES: Record<
  DeliveryStatus,
  { label: string; emoji: string; className: string; dot: string }
> = {
  QUEUED: {
    label: "Waiting for rider",
    emoji: "🛵",
    className: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  CLAIMED: {
    label: "Rider assigned",
    emoji: "🙋",
    className: "bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    emoji: "🛵",
    className: "bg-indigo-100 text-indigo-800",
    dot: "bg-indigo-500",
  },
  DELIVERED: {
    label: "Delivered",
    emoji: "✅",
    className: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
};

/** Mulberry32 — deterministic PRNG so seed data is identical on server & client. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
