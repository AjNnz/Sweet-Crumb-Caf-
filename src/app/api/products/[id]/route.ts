import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, forbidden, notFound, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";
import { PRODUCT_CATEGORIES, isMadeToOrder } from "@/lib/types";
import type { ProductCategory } from "@/lib/types";

/** Route params are async in this Next.js version. */
type Params = { params: Promise<{ id: string }> };

const productInclude = {
  inventory: { select: { quantity: true, lowStockThreshold: true, lastUpdated: true } },
} as const;

/* ------------------------------------------------------------------ */
/* PATCH /api/products/[id] — edit a product (ADMIN only).             */
/* Category transitions keep the stock system consistent:              */
/*   baked → drink : the stock row (and its movement history) is removed */
/*   drink → baked : a fresh stock row is created                      */
/* Archiving mirrors the mock: archived = true also sets available=false. */
/* ------------------------------------------------------------------ */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only the admin can edit products.");

    const { id } = await params;
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return notFound("Product not found.");

    // Build the update from ONLY the fields that were sent — a PATCH edits
    // what changed, so absent fields keep their current values.
    const data: {
      name?: string;
      category?: string;
      price?: number;
      description?: string;
      emoji?: string;
      imageUrl?: string | null;
      available?: boolean;
      archived?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > 80) return badRequest("Name is required (max 80 characters).");
      data.name = name;
    }
    if (body.category !== undefined) {
      const category = typeof body.category === "string" ? body.category : "";
      if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) {
        return badRequest(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`);
      }
      data.category = category;
    }
    if (body.price !== undefined) {
      const price = body.price;
      if (typeof price !== "number" || !Number.isFinite(price) || price <= 0 || price > 100000) {
        return badRequest("Price must be a positive number.");
      }
      data.price = price;
    }
    if (body.description !== undefined) {
      if (typeof body.description !== "string") return badRequest("Description must be text.");
      data.description = body.description.trim();
    }
    if (body.emoji !== undefined) {
      if (typeof body.emoji !== "string" || !body.emoji.trim()) return badRequest("Emoji must be a non-empty string.");
      data.emoji = body.emoji.trim().slice(0, 8);
    }
    if (body.imageUrl !== undefined) {
      const imageUrl = body.imageUrl;
      if (imageUrl !== null && (typeof imageUrl !== "string" || !imageUrl.startsWith("/"))) {
        return badRequest("imageUrl must be null or a local path starting with '/'.");
      }
      data.imageUrl = imageUrl;
    }
    if (body.available !== undefined) {
      if (typeof body.available !== "boolean") return badRequest("available must be true or false.");
      data.available = body.available;
    }
    if (body.archived !== undefined) {
      if (typeof body.archived !== "boolean") return badRequest("archived must be true or false.");
      data.archived = body.archived;
      if (body.archived) data.available = false; // archived products can't be sold
    }

    const category = data.category ?? existing.category;
    const updated = await prisma.$transaction(async (tx) => {
      if (isMadeToOrder(category as ProductCategory)) {
        // Drinks aren't stock-tracked — drop any stock row with its movements.
        await tx.inventoryItem.deleteMany({ where: { productId: id } });
      } else {
        // Baked goods always need a stock row — create one if the product
        // just became batch-baked (or somehow has none).
        const inv = await tx.inventoryItem.findUnique({ where: { productId: id } });
        if (!inv) await tx.inventoryItem.create({ data: { productId: id, quantity: 0, lowStockThreshold: 5 } });
      }
      return tx.product.update({ where: { id }, data, include: productInclude });
    });

    return ok(updated);
  } catch (err) {
    console.error("[products:PATCH]", err);
    return serverError();
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/products/[id] — remove a product (ADMIN only).          */
/* Referential integrity: a product that appears on past orders CANNOT */
/* be deleted (the order history must stay truthful) — the database    */
/* itself refuses. In that case, archive it instead.                   */
/* ------------------------------------------------------------------ */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only the admin can delete products.");

    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return badRequest("This product is on past orders and cannot be deleted — archive it instead.");
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return notFound("Product not found.");
    }
    console.error("[products:DELETE]", err);
    return serverError();
  }
}
