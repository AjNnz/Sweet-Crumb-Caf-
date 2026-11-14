import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, forbidden, notFound, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";

/* ------------------------------------------------------------------ */
/* POST /api/inventory/adjust — stock in / write-offs / stock count.   */
/* (ADMIN only — mirrors the admin inventory screen.)                  */
/*                                                                     */
/* Semantics carried over from the mock:                               */
/*   ADD        → quantity + amount                                    */
/*   WASTED     → quantity − amount (never below zero)                 */
/*   ADJUSTMENT → quantity = amount (a physical recount)               */
/*                                                                     */
/* The quantity update AND the StockMovement ledger entry happen in    */
/* ONE transaction: either both are recorded or neither is. A stock    */
/* change without its paper trail would be a silent lie in the data.   */
/* ------------------------------------------------------------------ */

const ADJUSTABLE = ["ADD", "WASTED", "ADJUSTMENT"] as const;
type AdjustType = (typeof ADJUSTABLE)[number];

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only the admin can adjust stock.");

    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    const productId = typeof body.productId === "string" ? body.productId : "";
    const type = body.type as AdjustType;
    if (!ADJUSTABLE.includes(type)) {
      return badRequest(`type must be one of: ${ADJUSTABLE.join(", ")}.`);
    }

    const quantity = body.quantity;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0 || quantity > 100000) {
      return badRequest("quantity must be a whole number between 0 and 100000.");
    }
    if (type !== "ADJUSTMENT" && quantity === 0) {
      return badRequest("quantity must be greater than zero for ADD and WASTED.");
    }

    const note = typeof body.note === "string" ? body.note.trim().slice(0, 200) : undefined;

    const result = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventoryItem.findUnique({ where: { productId } });
      if (!inv) return null; // drinks have no stock row to adjust

      let newQuantity: number;
      let movementQuantity: number;
      if (type === "ADD") {
        newQuantity = inv.quantity + quantity;
        movementQuantity = quantity;
      } else if (type === "WASTED") {
        newQuantity = Math.max(0, inv.quantity - quantity);
        movementQuantity = inv.quantity - newQuantity; // what was actually written off
        if (movementQuantity === 0) return { noChange: true as const };
      } else {
        newQuantity = quantity;
        movementQuantity = Math.abs(quantity - inv.quantity);
        if (movementQuantity === 0) return { noChange: true as const };
      }

      await tx.inventoryItem.update({ where: { id: inv.id }, data: { quantity: newQuantity } });
      await tx.stockMovement.create({
        data: { inventoryItemId: inv.id, type, quantity: movementQuantity, note },
      });
      return { noChange: false as const, quantity: newQuantity };
    });

    if (!result) return notFound("No stock tracked for this product (drinks are made to order).");
    if (result.noChange) return ok({ productId, quantity: undefined, unchanged: true });

    const updated = await prisma.inventoryItem.findUnique({
      where: { productId },
      include: { movements: { orderBy: { date: "desc" }, take: 5 } },
    });
    return ok(updated);
  } catch (err) {
    console.error("[inventory:adjust]", err);
    return serverError();
  }
}
