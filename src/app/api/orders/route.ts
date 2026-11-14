import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, created, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";
import { DELIVERY_FEE } from "@/lib/types";
import { applyStock, money, nextReference, stockProblem } from "@/lib/backend/orders";

/* ------------------------------------------------------------------ */
/* Orders — GET (role-filtered lists) and POST (the one checkout).     */
/*                                                                     */
/* THE GOLDEN RULE: every rule the mock UI enforced is re-enforced     */
/* here. The browser is a suggestion; the server is the law.           */
/* ------------------------------------------------------------------ */

/** Thrown inside a transaction when a business rule fails — converts the
 * rollback into a friendly 400 instead of a scary 500. */
class OrderError extends Error {}

const POS_METHODS = ["CASH", "GCASH", "CARD"]; // what the counter accepts
const ONLINE_METHODS = ["GCASH", "CARD", "CASH ON PICKUP", "CASH ON DELIVERY"]; // what checkout offers
const isCounter = (role: string) => role === "ADMIN" || role === "STAFF";

/* ------------------------------------------------------------------ */
/* GET /api/orders — the same table, a different slice per role:       */
/*   ADMIN / STAFF → everything (the orders board)                     */
/*   RIDER         → delivery jobs ready to claim + their own history  */
/*   CUSTOMER      → only their own orders                             */
/* ------------------------------------------------------------------ */
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized("Sign in to view orders.");

    let where: Prisma.OrderWhereInput;
    if (isCounter(user.role)) {
      where = {};
    } else if (user.role === "RIDER") {
      // The rider stage only lights up once the kitchen marks an order
      // READY — before that, delivery orders are nobody's business yet.
      where = {
        fulfillmentMode: "DELIVERY",
        OR: [
          { orderStatus: "READY", deliveryStatus: "QUEUED" }, // claimable pool
          { riderId: user.id }, // my deliveries, including history
        ],
      };
    } else {
      where = { customerId: user.id };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        rider: { select: { id: true, name: true } },
      },
    });
    return ok(orders);
  } catch (err) {
    console.error("[orders:GET]", err);
    return serverError();
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/orders — one endpoint, two personalities:                 */
/*                                                                     */
/*  STAFF/ADMIN    → WALK-IN sale (POS): COMPLETED + PAID instantly,   */
/*                   stock deducted at the counter, change computed.   */
/*  CUSTOMER/GUEST → ONLINE order: PENDING; GCASH/CARD auto-settle as  */
/*                   PAID, cash-on-hand stays PENDING until it arrives. */
/*                                                                     */
/* Stock is VALIDATED here for both, but only the walk-in DEDUCTS      */
/* here — online orders touch inventory when the sale is final         */
/* (completed-paid, or a delivered COD order).                         */
/* ------------------------------------------------------------------ */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    // ---- cart validation (shared by both paths) ----
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) return badRequest("Your cart is empty.");

    // Merge duplicate product lines and sanity-check every quantity.
    const wanted = new Map<string, number>();
    for (const line of rawItems) {
      if (typeof line !== "object" || line === null) return badRequest("Malformed cart item.");
      const { productId, quantity } = line as Record<string, unknown>;
      if (typeof productId !== "string" || !productId) return badRequest("Each cart item needs a productId.");
      if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        return badRequest("Item quantity must be a whole number between 1 and 999.");
      }
      wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);
    }

    // Snapshot names/prices from the DATABASE — never trust prices that
    // arrive from the browser (anyone can edit JavaScript before it ships).
    const products = await prisma.product.findMany({ where: { id: { in: [...wanted.keys()] } } });
    if (products.length !== wanted.size) return badRequest("One of the items no longer exists.");
    for (const product of products) {
      if (!product.available || product.archived) return badRequest(`${product.name} is currently unavailable.`);
    }

    const items = products.map((p) => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity: wanted.get(p.id) ?? 0,
    }));
    const subtotal = money(items.reduce((s, i) => s + i.price * i.quantity, 0));

    // ================= WALK-IN (counter POS) =================
    if (user && isCounter(user.role)) {
      const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "";
      if (!POS_METHODS.includes(paymentMethod)) {
        return badRequest("Counter payments are CASH, GCASH or CARD.");
      }
      const amountReceived = body.amountReceived;
      // The till must physically cover the bill — same check as the mock POS.
      if (typeof amountReceived !== "number" || !Number.isFinite(amountReceived) || amountReceived < subtotal) {
        return badRequest("Payment received is not enough.");
      }

      const order = await prisma.$transaction(async (tx) => {
        // Validate AND deduct stock inside ONE transaction, so two cashiers
        // selling the last croissant at the same time can't both win.
        const problem = await stockProblem(tx, items);
        if (problem) throw new OrderError(problem);
        const reference = await nextReference(tx);
        const walkIn = await tx.order.create({
          data: {
            reference,
            channel: "WALK-IN",
            customerName: (typeof body.customerName === "string" ? body.customerName.trim() : "") || "Walk-in Guest",
            customerContact:
              typeof body.customerContact === "string" ? body.customerContact.trim().slice(0, 40) : null,
            fulfillmentMode: "PICKUP",
            subtotal,
            total: subtotal,
            amountReceived,
            change: money(amountReceived - subtotal),
            paymentMethod,
            paymentStatus: "PAID",
            orderStatus: "COMPLETED",
            stockAffected: true,
            completedAt: new Date(),
            items: { create: items },
          },
        });
        await applyStock(tx, items, -1); // SOLD movements — the sale left the shelf
        return tx.order.findUniqueOrThrow({ where: { id: walkIn.id }, include: { items: true } });
      });
      return created(order);
    }

    // ================= ONLINE (guest or signed-in customer) =================
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "";
    if (!ONLINE_METHODS.includes(paymentMethod)) {
      return badRequest("Online orders pay by GCASH, CARD, CASH ON PICKUP or CASH ON DELIVERY.");
    }

    const fulfillment =
      typeof body.fulfillment === "object" && body.fulfillment !== null
        ? (body.fulfillment as Record<string, unknown>)
        : {};
    const mode = fulfillment.mode === "DELIVERY" ? "DELIVERY" : "PICKUP";
    // The two cash-on-hand methods only make sense with their matching mode.
    if (mode === "DELIVERY" && paymentMethod === "CASH ON PICKUP") {
      return badRequest("Cash on pickup is for pickup orders — choose Cash on delivery instead.");
    }
    if (mode === "PICKUP" && paymentMethod === "CASH ON DELIVERY") {
      return badRequest("Cash on delivery is for delivery orders — choose Cash on pickup instead.");
    }

    const address = typeof fulfillment.address === "string" ? fulfillment.address.trim() : "";
    if (mode === "DELIVERY" && !address) return badRequest("A delivery address is required.");
    const notes = typeof fulfillment.notes === "string" ? fulfillment.notes.trim().slice(0, 200) : null;
    const deliveryFee = mode === "DELIVERY" ? DELIVERY_FEE : 0;

    const customerName = (typeof body.customerName === "string" ? body.customerName.trim() : "") || user?.name || "";
    if (!customerName) return badRequest("Please give a name for the order.");
    const customerContact = typeof body.customerContact === "string" ? body.customerContact.trim().slice(0, 40) : null;

    // Simulated payment gateway: GCASH/CARD settle immediately; cash that
    // changes hands later (pickup/delivery) stays PENDING until it arrives.
    const paidNow = paymentMethod === "GCASH" || paymentMethod === "CARD";

    const order = await prisma.$transaction(async (tx) => {
      // Read-only stock check — a PENDING order doesn't own the stock yet,
      // so we only refuse to oversell what the counter actually has.
      const problem = await stockProblem(tx, items);
      if (problem) throw new OrderError(problem);
      const reference = await nextReference(tx);
      const online = await tx.order.create({
        data: {
          reference,
          channel: "ONLINE",
          customerId: user?.id ?? null, // null = guest checkout
          customerName,
          customerContact,
          fulfillmentMode: mode,
          deliveryAddress: mode === "DELIVERY" ? address : null,
          deliveryNotes: notes,
          deliveryFee,
          deliveryStatus: mode === "DELIVERY" ? "QUEUED" : null,
          subtotal,
          total: money(subtotal + deliveryFee),
          paymentMethod,
          paymentStatus: paidNow ? "PAID" : "PENDING",
          orderStatus: "PENDING",
          stockAffected: false,
          items: { create: items },
        },
      });
      return tx.order.findUniqueOrThrow({ where: { id: online.id }, include: { items: true } });
    });
    return created(order);
  } catch (err) {
    if (err instanceof OrderError) return badRequest(err.message);
    console.error("[orders:POST]", err);
    return serverError();
  }
}
