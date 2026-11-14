"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  CafeSettings,
  CartLine,
  Customer,
  DeliveryStatus,
  InventoryItem,
  InventoryMovement,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  User,
} from "@/lib/types";
import { isMadeToOrder } from "@/lib/types";

/* ================================================================== */
/* THE STORE — now a thin, honest client over the real REST API.       */
/*                                                                     */
/* The mock kept everything in localStorage and mutated local arrays.  */
/* This version keeps the SAME state shape and the SAME action names,  */
/* so no screen had to change — but every action is now a fetch to     */
/* /api/*, and the server's response is the only source of truth.      */
/* There are no optimistic updates: nothing changes locally unless the */
/* server confirmed it. Errors travel back to the caller unchanged.    */
/* ================================================================== */

/** Settings shown before the first load completes (same values as the seed). */
const FALLBACK_SETTINGS: CafeSettings = {
  cafeName: "Sweet Crumb Café",
  address: "BangBang, Cordova, Cebu",
  phone: "(02) 8123 4567",
  email: "hello@sweetcrumb.ph",
  openingHours: "8:00 AM – 9:00 PM daily",
  currency: "PHP",
};

/** Per-tab cart (sessionStorage) — carts are UI state, not server data. */
const CART_KEY = "cafe-system-cart-v1";

/* ------------------------------------------------------------------ */
/* Row types — the shapes the API actually returns (Prisma rows with   */
/* dates as ISO strings). Mappers convert them into the frontend's     */
/* types so every screen keeps working unchanged.                      */
/* ------------------------------------------------------------------ */

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  status: "ACTIVE" | "INACTIVE";
  contact: string | null;
  createdAt: string;
};

type ApiProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  emoji: string;
  imageUrl: string | null;
  available: boolean;
  archived: boolean;
  createdAt: string;
  inventory: { quantity: number; lowStockThreshold: number; lastUpdated: string } | null;
};

type ApiInventoryItem = {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  lastUpdated: string;
  movements: Array<{ id: string; date: string; type: string; quantity: number; note: string | null }>;
};

type ApiOrder = {
  id: string;
  reference: string;
  channel: string;
  customerId: string | null;
  customerName: string;
  customerContact: string | null;
  fulfillmentMode: string;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  deliveryFee: number;
  deliveryStatus: string | null;
  riderId: string | null;
  deliveredAt: string | null;
  subtotal: number;
  total: number;
  amountReceived: number | null;
  change: number | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  stockAffected: boolean;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  items: Array<{ productId: string; name: string; price: number; quantity: number }>;
};

/* ---------------- mappers: API rows → frontend types ---------------- */

function toUser(row: ApiUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    contact: row.contact ?? undefined,
    createdAt: row.createdAt,
  };
}

function toProduct(row: ApiProduct): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Product["category"],
    price: row.price,
    description: row.description,
    emoji: row.emoji,
    imageUrl: row.imageUrl ?? undefined, // keep both: emoji is the fallback visual
    available: row.available,
    archived: row.archived,
    createdAt: row.createdAt,
  };
}

/** Customers can't call /api/inventory — their stock view is derived from
 * the public products payload (quantities only, no movement history). */
function inventoryFromProduct(row: ApiProduct): InventoryItem | null {
  if (!row.inventory) return null; // drinks are made to order — no stock row
  return {
    productId: row.id,
    quantity: row.inventory.quantity,
    lowStockThreshold: row.inventory.lowStockThreshold,
    lastUpdated: row.inventory.lastUpdated,
    movements: [],
  };
}

function toInventoryItem(row: ApiInventoryItem): InventoryItem {
  return {
    productId: row.productId,
    quantity: row.quantity,
    lowStockThreshold: row.lowStockThreshold,
    lastUpdated: row.lastUpdated,
    movements: row.movements.map(
      (m): InventoryMovement => ({
        id: m.id,
        date: m.date,
        type: m.type as InventoryMovement["type"],
        quantity: m.quantity,
        note: m.note ?? undefined,
      }),
    ),
  };
}

/** The nested `fulfillment` object the frontend knows is reassembled here
 * from the flattened database columns. */
