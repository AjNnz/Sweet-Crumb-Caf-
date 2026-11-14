import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, forbidden, notFound, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";

/* ------------------------------------------------------------------ */
/* GET /api/inventory — stock levels + recent movement history.        */
/* ADMIN and STAFF: both roles work the counter, so both may read it.  */
/* ------------------------------------------------------------------ */
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      return forbidden("Only staff and the admin can view inventory.");
    }

    const items = await prisma.inventoryItem.findMany({
      orderBy: { productId: "asc" },
      include: {
        product: {
          select: { id: true, name: true, category: true, emoji: true, imageUrl: true, available: true, archived: true },
        },
        movements: { orderBy: { date: "desc" }, take: 30 },
      },
    });
    return ok(items);
  } catch (err) {
    console.error("[inventory:GET]", err);
    return serverError();
  }
}

/* ------------------------------------------------------------------ */
/* PATCH /api/inventory — set a product's low-stock threshold           */
/* (ADMIN only; the inventory screen's threshold input).               */
/* ------------------------------------------------------------------ */
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only the admin can change stock thresholds.");

    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    const productId = typeof body.productId === "string" ? body.productId : "";
    const threshold = body.lowStockThreshold;
    if (typeof threshold !== "number" || !Number.isInteger(threshold) || threshold < 0 || threshold > 999) {
      return badRequest("lowStockThreshold must be a whole number between 0 and 999.");
    }

    const inv = await prisma.inventoryItem.findUnique({ where: { productId } });
    if (!inv) return notFound("No stock tracked for this product (drinks are made to order).");

    const updated = await prisma.inventoryItem.update({
      where: { id: inv.id },
      data: { lowStockThreshold: threshold },
      include: { product: { select: { id: true, name: true } } },
    });
    return ok(updated);
  } catch (err) {
    console.error("[inventory:PATCH]", err);
    return serverError();
  }
}
