import type {
  CafeSettings,
  Customer,
  InventoryItem,
  InventoryMovement,
  Order,
  OrderChannel,
  OrderStatus,
  PaymentMethod,
  Product,
  User,
} from "./types";
import { DELIVERY_FEE, isMadeToOrder } from "./types";
import { seededRandom } from "./utils";

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export const SEED_USERS: User[] = [
  {
    id: "usr-001",
    name: "Angelito Reyes",
    email: "admin@cafe.com",
    password: "admin123",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "usr-002",
    name: "Maria Santos",
    email: "staff@cafe.com",
    password: "staff123",
    role: "STAFF",
    status: "ACTIVE",
    createdAt: "2026-08-05T09:00:00.000Z",
  },
  {
    id: "usr-003",
    name: "Kevin Cruz",
    email: "kevin@cafe.com",
    password: "staff123",
    role: "STAFF",
    status: "ACTIVE",
    createdAt: "2026-09-12T09:00:00.000Z",
  },
  {
    id: "usr-004",
    name: "Marco Villanueva",
    email: "rider@cafe.com",
    password: "rider123",
    role: "RIDER",
    status: "ACTIVE",
    contact: "0918 442 1010",
    createdAt: "2026-09-15T09:00:00.000Z",
  },
  {
    id: "usr-005",
    name: "Jun Aguilar",
    email: "jun.rider@cafe.com",
    password: "rider123",
    role: "RIDER",
    status: "ACTIVE",
    contact: "0918 777 2020",
    createdAt: "2026-10-02T09:00:00.000Z",
  },
];

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: "cus-001",
    name: "Jasmine De la Cruz",
    email: "jasmine@gmail.com",
    password: "customer123",
    role: "CUSTOMER",
    status: "ACTIVE",
    contact: "0917 555 1234",
    createdAt: "2026-09-20T10:00:00.000Z",
  },
  {
    id: "cus-002",
    name: "Paolo Mendoza",
    email: "paolo@gmail.com",
    password: "customer123",
    role: "CUSTOMER",
    status: "ACTIVE",
    contact: "0921 222 8877",
    createdAt: "2026-10-08T14:00:00.000Z",
  },
];

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const SEED_SETTINGS: CafeSettings = {
  cafeName: "Sweet Crumb Café",
  address: "BangBang, Cordova, Cebu",
  phone: "(02) 8123 4567",
  email: "hello@sweetcrumb.ph",
  openingHours: "8:00 AM – 9:00 PM daily",
  currency: "PHP",
};

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export const SEED_PRODUCTS: Product[] = [
  // Cupcakes
  { id: "prd-001", name: "Classic Chocolate Cupcake", category: "Cupcakes", price: 65, description: "Rich chocolate cupcake with fudge frosting.", emoji: "🧁", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-002", name: "Red Velvet Cupcake", category: "Cupcakes", price: 75, description: "Velvety red sponge with cream cheese frosting.", emoji: "🧁", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-003", name: "Salted Caramel Cupcake", category: "Cupcakes", price: 80, description: "Caramel drizzled cupcake with sea salt flakes.", emoji: "🧁", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-004", name: "Vanilla Bean Cupcake", category: "Cupcakes", price: 60, description: "Light vanilla sponge with buttercream swirl.", emoji: "🧁", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  // Cakes
  { id: "prd-005", name: "Chocolate Dream Cake (Slice)", category: "Cakes", price: 140, description: "Moist chocolate layer cake with ganache.", emoji: "🍰", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-006", name: "Blueberry Cheesecake (Slice)", category: "Cakes", price: 165, description: "Creamy baked cheesecake with blueberry compote.", emoji: "🍰", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-007", name: "Whole Carrot Cake", category: "Cakes", price: 720, description: "Walnut carrot cake with cream cheese frosting. Good for sharing.", emoji: "🎂", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-008", name: "Mocha Torte (Slice)", category: "Cakes", price: 150, description: "Coffee-infused layers with mocha buttercream.", emoji: "🍰", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  // Pastries
  { id: "prd-009", name: "Butter Croissant", category: "Pastries", price: 85, description: "Flaky, buttery, baked fresh each morning.", emoji: "🥐", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-010", name: "Cinnamon Roll", category: "Pastries", price: 95, description: "Soft roll with cinnamon sugar and glaze.", emoji: "🥮", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-011", name: "Ube Ensaymada", category: "Pastries", price: 70, description: "Filipino favorite with ube halaya and cheese.", emoji: "🥠", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-012", name: "Chocolate Chip Cookie", category: "Pastries", price: 55, description: "Chewy cookie loaded with cocoa chunks.", emoji: "🍪", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  // Coffee
  { id: "prd-013", name: "Hot Americano", category: "Coffee", price: 90, description: "Smooth double shot of house espresso.", emoji: "☕", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-014", name: "Café Latte", category: "Coffee", price: 120, description: "Steamed milk over espresso with latte art.", emoji: "☕", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-015", name: "Salted Caramel Macchiato", category: "Coffee", price: 135, description: "Espresso, milk, caramel and a pinch of salt.", emoji: "☕", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-016", name: "Cold Brew", category: "Coffee", price: 110, description: "Slow-steeped 18-hour cold brew over ice.", emoji: "🧋", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  // Other Drinks
  { id: "prd-017", name: "Iced Matcha Latte", category: "Other Drinks", price: 130, description: "Ceremonial matcha with milk and ice.", emoji: "🍵", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-018", name: "Strawberry Frappe", category: "Other Drinks", price: 125, description: "Blended strawberry with whipped cream.", emoji: "🥤", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-019", name: "Hot Chocolate", category: "Other Drinks", price: 105, description: "Belgian cocoa with steamed milk.", emoji: "🍫", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
  { id: "prd-020", name: "Calamansi Cooler", category: "Other Drinks", price: 85, description: "Refreshing citrus cooler with mint.", emoji: "🍹", available: true, createdAt: "2026-08-01T09:00:00.000Z" },
];

/* ------------------------------------------------------------------ */
/* Inventory                                                           */
/* ------------------------------------------------------------------ */

const BASE_STOCK: Record<string, { qty: number; lowStockThreshold: number }> = {
  // Batch-baked goods only — drinks are prepared to order and not tracked
  "prd-001": { qty: 24, lowStockThreshold: 8 },
  "prd-002": { qty: 18, lowStockThreshold: 6 },
  "prd-003": { qty: 15, lowStockThreshold: 5 },
  "prd-004": { qty: 20, lowStockThreshold: 8 },
  "prd-005": { qty: 14, lowStockThreshold: 5 },
  "prd-006": { qty: 3, lowStockThreshold: 4 }, // intentionally low stock
  "prd-007": { qty: 1, lowStockThreshold: 2 }, // intentionally critical
  "prd-008": { qty: 11, lowStockThreshold: 4 },
  "prd-009": { qty: 30, lowStockThreshold: 10 },
  "prd-010": { qty: 22, lowStockThreshold: 8 },
  "prd-011": { qty: 26, lowStockThreshold: 10 },
  "prd-012": { qty: 40, lowStockThreshold: 12 },
};

export function buildSeedInventory(): InventoryItem[] {
  const now = new Date();
  // Drinks are prepared to order — only batch-baked goods carry counter stock
  const items: InventoryItem[] = SEED_PRODUCTS.filter((p) => !isMadeToOrder(p.category)).map((p, i) => {
    const { qty, lowStockThreshold } = BASE_STOCK[p.id];
    const updated = new Date(now.getTime() - i * 3.5 * 3600 * 1000).toISOString();
    return {
      productId: p.id,
      quantity: qty,
      lowStockThreshold,
      lastUpdated: updated,
      movements: p.available
        ? [
            {
              id: `mov-${p.id}-0`,
              date: updated,
              type: "ADD",
              quantity: qty,
              note: "Opening stock loaded",
            },
          ]
        : [],
    };
  });
  // Historic end-of-shift write-offs power the unsold-products analytics
  return ensureEndOfShiftWaste(items);
}

/* ------------------------------------------------------------------ */
/* Historical orders (last 60 days, deterministic)                     */
/* ------------------------------------------------------------------ */

const DAYS_OF_HISTORY = 60;

interface EngineConfig {
  /** Average daily pieces sold when the product is "healthy" */
  base: number;
  /** Multiplier applied in the most recent 10 days (creates the trend the forecast should detect) */
  trend: number;
}

/** Deliberate business pattern: drinks & cupcakes sell a lot, a few items lag */
const DEMAND_ENGINE: Record<string, EngineConfig> = {
  "prd-001": { base: 6, trend: 1.35 },
  "prd-002": { base: 4, trend: 1.2 },
  "prd-003": { base: 3, trend: 0.9 },
  "prd-004": { base: 2, trend: 1.0 },
  "prd-005": { base: 3, trend: 1.25 },
  "prd-006": { base: 2, trend: 1.0 },
  "prd-007": { base: 0.4, trend: 1.0 },
  "prd-008": { base: 1.2, trend: 0.7 },
  "prd-009": { base: 5, trend: 1.15 },
  "prd-010": { base: 3, trend: 1.05 },
  "prd-011": { base: 3, trend: 0.75 },
  "prd-012": { base: 4, trend: 1.1 },
  "prd-013": { base: 8, trend: 1.2 },
  "prd-014": { base: 7, trend: 1.4 },
  "prd-015": { base: 5, trend: 1.3 },
  "prd-016": { base: 4, trend: 1.25 },
  "prd-017": { base: 3, trend: 0.9 },
  "prd-018": { base: 2, trend: 0.8 },
  "prd-019": { base: 4, trend: 1.15 },
  "prd-020": { base: 1.5, trend: 0.6 },
};

/* ------------------------------------------------------------------ */
/* End-of-shift unsold (waste) history                                 */
/* ------------------------------------------------------------------ */

const WASTE_HISTORY_DAYS = 60;
/** Note stamped on every auto-generated end-of-shift write-off. */
const END_OF_SHIFT_NOTE = "End of shift";

/** Stable per-product/day PRNG — the same numbers on every run. */
function wasteRand(productId: string, dayIndex: number) {
  let hash = 2166136261;
  const key = `${productId}::${dayIndex}`;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return seededRandom(hash >>> 0);
}

/**
 * Evening write-offs for one batch-baked product: whatever the counter could
 * not sell is discarded at closing. The slower the product, the likelier
 * unsold pieces pile up (≈5%–32% of days); most product-days record nothing.
 */
function buildEndOfShiftMovements(productId: string, dailyDemand: number): InventoryMovement[] {
  const movements: InventoryMovement[] = [];
  const chanceOfWaste = Math.min(0.32, Math.max(0.05, 0.3 - dailyDemand * 0.04));
  for (let day = 1; day <= WASTE_HISTORY_DAYS; day++) {
    const rand = wasteRand(productId, day);
    if (rand() >= chanceOfWaste) continue; // sold out — nothing written off
    const when = new Date();
    when.setDate(when.getDate() - day);
    when.setHours(21, 0, 0, 0); // recorded after closing
    // Whole cakes write off one at a time; small items 1–3 pieces on slow days
    const quantity =
      productId === "prd-007" ? 1 : 1 + Math.floor(rand() * (dailyDemand < 1.5 ? 3 : 2));
    movements.push({
      id: `mov-${productId}-eos-${day}`,
      date: when.toISOString(),
      type: "WASTED",
      quantity,
      note: END_OF_SHIFT_NOTE,
    });
  }
  return movements;
}

/**
 * Idempotently backfill end-of-shift waste history into a persisted store
 * (older saves predate the unsold-products analytics). Stores that already
 * carry "End of shift" movements are returned untouched.
 */
export function ensureEndOfShiftWaste(inventory: InventoryItem[]): InventoryItem[] {
  if (inventory.some((inv) => inv.movements.some((m) => m.note === END_OF_SHIFT_NOTE))) {
    return inventory;
  }
  return inventory.map((inv) => {
    const demand = DEMAND_ENGINE[inv.productId]?.base ?? 1;
    return { ...inv, movements: [...inv.movements, ...buildEndOfShiftMovements(inv.productId, demand)] };
  });
}

const WALK_IN_NAMES = ["Walk-in Guest"];

export function buildSeedOrders(): Order[] {
  const rand = seededRandom(20260202);
  const orders: Order[] = [];
  let seq = 1;
  const now = new Date();

  for (let day = DAYS_OF_HISTORY - 1; day >= 0; day--) {
    const isToday = day === 0;
    // Cafe is closed on Mondays (weekday 1) some weeks → natural weekly rhythm
    const date = new Date(now.getTime() - day * 24 * 3600 * 1000);
    const weekday = date.getDay();
    const dayFactor = weekday === 0 || weekday === 6 ? 1.35 : weekday === 3 ? 0.75 : 1;

    // Group pieces sold today into transactions
    const basket: { productId: string; quantity: number }[] = [];
    for (const [productId, cfg] of Object.entries(DEMAND_ENGINE)) {
      const trend = day < 10 ? cfg.trend : 1;
      const expected = cfg.base * dayFactor * trend;
      let sold = Math.floor(expected);
      if (rand() < expected - Math.floor(expected)) sold += 1;
      for (let q = 0; q < sold; q++) {
        const existing = basket.find((b) => b.productId === productId);
        // Split large counts into separate transactions like a real counter
        if (existing && existing.quantity >= 2) {
          flush(basket, rand, isToday, date, orders, seq++);
          basket.length = 0;
        }
        const again = basket.find((b) => b.productId === productId);
        if (again) again.quantity += 1;
        else basket.push({ productId, quantity: 1 });
      }
    }
    if (basket.length) {
      flush(basket, rand, isToday, date, orders, seq++);
      basket.length = 0;
    }
  }

  // A handful of realistic ONLINE orders
  const onlineSeed: Array<[number, string, string, OrderStatus, PaymentMethod]> = [
    [3, "cus-001", "Jasmine De la Cruz", "COMPLETED", "GCASH"],
    [6, "cus-002", "Paolo Mendoza", "COMPLETED", "CASH ON PICKUP"],
    [8, "cus-001", "Jasmine De la Cruz", "COMPLETED", "GCASH"],
    [1, "Guest", "Online Guest", "PENDING", "CASH ON PICKUP"],
    [0, "cus-002", "Paolo Mendoza", "COMPLETED", "GCASH"],
  ];
  for (const [daysAgo, customerId, name, status, method] of onlineSeed) {
    const date = new Date(now.getTime() - (daysAgo * 24 - 3) * 3600 * 1000);
    const picks = shuffle(rand, ["prd-001", "prd-009", "prd-014", "prd-005", "prd-012", "prd-016"]).slice(
      0,
      2 + Math.floor(rand() * 3),
    );
    const items = picks.map((productId) => {
      const p = SEED_PRODUCTS.find((x) => x.id === productId)!;
      return { productId, name: p.name, price: p.price, quantity: 1 + Math.floor(rand() * 3) };
    });
    orders.push({
      id: `ord-${String(seq++).padStart(6, "0")}`,
      reference: `ORD-${String(seq - 1).padStart(6, "0")}`,
      channel: "ONLINE",
      customerId: customerId.startsWith("cus-") ? customerId : undefined,
      customerName: name,
      customerContact: customerId.startsWith("cus-") ? "0917 555 1234" : "0918 222 4455",
      fulfillment: { mode: "PICKUP" },
      items,
      ...totals(items),
      paymentMethod: method,
      paymentStatus: status === "COMPLETED" ? "PAID" : "PENDING",
      orderStatus: status,
      createdAt: date.toISOString(),
      completedAt: status === "COMPLETED" ? new Date(date.getTime() + 2 * 3600 * 1000).toISOString() : undefined,
      stockAffected: status === "COMPLETED",
    });
  }

  // DELIVERY orders in every stage of the delivery leg, so the rider board
  // and customer tracking have meaningful data on first load.
  const deliverySeed: Array<{
    hoursAgo: number;
    customerId?: string;
    name: string;
    contact: string;
    address: string;
    orderStatus: OrderStatus;
    paymentMethod: PaymentMethod;
    deliveryStatus: Order["deliveryStatus"];
    riderId?: string;
  }> = [
    {
      hoursAgo: 2,
      name: "Elena Ramos",
      contact: "0927 310 4455",
      address: "25 M.L. Quezon St, Poblacion, Cordova, Cebu",
      orderStatus: "PENDING",
      paymentMethod: "GCASH",
      deliveryStatus: "QUEUED",
    },
    {
      hoursAgo: 1,
      customerId: "cus-002",
      name: "Paolo Mendoza",
      contact: "0921 222 8877",
      address: "Unit 7B, Vista Mar Residences, Brgy. Gabi, Cordova, Cebu",
      orderStatus: "READY",
      paymentMethod: "GCASH",
      deliveryStatus: "QUEUED",
    },
    {
      hoursAgo: 1.25,
      name: "Renee Castillo",
      contact: "0939 118 7766",
      address: "14 Mactan Circumferential Road, Brgy. Ibabao, Lapu-Lapu City, Cebu",
      orderStatus: "CONFIRMED",
      paymentMethod: "CASH ON DELIVERY",
      deliveryStatus: "QUEUED",
    },
    {
      hoursAgo: 3,
      name: "Dan Salazar",
      contact: "0917 909 3344",
      address: "6 Cogon Road, Brgy. Cogon, Cordova, Cebu",
      orderStatus: "READY",
      paymentMethod: "CASH ON DELIVERY",
      deliveryStatus: "OUT_FOR_DELIVERY",
      riderId: "usr-005",
    },
    {
      hoursAgo: 5,
      customerId: "cus-001",
      name: "Jasmine De la Cruz",
      contact: "0917 555 1234",
      address: "18 San Miguel St, Brgy. San Miguel, Cordova, Cebu",
      orderStatus: "COMPLETED",
      paymentMethod: "CASH ON DELIVERY",
      deliveryStatus: "DELIVERED",
      riderId: "usr-004",
    },
  ];
  for (const seed of deliverySeed) {
    const date = new Date(now.getTime() - seed.hoursAgo * 3600 * 1000);
    const picks = shuffle(rand, ["prd-014", "prd-009", "prd-002", "prd-018", "prd-011", "prd-013"]).slice(
      0,
      2 + Math.floor(rand() * 2),
    );
    const items = picks.map((productId) => {
      const p = SEED_PRODUCTS.find((x) => x.id === productId)!;
      return { productId, name: p.name, price: p.price, quantity: 1 + Math.floor(rand() * 2) };
    });
    const delivered = seed.deliveryStatus === "DELIVERED";
    const paid = seed.paymentMethod !== "CASH ON DELIVERY" || delivered;
    orders.push({
      id: `ord-${String(seq).padStart(6, "0")}`,
      reference: `ORD-${String(seq++).padStart(6, "0")}`,
      channel: "ONLINE",
      customerId: seed.customerId,
      customerName: seed.name,
      customerContact: seed.contact,
      fulfillment: { mode: "DELIVERY", address: seed.address },
      deliveryStatus: seed.deliveryStatus,
      riderId: seed.riderId,
      deliveryFee: DELIVERY_FEE,
      items,
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      total: items.reduce((s, i) => s + i.price * i.quantity, 0) + DELIVERY_FEE,
      paymentMethod: seed.paymentMethod,
      paymentStatus: paid ? "PAID" : "PENDING",
      orderStatus: seed.orderStatus,
      createdAt: date.toISOString(),
      completedAt: delivered ? new Date(date.getTime() + 40 * 60 * 1000).toISOString() : undefined,
      deliveredAt: delivered ? new Date(date.getTime() + 40 * 60 * 1000).toISOString() : undefined,
      stockAffected: delivered,
    });
  }

  return orders;
}

function flush(
  basket: { productId: string; quantity: number }[],
  rand: () => number,
  isToday: boolean,
  date: Date,
  orders: Order[],
  seq: number,
) {
  if (!basket.length) return;
  const channel: OrderChannel = rand() < 0.65 ? "WALK-IN" : "ONLINE";
  const customer = channel === "ONLINE"
    ? rand() < 0.5 ? "Jasmine De la Cruz" : "Paolo Mendoza"
    : WALK_IN_NAMES[Math.floor(rand() * WALK_IN_NAMES.length)];
  const hour = 8 + Math.floor(rand() * 13);
  const minute = Math.floor(rand() * 60);
  let stamped = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    isToday ? Math.min(hour, new Date().getHours()) : hour,
    minute,
  );
  // "Today" tickets must never be stamped in the future — that would rank
  // them above orders the customer really just placed.
  if (isToday && stamped.getTime() > Date.now()) stamped = new Date(Date.now() - rand() * 3_600_000);
  const createdAt = stamped.toISOString();

  const items = basket.map((b) => {
    const p = SEED_PRODUCTS.find((x) => x.id === b.productId)!;
    return { productId: p.id, name: p.name, price: p.price, quantity: b.quantity };
  });
  const method: PaymentMethod = channel === "ONLINE" ? (rand() < 0.6 ? "GCASH" : "CASH ON PICKUP") : rand() < 0.75 ? "CASH" : "GCASH";
  const paid = channel === "WALK-IN" || rand() < 0.8;

  orders.push({
    id: `ord-${String(seq).padStart(6, "0")}`,
    reference: `ORD-${String(seq).padStart(6, "0")}`,
    channel,
    customerId: customer.includes("Jasmine") ? "cus-001" : customer.includes("Paolo") ? "cus-002" : undefined,
    customerName: customer,
    customerContact: customer === "Walk-in Guest" ? undefined : "0917 000 0000",
    fulfillment: channel === "ONLINE" ? { mode: "PICKUP" } : undefined,
    items,
    ...totals(items),
    paymentMethod: method,
    paymentStatus: paid ? "PAID" : "PENDING",
    orderStatus: paid ? "COMPLETED" : rand() < 0.5 ? "CANCELLED" : "PENDING",
    createdAt,
    completedAt: paid ? createdAt : undefined,
    stockAffected: paid,
  });
}

function shuffle<T>(rand: () => number, arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function totals(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { subtotal, total: subtotal };
}