function toOrder(row: ApiOrder): Order {
  return {
    id: row.id,
    reference: row.reference,
    channel: row.channel as Order["channel"],
    customerId: row.customerId ?? undefined,
    customerName: row.customerName,
    customerContact: row.customerContact ?? undefined,
    fulfillment: {
      mode: row.fulfillmentMode as "PICKUP" | "DELIVERY",
      address: row.deliveryAddress ?? undefined,
      notes: row.deliveryNotes ?? undefined,
    },
    deliveryStatus: (row.deliveryStatus as DeliveryStatus) ?? undefined,
    riderId: row.riderId ?? undefined,
    deliveryFee: row.deliveryFee || undefined,
    deliveredAt: row.deliveredAt ?? undefined,
    items: row.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    subtotal: row.subtotal,
    total: row.total,
    paymentMethod: row.paymentMethod as PaymentMethod,
    paymentStatus: row.paymentStatus as PaymentStatus,
    orderStatus: row.orderStatus as OrderStatus,
    createdAt: row.createdAt,
    completedAt: row.completedAt ?? undefined,
    cancelledAt: row.cancelledAt ?? undefined,
    amountReceived: row.amountReceived ?? undefined,
    change: row.change ?? undefined,
    stockAffected: row.stockAffected,
  };
}

/* ------------------------------------------------------------------ */
/* Tiny fetch wrapper — one place that knows about JSON, errors and    */
/* network failures. Every action speaks in { ok, error?, data }.      */
/* ------------------------------------------------------------------ */

type ApiResult<T> = { ok: boolean; status: number; data: T | null; error?: string };

