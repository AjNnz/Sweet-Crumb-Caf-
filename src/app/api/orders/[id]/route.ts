import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, forbidden, notFound, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";
import { ORDER_STATUS_FLOW } from "@/lib/types";
import type { OrderStatus } from "@/lib/types";
import { PAYMENT_STATUSES, applyStock, canAdvance, nextStepOf } from "@/lib/backend/orders";

/* ------------------------------------------------------------------ */
/* PATCH /api/orders/[id] — every state change is an explicit ACTION   */
/* with its own rules, so no client can invent an illegal transition:  */
/*                                                                     */
/*   SET_STATUS         kitchen ladder, one step at a time (STAFF/ADMIN)*/
/*   SET_PAYMENT        record PAID/UNPAID (STAFF/ADMIN)               */
/*   CANCEL             customers (own, early) or staff (any active)   */
/*   CLAIM / RELEASE / START / COMPLETE_DELIVERY   the rider's leg     */
/*                                                                     */
/* DELETE trashes CANCELLED orders only (staff housekeeping).          */
/* ------------------------------------------------------------------ */

type Params = { params: Promise<{ id: string }> };
const isCounter = (role: string) => role === "ADMIN" || role === "STAFF";

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized("Sign in first.");

    const { id } = await params;
    const body = await readJson(request);
    if (!body) {
      return badRequest("Expected a JSON body with an action: SET_STATUS, SET_PAYMENT, CANCEL, CLAIM, RELEASE, START or COMPLETE_DELIVERY.");
    }
    const action = typeof body.action === "string" ? body.action : "";
    if (!action) {
      return badRequest("Expected an action: SET_STATUS, SET_PAYMENT, CANCEL, CLAIM, RELEASE, START or COMPLETE_DELIVERY.");
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return notFound("Order not found.");

    switch (action) {
      /* ---------------- kitchen ladder (STAFF / ADMIN) ---------------- */
      case "SET_STATUS": {
        if (!isCounter(user.role)) return forbidden("Only staff can update the kitchen flow.");
        const status = typeof body.status === "string" ? body.status : "";
        if (status === "CANCELLED") {
          return badRequest("Cancellation has its own rules — use the CANCEL action.");
        }
        if (!ORDER_STATUS_FLOW.includes(status as OrderStatus)) {
          return badRequest(`status must be one of: ${ORDER_STATUS_FLOW.join(", ")}.`);
        }
        if (!canAdvance(order.orderStatus, status)) {
          const next = nextStepOf(order.orderStatus);
          return badRequest(
            next
              ? `Orders move one step at a time — from ${order.orderStatus} the next step is ${next}.`
              : `A ${order.orderStatus} order can't move further.`,
          );
        }
        // A delivery order is only done once the rider has handed it over.
        if (status === "COMPLETED" && order.fulfillmentMode === "DELIVERY" && order.deliveryStatus !== "DELIVERED") {
          return badRequest("The rider hasn't handed this order over yet.");
        }
        const updated = await prisma.$transaction(async (tx) => {
          let stockAffected = order.stockAffected;
          // Completing a PAID order is the moment of sale → deduct stock once.
          if (status === "COMPLETED" && !stockAffected && order.paymentStatus === "PAID") {
            await applyStock(tx, order.items, -1);
            stockAffected = true;
          }
          return tx.order.update({
            where: { id },
            data: {
              orderStatus: status,
              stockAffected,
              completedAt: status === "COMPLETED" ? new Date() : undefined,
            },
            include: { items: true },
          });
        });
        return ok(updated);
      }

      /* ---------------- payment bookkeeping (STAFF / ADMIN) ---------------- */
      case "SET_PAYMENT": {
        if (!isCounter(user.role)) return forbidden("Only staff can record payments.");
        const paymentStatus = typeof body.paymentStatus === "string" ? body.paymentStatus : "";
        if (!PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
          return badRequest(`paymentStatus must be one of: ${PAYMENT_STATUSES.join(", ")}.`);
        }
        const updated = await prisma.$transaction(async (tx) => {
          let stockAffected = order.stockAffected;
          // A COMPLETED order that only now gets paid is still a sale that
          // must leave the shelf — the completion rule, applied late.
          if (paymentStatus === "PAID" && order.orderStatus === "COMPLETED" && !stockAffected) {
            await applyStock(tx, order.items, -1);
            stockAffected = true;
          }
          return tx.order.update({
            where: { id },
            data: { paymentStatus, stockAffected },
            include: { items: true },
          });
        });
        return ok(updated);
      }

      /* ---------------- cancellation (customers early, staff anytime) ---------------- */
      case "CANCEL": {
        if (user.role === "CUSTOMER") {
          if (order.customerId !== user.id) return forbidden("You can only cancel your own orders.");
          if (order.orderStatus !== "PENDING" && order.orderStatus !== "CONFIRMED") {
            return badRequest("It's too late to cancel — the cafe has started preparing this order.");
          }
        } else if (isCounter(user.role)) {
          if (order.orderStatus === "COMPLETED" || order.orderStatus === "CANCELLED") {
            return badRequest(`A ${order.orderStatus.toLowerCase()} order can't be cancelled.`);
          }
        } else {
          return forbidden("Riders can't cancel orders.");
        }
        const updated = await prisma.$transaction(async (tx) => {
          let stockAffected = order.stockAffected;
          // Stock only comes back if it actually left the shelf — a pending
          // online order never owned inventory in the first place.
          if (stockAffected) {
            await applyStock(tx, order.items, 1);
            stockAffected = false;
          }
          return tx.order.update({
            where: { id },
            data: {
              orderStatus: "CANCELLED",
              cancelledAt: new Date(),
              // Paid money goes back to the customer.
              paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
              stockAffected,
            },
            include: { items: true },
          });
        });
        return ok(updated);
      }

      /* ---------------- delivery leg (RIDER) ---------------- */
      case "CLAIM": {
        if (user.role !== "RIDER") return forbidden("Only riders can claim deliveries.");
        if (order.fulfillmentMode !== "DELIVERY") return badRequest("Only delivery orders can be claimed.");
        // The rider stage starts only when the kitchen marks the order READY.
        if (order.orderStatus !== "READY") return badRequest("The café hasn't finished preparing this order yet.");
        if (order.deliveryStatus !== "QUEUED") return badRequest("Someone already took this delivery.");
        const updated = await prisma.order.update({
          where: { id },
          data: { riderId: user.id, deliveryStatus: "CLAIMED" },
          include: { items: true },
        });
        return ok(updated);
      }

      case "RELEASE": {
        if (user.role !== "RIDER") return forbidden("Only riders can release deliveries.");
        // Only a still-held (CLAIMED) job can be handed back to the pool.
        if (order.riderId !== user.id || order.deliveryStatus !== "CLAIMED") {
          return badRequest("This delivery can no longer be released.");
        }
        const updated = await prisma.order.update({
          where: { id },
          data: { riderId: null, deliveryStatus: "QUEUED" },
          include: { items: true },
        });
        return ok(updated);
      }

      case "START": {
        if (user.role !== "RIDER") return forbidden("Only the assigned rider can start this delivery.");
        if (order.riderId !== user.id || order.deliveryStatus !== "CLAIMED") {
          return badRequest("This delivery is not assigned to you.");
        }
        const updated = await prisma.order.update({
          where: { id },
          data: { deliveryStatus: "OUT_FOR_DELIVERY" },
          include: { items: true },
        });
        return ok(updated);
      }

      case "COMPLETE_DELIVERY": {
        if (user.role !== "RIDER") return forbidden("Only the assigned rider can complete this delivery.");
        if (order.riderId !== user.id || order.deliveryStatus !== "OUT_FOR_DELIVERY") {
          return badRequest("This delivery is not assigned to you.");
        }
        const updated = await prisma.$transaction(async (tx) => {
          // COD settles at the door — the sale is final, so stock leaves now.
          const paymentStatus = order.paymentStatus === "PENDING" ? "PAID" : order.paymentStatus;
          let stockAffected = order.stockAffected;
          if (paymentStatus === "PAID" && !stockAffected) {
            await applyStock(tx, order.items, -1);
            stockAffected = true;
          }
          return tx.order.update({
            where: { id },
            data: { deliveryStatus: "DELIVERED", deliveredAt: new Date(), paymentStatus, stockAffected },
            include: { items: true },
          });
        });
        return ok(updated);
      }

      default:
        return badRequest(`Unknown action "${action}".`);
    }
  } catch (err) {
    console.error("[orders:PATCH]", err);
    return serverError();
  }
}

/* ------------------------------------------------------------------ */
/* DELETE — staff housekeeping: permanently trash a CANCELLED order.   */
/* Completed sales stay forever (the analytics depend on them).        */
/* ------------------------------------------------------------------ */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized("Sign in first.");
    if (!isCounter(user.role)) return forbidden("Only staff can delete orders.");

    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return notFound("Order not found.");
    if (order.orderStatus !== "CANCELLED") return badRequest("Only cancelled orders can be deleted.");

    await prisma.order.delete({ where: { id } }); // line items cascade (schema onDelete)
    return ok({ deleted: id });
  } catch (err) {
    console.error("[orders:DELETE]", err);
    return serverError();
  }
}
