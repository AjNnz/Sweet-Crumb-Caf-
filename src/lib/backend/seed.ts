import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

import { prisma } from "../prisma";
import {
  SEED_CUSTOMERS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_USERS,
  buildSeedInventory,
  buildSeedOrders,
} from "../mock-data";

/* ------------------------------------------------------------------ */
/* Demo seeding — the mock's localStorage payload, ported to a real DB. */
/*                                                                     */
/* One honest difference from the mock: order history is IMPORTED as   */
/* receipts, not replayed through the stock ledger. The inventory      */
/* carries its current quantities plus "Opening stock loaded" (ADD)    */
/* and end-of-shift (WASTED) movements — exactly what the mock showed. */
/* SOLD movements only start accruing from real sales made through     */
/* the API. This mirrors a real café adopting the system: you count    */
/* today's shelf and import yesterday's receipts.                      */
/*                                                                     */
/* The generator is deterministic (seeded PRNG), so the same run       */
/* always produces the same story — only the dates move with "today".  */
/*                                                                     */
/* Writes are BATCHED with createMany(): the deployed database is      */
/* remote (Neon/Postgres), where one-by-one creates would mean         */
/* thousands of slow network round trips. Same data, ~100x faster.     */
/* ------------------------------------------------------------------ */

export async function resetAndSeed() {
  // --- wipe (children first — foreign keys) ---
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cafeSettings.deleteMany();

  // --- accounts (bcrypt from day one; ids preserved for readability) ---
  // Hash the demo passwords in one batch — bcrypt is CPU-bound, not I/O.
  const seedAccounts = [...SEED_USERS, ...SEED_CUSTOMERS];
  const passwordHashes = await Promise.all(
    seedAccounts.map(async (u) => bcrypt.hash(u.password!, 10)),
  );
  await prisma.user.createMany({
    data: seedAccounts.map((u, i) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: passwordHashes[i],
      role: u.role,
      status: u.status,
      contact: u.contact ?? null,
      createdAt: new Date(u.createdAt),
    })),
  });

  // --- catalog (mock ids prd-001…prd-020 preserved) ---
  await prisma.product.createMany({
    data: SEED_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      emoji: p.emoji,
      available: p.available,
      createdAt: new Date(p.createdAt),
    })),
  });

  // --- stock + its paper trail (opening stock, end-of-shift waste) ---
  // Inventory rows need generated ids so their movement rows can point
  // at them — createMany cannot return the auto-generated ids.
  const inventory = buildSeedInventory();
  const inventoryIds = inventory.map(() => randomUUID());
  await prisma.inventoryItem.createMany({
    data: inventory.map((inv, i) => ({
      id: inventoryIds[i],
      productId: inv.productId,
      quantity: inv.quantity,
      lowStockThreshold: inv.lowStockThreshold,
    })),
  });
  const movements = inventory.flatMap((inv, i) =>
    inv.movements.map((m) => ({
      inventoryItemId: inventoryIds[i], // the row's own id — NOT the productId
      date: new Date(m.date),
      type: m.type,
      quantity: m.quantity,
      note: m.note ?? null,
    })),
  );
  await prisma.stockMovement.createMany({ data: movements });

  // --- ~60 days of order history + today's in-flight deliveries ---
  // Orders and their line items are separate batched inserts, joined by
  // the order's preserved id (identical result to the old nested create).
  const orders = buildSeedOrders();
  await prisma.order.createMany({
    data: orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      channel: o.channel,
      customerId: o.customerId ?? null,
      customerName: o.customerName,
      customerContact: o.customerContact ?? null,
      // the mock's nested fulfillment object flattens into columns
      fulfillmentMode: o.fulfillment?.mode ?? "PICKUP",
      deliveryAddress: o.fulfillment?.address ?? null,
      deliveryNotes: o.fulfillment?.notes ?? null,
      deliveryFee: o.deliveryFee ?? 0,
      deliveryStatus: o.deliveryStatus ?? null,
      riderId: o.riderId ?? null,
      deliveredAt: o.deliveredAt ? new Date(o.deliveredAt) : null,
      subtotal: o.subtotal,
      total: o.total,
      amountReceived: o.amountReceived ?? null,
      change: o.change ?? null,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      stockAffected: o.stockAffected,
      createdAt: new Date(o.createdAt),
      completedAt: o.completedAt ? new Date(o.completedAt) : null,
      cancelledAt: o.cancelledAt ? new Date(o.cancelledAt) : null,
    })),
  });
  await prisma.orderItem.createMany({
    data: orders.flatMap((o) =>
      o.items.map((i) => ({
        orderId: o.id,
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    ),
  });

  // --- the singleton settings row ---
  await prisma.cafeSettings.create({ data: { id: "singleton", ...SEED_SETTINGS } });

  return {
    users: SEED_USERS.length + SEED_CUSTOMERS.length,
    products: SEED_PRODUCTS.length,
    inventoryItems: inventory.length,
    movements: movements.length,
    orders: orders.length,
  };
}