async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* empty body — fine */
    }
    if (res.ok) return { ok: true, status: res.status, data: data as T };
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed (${res.status}).`;
    return { ok: false, status: res.status, data: null, error: message };
  } catch {
    return { ok: false, status: 0, data: null, error: "Cannot reach the café server." };
  }
}

/** Available counter stock for a product — drinks are made to order (unlimited). */
function stockOf(state: StoreState, productId: string): number {
  const product = state.products.find((p) => p.id === productId);
  if (product && isMadeToOrder(product.category)) return Number.POSITIVE_INFINITY;
  return state.inventory.find((i) => i.productId === productId)?.quantity ?? 0;
}

/**
 * Everything the three role interfaces share lives here. The shapes are
 * the same ones the mock served — only the plumbing underneath changed.
 */
interface StoreState {
  products: Product[];
  inventory: InventoryItem[];
  orders: Order[];
  users: User[];
  customers: Customer[];
  cart: CartLine[];
  settings: CafeSettings;
  currentUserId: string | null;
  isHydrated: boolean;
}

interface StoreContextValue extends StoreState {
  // Derived helpers
  currentUser: User | null;
  cartLines: Array<{ product: Product; productId: string; quantity: number; lineTotal: number }>;
  cartCount: number;
  cartTotal: number;
  getStock: (productId: string) => number;
  getProduct: (productId: string) => Product | undefined;
  lowStockItems: InventoryItem[];
  myOrders: Order[];

  // Auth — every action that needs the server's answer is async now.
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; role?: User["role"] }>;
  registerCustomer: (input: {
    name: string;
    email: string;
    password: string;
    contact?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  /** Signed-in customer edits their own name / email / contact / password. */
  updateOwnProfile: (input: {
    name: string;
    email: string;
    contact?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  /** Demo forgot-password flow — the server verifies the email and sets a new password. */
  resetPassword: (email: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;

  // Cart
  addToCart: (productId: string, quantity?: number) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Orders
  placeOnlineOrder: (input: {
    customerName: string;
    customerContact?: string;
    paymentMethod: PaymentMethod;
    fulfillment?: { mode: "PICKUP" | "DELIVERY"; address?: string; notes?: string };
  }) => Promise<{ ok: boolean; error?: string; order?: Order }>;
  createWalkInOrder: (input: {
    items: OrderItem[];
    paymentMethod: PaymentMethod;
    amountReceived: number;
    customerName?: string;
  }) => Promise<{ ok: boolean; error?: string; order?: Order }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPayment: (orderId: string, paymentStatus: PaymentStatus) => void;
  /** Customer cancels their own online order — only before preparation starts. */
  cancelOwnOrder: (orderId: string) => Promise<{ ok: boolean; error?: string }>;
  /** Permanently trash a cancelled order. */
  deleteOrder: (orderId: string) => Promise<{ ok: boolean; error?: string }>;

  // Delivery (rider side)
  claimDeliveryOrder: (orderId: string) => Promise<{ ok: boolean; error?: string }>;
  startDelivery: (orderId: string) => Promise<{ ok: boolean; error?: string }>;
  completeDelivery: (orderId: string) => Promise<{ ok: boolean; error?: string }>;
  releaseDeliveryOrder: (orderId: string) => Promise<{ ok: boolean; error?: string }>;
  deliveryStatusOf: (order: Order) => DeliveryStatus;

  // Products
  saveProduct: (product: Partial<Product> & { id?: string }) => void;
  archiveProduct: (productId: string) => void;
  deleteProduct: (productId: string) => Promise<{ ok: boolean; error?: string }>;

  // Inventory
  adjustStock: (productId: string, type: InventoryMovement["type"], quantity: number, note?: string) => void;
  setLowStockThreshold: (productId: string, threshold: number) => void;

  // Staff & settings
  saveStaffMember: (input: {
    id?: string;
    name: string;
    email: string;
    role: User["role"];
    password?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  toggleStaffStatus: (userId: string) => void;
  updateSettings: (settings: Partial<CafeSettings>) => void;

  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function initialStore(): StoreState {
  return {
    products: [],
    inventory: [],
    orders: [],
    users: [],
    customers: [],
    cart: [],
    settings: FALLBACK_SETTINGS,
    currentUserId: null,
    isHydrated: false,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialStore);
  const stateRef = useRef(state);

  // Keep the ref in sync outside of render (used by event handlers only)
  useEffect(() => {
    stateRef.current = state;
  });

  // Every state change flows through here — and updates the ref IMMEDIATELY.
  // (Syncing the ref only in a render effect left it stale inside the same
  // async flow: right after login/hydration set the user, refreshOrders()
  // still saw currentUserId === null and silently skipped loading. The
  // smoke test caught this one too.)
  const patch = useCallback((updater: (prev: StoreState) => StoreState) => {
    const next = updater(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);

  /* ---------------- upsert helpers (apply one server row locally) ---------------- */

  const upsertProductRow = useCallback(
    (row: ApiProduct) => {
      patch((prev) => {
        const product = toProduct(row);
        const inv = inventoryFromProduct(row);
        const known = prev.products.some((p) => p.id === product.id);
        return {
          ...prev,
          products: known ? prev.products.map((p) => (p.id === product.id ? product : p)) : [...prev.products, product],
          inventory: inv
            ? prev.inventory.some((i) => i.productId === row.id)
              ? prev.inventory.map((i) => (i.productId === row.id ? { ...i, ...inv } : i))
              : [...prev.inventory, inv]
            : prev.inventory.filter((i) => i.productId !== row.id), // drinks have no stock row
        };
      });
    },
    [patch],
  );

  const upsertOrderRow = useCallback(
    (row: ApiOrder) => {
      const order = toOrder(row);
      patch((prev) => ({
        ...prev,
        orders: prev.orders.some((o) => o.id === order.id)
          ? prev.orders.map((o) => (o.id === order.id ? order : o))
          : [order, ...prev.orders],
      }));
    },
    [patch],
  );

  const upsertUserRow = useCallback(
    (row: ApiUser) => {
      const user = toUser(row);
      patch((prev) => {
        if (user.role === "CUSTOMER") {
          return {
            ...prev,
            customers: prev.customers.some((c) => c.id === user.id)
              ? prev.customers.map((c) => (c.id === user.id ? (user as Customer) : c))
              : [...prev.customers, user as Customer],
          };
        }
        return {
          ...prev,
          users: prev.users.some((u) => u.id === user.id)
            ? prev.users.map((u) => (u.id === user.id ? user : u))
            : [...prev.users, user],
        };
      });
    },
    [patch],
  );

  /* ---------------- server reads ---------------- */

  /** Public catalog — also rebuilds the customer's stock view. */
  const refreshCatalog = useCallback(async () => {
    const res = await api<ApiProduct[]>("/api/products");
    if (!res.ok || !res.data) return;
    const rows = res.data;
    patch((prev) => ({
      ...prev,
      products: rows.map(toProduct),
      inventory: rows
        .map(inventoryFromProduct)
        .filter((inv): inv is InventoryItem => inv !== null)
        .map((inv) => {
          // keep the movement history the staff inventory screen already loaded
          const known = prev.inventory.find((i) => i.productId === inv.productId);
          return known ? { ...inv, movements: known.movements } : inv;
        }),
    }));
  }, [patch]);

  const refreshSettings = useCallback(async () => {
    const res = await api<CafeSettings>("/api/settings");
    if (res.ok && res.data) patch((prev) => ({ ...prev, settings: res.data as CafeSettings }));
  }, [patch]);

  /** Role-filtered order list — the server decides what this session may see. */
  const refreshOrders = useCallback(async () => {
    if (!stateRef.current.currentUserId) return;
    const res = await api<ApiOrder[]>("/api/orders");
    if (!res.ok || !res.data) return;
    patch((prev) => ({ ...prev, orders: res.data!.map(toOrder) }));
  }, [patch]);

  /** Staff/admin stock view — same data plus the movement history. */
  const refreshInventory = useCallback(async () => {
    const res = await api<ApiInventoryItem[]>("/api/inventory");
    if (!res.ok || !res.data) return; // customers get 403 — their derived view stands
    patch((prev) => ({ ...prev, inventory: res.data!.map(toInventoryItem) }));
  }, [patch]);

  /** Account directory (team for staff/riders, everyone for the admin). */
  const refreshTeam = useCallback(async () => {
    const res = await api<ApiUser[]>("/api/users");
    if (!res.ok || !res.data) return;
    patch((prev) => ({
      ...prev,
      users: res.data!.filter((u) => u.role !== "CUSTOMER").map(toUser),
      customers: res.data!.filter((u) => u.role === "CUSTOMER").map(toUser) as Customer[],
    }));
  }, [patch]);

  const refreshAll = useCallback(async () => {
    const role = stateRef.current.users.find((u) => u.id === stateRef.current.currentUserId)?.role ??
      stateRef.current.customers.find((c) => c.id === stateRef.current.currentUserId)?.role;
    const jobs: Promise<void>[] = [refreshCatalog(), refreshSettings()];
    if (stateRef.current.currentUserId) {
      jobs.push(refreshOrders());
      if (role && role !== "CUSTOMER") {
        jobs.push(refreshTeam());
        if (role === "ADMIN" || role === "STAFF") jobs.push(refreshInventory());
      }
    }
    await Promise.allSettled(jobs);
  }, [refreshCatalog, refreshSettings, refreshOrders, refreshTeam, refreshInventory]);

  /* ---------------- hydration + light polling ---------------- */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Restore this tab's cart alongside the first server reads.
      let cart: StoreState["cart"] = [];
      try {
        const saved = window.sessionStorage.getItem(CART_KEY);
        if (saved) cart = JSON.parse(saved) as StoreState["cart"];
      } catch {
        /* ignore malformed cart */
      }

      // Who is this browser? (The httpOnly cookie answers for us.)
      const me = await api<ApiUser>("/api/auth/me");
      const [catalog, settings] = await Promise.all([api<ApiProduct[]>("/api/products"), api<CafeSettings>("/api/settings")]);
      if (cancelled) return;

      const meUser = me.ok && me.data ? toUser(me.data) : null;
      const hydrated: Partial<StoreState> = {
        products: catalog.ok && catalog.data ? catalog.data.map(toProduct) : [],
        inventory:
          catalog.ok && catalog.data
            ? (catalog.data.map(inventoryFromProduct).filter((inv): inv is InventoryItem => inv !== null) as InventoryItem[])
            : [],
        settings: settings.ok && settings.data ? (settings.data as CafeSettings) : FALLBACK_SETTINGS,
        currentUserId: meUser?.id ?? null,
        cart,
        isHydrated: true,
      };
      if (meUser) {
        hydrated.customers = meUser.role === "CUSTOMER" ? [meUser as Customer] : [];
        hydrated.users = meUser.role === "CUSTOMER" ? [] : [meUser];
      }
      // patch() (not setState) so stateRef.current is fresh when the
      // role-filtered reads below check currentUserId.
      patch((prev) => ({ ...prev, ...hydrated }));

      // Then everything the role is allowed to read.
      if (meUser) {
        const jobs: Promise<void>[] = [refreshOrders()];
        if (meUser.role !== "CUSTOMER") {
          jobs.push(refreshTeam());
          if (meUser.role === "ADMIN" || meUser.role === "STAFF") jobs.push(refreshInventory());
        }
        await Promise.allSettled(jobs);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // The mock synced tabs via localStorage events; the real backend needs
  // polling. Every 20 s (and on window focus) pull fresh catalog + orders —
  // so a rider board updates when staff advances a kitchen order elsewhere.
  useEffect(() => {
    const pull = () => {
      if (document.visibilityState !== "visible") return;
      if (!stateRef.current.isHydrated) return;
      void refreshCatalog();
      if (stateRef.current.currentUserId) void refreshOrders();
    };
    const timer = setInterval(pull, 20_000);
    window.addEventListener("focus", pull);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", pull);
    };
  }, [refreshCatalog, refreshOrders]);

  // Cart changes persist to THIS tab's sessionStorage. Only AFTER hydration —
  // otherwise the first render would overwrite the saved cart with [] before
  // the hydration effect gets a chance to restore it (a real bug the smoke
  // test caught: reload the page and the cart silently emptied itself).
  useEffect(() => {
    if (!state.isHydrated) return;
    try {
      window.sessionStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    } catch {
      /* ignore */
    }
  }, [state.cart, state.isHydrated]);

  /* ---------------- derived ---------------- */

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ??
    state.customers.find((c) => c.id === state.currentUserId) ?? null;

  const cartLines = useMemo(() => {
    return state.cart
      .map((line) => {
        const product = state.products.find((p) => p.id === line.productId);
        if (!product) return null;
        return {
          product,
          productId: line.productId,
          quantity: line.quantity,
          lineTotal: product.price * line.quantity,
        };
      })
      .filter(Boolean) as Array<{ product: Product; productId: string; quantity: number; lineTotal: number }>;
  }, [state.cart, state.products]);

  const cartTotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);
  const cartCount = state.cart.reduce((s, l) => s + l.quantity, 0);

  const getStock = useCallback((productId: string) => stockOf(state, productId), [state]);

  const getProduct = useCallback(
    (productId: string) => state.products.find((p) => p.id === productId),
    [state.products],
  );

  const lowStockItems = useMemo(
    () =>
      state.inventory.filter((inv) => {
        const product = state.products.find((p) => p.id === inv.productId);
        return product && !product.archived && product.available && inv.quantity <= inv.lowStockThreshold;
      }),
    [state.inventory, state.products],
  );

  // Customer's orders, most relevant first: in-progress orders on top
  // (newest first), then cancelled, then completed history.
  const myOrders = state.orders
    .filter((o) => o.customerId === state.currentUserId)
    .sort((a, b) => {
      const rank = (o: Order) => {
        if (o.orderStatus === "CANCELLED") return 1;
        if (o.orderStatus === "COMPLETED") return 2;
        return 0;
      };
      const byRank = rank(a) - rank(b);
      return byRank !== 0 ? byRank : b.createdAt.localeCompare(a.createdAt);
    });

  /* ---------------- auth actions ---------------- */

  const login: StoreContextValue["login"] = async (email, password) => {
    const res = await api<ApiUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok || !res.data) return { ok: false, error: res.error };
    const user = toUser(res.data);
    patch((prev) => ({
      ...prev,
      currentUserId: user.id,
      users: user.role === "CUSTOMER" ? prev.users : upsertInto(prev.users, user),
      customers: user.role === "CUSTOMER" ? upsertInto(prev.customers, user as Customer) : prev.customers,
      orders: [], // fresh slice for this role — refilled by refreshAll below
    }));
    await refreshAll();
    return { ok: true, role: user.role };
  };

  const registerCustomer: StoreContextValue["registerCustomer"] = async (input) => {
    const res = await api<ApiUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!res.ok || !res.data) return { ok: false, error: res.error };
    const user = toUser(res.data);
    patch((prev) => ({
      ...prev,
      currentUserId: user.id,
      customers: upsertInto(prev.customers, user as Customer),
      orders: [],
    }));
    await refreshCatalog();
    return { ok: true };
  };

  const updateOwnProfile: StoreContextValue["updateOwnProfile"] = async (input) => {
    const res = await api<ApiUser>("/api/auth/profile", { method: "PATCH", body: JSON.stringify(input) });
    if (!res.ok || !res.data) return { ok: false, error: res.error };
    upsertUserRow(res.data);
    return { ok: true };
  };

  const resetPassword: StoreContextValue["resetPassword"] = async (email, newPassword) => {
    const res = await api<{ reset: boolean }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, newPassword }),
    });
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true };
  };

  const logout = () => {
    void api("/api/auth/logout", { method: "POST" });
    patch((prev) => ({ ...prev, currentUserId: null, cart: [], orders: [], users: [], customers: [] }));
  };

  /* ---------------- cart actions (client-only UI state) ---------------- */

  const addToCart: StoreContextValue["addToCart"] = (productId, quantity = 1) =>
    patch((prev) => {
      const existing = prev.cart.find((l) => l.productId === productId);
      return {
        ...prev,
        cart: existing
          ? prev.cart.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l))
          : [...prev.cart, { productId, quantity }],
      };
    });

  const setCartQuantity: StoreContextValue["setCartQuantity"] = (productId, quantity) =>
    patch((prev) => ({
      ...prev,
      cart:
        quantity <= 0
          ? prev.cart.filter((l) => l.productId !== productId)
          : prev.cart.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    }));

  const removeFromCart: StoreContextValue["removeFromCart"] = (productId) =>
    patch((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.productId !== productId) }));

  const clearCart = () => patch((prev) => ({ ...prev, cart: [] }));

  /* ---------------- order actions ---------------- */

  // Guest checkout works too: without a session the server files the order
  // under customerId = null; signed in, it links to this account. The cart
  // lives in sessionStorage — invisible to the server — so its items ride
  // along in the body (the server re-prices everything from the database).
  const placeOnlineOrder: StoreContextValue["placeOnlineOrder"] = async (input) => {
    const items = stateRef.current.cart.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    }));
    const res = await api<ApiOrder>("/api/orders", {
      method: "POST",
      body: JSON.stringify({ ...input, items }),
    });
    if (!res.ok || !res.data) return { ok: false, error: res.error };
    const order = toOrder(res.data);
    patch((prev) => ({
      ...prev,
      orders: prev.orders.some((o) => o.id === order.id) ? prev.orders : [order, ...prev.orders],
      cart: [], // the checkout consumed the cart, exactly like the mock
    }));
    return { ok: true, order };
  };

  const createWalkInOrder: StoreContextValue["createWalkInOrder"] = async (input) => {
    const res = await api<ApiOrder>("/api/orders", { method: "POST", body: JSON.stringify(input) });
    if (!res.ok || !res.data) return { ok: false, error: res.error };
    upsertOrderRow(res.data);
    void refreshInventory(); // the counter just deducted stock — pull the fresh numbers
    return { ok: true, order: toOrder(res.data) };
  };

  // Kitchen ladder — the server enforces one-step-at-a-time and refuses
  // illegal jumps; the UI only ever offers the legal next step anyway.
  const updateOrderStatus: StoreContextValue["updateOrderStatus"] = (orderId, status) => {
    void api<ApiOrder>(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "SET_STATUS", status }),
    }).then((res) => {
      if (res.ok && res.data) {
        upsertOrderRow(res.data);
        void refreshInventory(); // completing a paid order deducts stock
      } else if (res.error) {
        console.error("[updateOrderStatus]", res.error);
      }
    });
  };

  const updateOrderPayment: StoreContextValue["updateOrderPayment"] = (orderId, paymentStatus) => {
    void api<ApiOrder>(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "SET_PAYMENT", paymentStatus }),
    }).then((res) => {
      if (res.ok && res.data) {
        upsertOrderRow(res.data);
        void refreshInventory();
      } else if (res.error) {
        console.error("[updateOrderPayment]", res.error);
      }
    });
  };

  const cancelOwnOrder: StoreContextValue["cancelOwnOrder"] = async (orderId) => {
    const res = await api<ApiOrder>(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "CANCEL" }),
    });
    if (!res.ok || !res.data) return { ok: false, error: res.error };
    upsertOrderRow(res.data);
    void refreshInventory(); // cancelled stock (if any) returns to the counter
    return { ok: true };
  };

  const deleteOrder: StoreContextValue["deleteOrder"] = async (orderId) => {
    const res = await api<{ deleted: string }>(`/api/orders/${orderId}`, { method: "DELETE" });
    if (!res.ok) return { ok: false, error: res.error };
    patch((prev) => ({ ...prev, orders: prev.orders.filter((o) => o.id !== orderId) }));
    return { ok: true };
  };

  /* ---------------- delivery leg (rider) ---------------- */

  const deliveryAction = async (orderId: string, action: string) => {
    const res = await api<ApiOrder>(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
    if (!res.ok || !res.data) return { ok: false as const, error: res.error };
    upsertOrderRow(res.data);
    if (action === "COMPLETE_DELIVERY") void refreshInventory(); // COD settled → stock deducted
    return { ok: true as const };
  };

  const claimDeliveryOrder: StoreContextValue["claimDeliveryOrder"] = (orderId) => deliveryAction(orderId, "CLAIM");
  const releaseDeliveryOrder: StoreContextValue["releaseDeliveryOrder"] = (orderId) => deliveryAction(orderId, "RELEASE");
  const startDelivery: StoreContextValue["startDelivery"] = (orderId) => deliveryAction(orderId, "START");
  const completeDelivery: StoreContextValue["completeDelivery"] = (orderId) =>
    deliveryAction(orderId, "COMPLETE_DELIVERY");

  const deliveryStatusOf: StoreContextValue["deliveryStatusOf"] = (order) => order.deliveryStatus ?? "QUEUED";

  /* ---------------- product actions (admin) ---------------- */

  const saveProduct: StoreContextValue["saveProduct"] = (input) => {
    const { id, ...fields } = input;
    const body = JSON.stringify(fields);
    void (id
      ? api<ApiProduct>(`/api/products/${id}`, { method: "PATCH", body })
      : api<ApiProduct>("/api/products", { method: "POST", body })
    ).then((res) => {
      if (res.ok && res.data) upsertProductRow(res.data);
      else if (res.error) console.error("[saveProduct]", res.error);
    });
  };

  const archiveProduct: StoreContextValue["archiveProduct"] = (productId) => {
    void api<ApiProduct>(`/api/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    }).then((res) => {
      if (res.ok && res.data) upsertProductRow(res.data);
      else if (res.error) console.error("[archiveProduct]", res.error);
    });
  };

  // The database refuses to delete products that appear on past orders —
  // the caller surfaces that advice ("archive it instead") to the admin.
  const deleteProduct: StoreContextValue["deleteProduct"] = async (productId) => {
    const res = await api<{ deleted: string }>(`/api/products/${productId}`, { method: "DELETE" });
    if (!res.ok) return { ok: false, error: res.error };
    patch((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
      inventory: prev.inventory.filter((i) => i.productId !== productId),
      cart: prev.cart.filter((l) => l.productId !== productId),
    }));
    return { ok: true };
  };

  /* ---------------- inventory actions (admin) ---------------- */

  const adjustStock: StoreContextValue["adjustStock"] = (productId, type, quantity, note) => {
    void api<ApiInventoryItem | { unchanged: boolean; productId: string }>("/api/inventory/adjust", {
      method: "POST",
      body: JSON.stringify({ productId, type, quantity, note }),
    }).then((res) => {
      if (!res.ok || !res.data) {
        if (res.error) console.error("[adjustStock]", res.error);
        return;
      }
      if ("unchanged" in res.data) {
        void refreshInventory(); // nothing changed — just re-sync
        return;
      }
      patch((prev) => ({
        ...prev,
        inventory: prev.inventory.map((i) =>
          i.productId === productId ? toInventoryItem(res.data as ApiInventoryItem) : i,
        ),
      }));
    });
  };

  // Threshold is applied locally immediately and confirmed by the server
  // (the response also carries it, so the poll will agree either way).
  const setLowStockThreshold: StoreContextValue["setLowStockThreshold"] = (productId, threshold) => {
    patch((prev) => ({
      ...prev,
      inventory: prev.inventory.map((i) =>
        i.productId === productId ? { ...i, lowStockThreshold: threshold, lastUpdated: new Date().toISOString() } : i,
      ),
    }));
    void api("/api/inventory", {
      method: "PATCH",
      body: JSON.stringify({ productId, lowStockThreshold: threshold }),
    }).then((res) => {
      if (!res.ok && res.error) console.error("[setLowStockThreshold]", res.error);
    });
  };

  /* ---------------- staff & settings (admin) ---------------- */

  const saveStaffMember: StoreContextValue["saveStaffMember"] = async (input) => {
    const { id, ...fields } = input;
    const res = id
      ? await api<ApiUser>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(fields) })
      : await api<ApiUser>("/api/users", { method: "POST", body: JSON.stringify(fields) });
    if (!res.ok || !res.data) return { ok: false, error: res.error };
    upsertUserRow(res.data);
    return { ok: true };
  };

  const toggleStaffStatus: StoreContextValue["toggleStaffStatus"] = (userId) => {
    const target = stateRef.current.users.find((u) => u.id === userId);
    if (!target) return;
    const status = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    void api<ApiUser>(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).then((res) => {
      if (res.ok && res.data) upsertUserRow(res.data);
      else if (res.error) console.error("[toggleStaffStatus]", res.error);
    });
  };

  const updateSettings: StoreContextValue["updateSettings"] = (settings) => {
    patch((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } })); // instant UI
    void api<CafeSettings>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    }).then((res) => {
      if (res.ok && res.data) patch((prev) => ({ ...prev, settings: res.data as CafeSettings }));
      else if (res.error) console.error("[updateSettings]", res.error);
    });
  };

  // Wipes the database and regenerates the whole demo scenario. The reset
  // also ends this session (the accounts themselves are regenerated), so
  // the admin signs back in with admin@cafe.com / admin123 afterwards.
  const resetDemoData = () => {
    void api<{ reset: boolean }>("/api/dev/reset-demo", { method: "POST" }).then((res) => {
      if (!res.ok) {
        console.error("[resetDemoData]", res.error);
        return;
      }
      patch((prev) => ({
        ...prev,
        currentUserId: null,
        cart: [],
        orders: [],
        users: [],
        customers: [],
      }));
      void refreshCatalog();
      void refreshSettings();
    });
  };

  const value: StoreContextValue = {
    ...state,
    currentUser,
    cartLines,
    cartCount,
    cartTotal,
    getStock,
    getProduct,
    lowStockItems,
    myOrders,
    login,
    registerCustomer,
    updateOwnProfile,
    resetPassword,
    logout,
    addToCart,
    setCartQuantity,
    removeFromCart,
    clearCart,
    placeOnlineOrder,
    createWalkInOrder,
    updateOrderStatus,
    updateOrderPayment,
    cancelOwnOrder,
    deleteOrder,
    claimDeliveryOrder,
    startDelivery,
    completeDelivery,
    releaseDeliveryOrder,
    deliveryStatusOf,
    saveProduct,
    archiveProduct,
    deleteProduct,
    adjustStock,
    setLowStockThreshold,
    saveStaffMember,
    toggleStaffStatus,
    updateSettings,
    resetDemoData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** Immutably drop-in a user into a list (by id). */
function upsertInto<T extends { id: string }>(list: T[], user: T): T[] {
  return list.some((u) => u.id === user.id) ? list.map((u) => (u.id === user.id ? user : u)) : [...list, user];
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>.");
  return ctx;
}
