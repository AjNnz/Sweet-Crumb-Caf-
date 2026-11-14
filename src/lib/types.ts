export type Role = "ADMIN" | "STAFF" | "RIDER" | "CUSTOMER";

export type ProductCategory =
  | "Cupcakes"
  | "Cakes"
  | "Pastries"
  | "Coffee"
  | "Other Drinks";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Cupcakes",
  "Cakes",
  "Pastries",
  "Coffee",
  "Other Drinks",
];

/**
 * Drinks are prepared to order at the counter, so they aren't tracked as
 * finite counter stock the way batch-baked goods are.
 */
export const MADE_TO_ORDER_CATEGORIES: ProductCategory[] = ["Coffee", "Other Drinks"];

export function isMadeToOrder(category: ProductCategory) {
  return MADE_TO_ORDER_CATEGORIES.includes(category);
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  /** Emoji placeholder used for the mock image. Replace with real URLs later. */
  emoji: string;
  /** Optional real photo (path under /public). Null/absent → show the emoji. */
  imageUrl?: string;
  available: boolean;
  archived?: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  /** Snapshot of name and price at the time of sale */
  name: string;
  price: number;
  quantity: number;
}

export type OrderChannel = "WALK-IN" | "ONLINE";

export type PaymentMethod = "CASH" | "GCASH" | "CARD" | "CASH ON PICKUP" | "CASH ON DELIVERY";

/** Flat fee added to DELIVERY orders (pickup is free). */
export const DELIVERY_FEE = 49;

/** Progress of the delivery leg — only used when fulfillment.mode is DELIVERY. */
export type DeliveryStatus =
  | "QUEUED" // waiting for a rider to claim
  | "CLAIMED" // a rider accepted it
  | "OUT_FOR_DELIVERY" // rider is on the way
  | "DELIVERED"; // handed to the customer

export type PaymentStatus = "PAID" | "PENDING" | "UNPAID" | "REFUNDED";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export interface Order {
  id: string;
  /** Human-friendly reference, e.g. ORD-000123 */
  reference: string;
  channel: OrderChannel;
  customerId?: string;
  customerName: string;
  customerContact?: string;
  /** Fulfilment info for online orders */
  fulfillment?: {
    mode: "PICKUP" | "DELIVERY";
    address?: string;
    notes?: string;
  };
  /** Delivery-leg tracking — present once an order is placed for DELIVERY */
  deliveryStatus?: DeliveryStatus;
  /** Rider (User id) currently handling the delivery */
  riderId?: string;
  /** Flat delivery fee added on top of the subtotal for DELIVERY orders */
  deliveryFee?: number;
  deliveredAt?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  completedAt?: string;
  /** When the customer cancelled — cancelled orders are trashed a day later. */
  cancelledAt?: string;
  /** POS fields */
  amountReceived?: number;
  change?: number;
  /** Whether inventory has already been deducted for this order */
  stockAffected: boolean;
}

/**
 * A transaction is a completed (paid) sale. We keep them as part of the order
 * record — the same structure powers POS tickets, online orders and the
 * transaction history / analytics, guaranteeing one shared source of truth.
 */
export type Transaction = Order;

export interface InventoryMovement {
  id: string;
  date: string;
  type: "ADD" | "SOLD" | "WASTED" | "ADJUSTMENT";
  quantity: number; // positive number; direction comes from `type`
  note?: string;
}

export interface InventoryItem {
  productId: string;
  /** Quantity of finished product ready for sale */
  quantity: number;
  lowStockThreshold: number;
  lastUpdated: string;
  movements: InventoryMovement[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  /** Mock only — under real auth the bcrypt hash never leaves the server. */
  password?: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  contact?: string;
}

export interface Customer extends User {
  role: "CUSTOMER";
  contact?: string;
}

export interface CafeSettings {
  cafeName: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  currency: "PHP" | "USD";
}

export interface CartLine {
  productId: string;
  quantity: number;
}
