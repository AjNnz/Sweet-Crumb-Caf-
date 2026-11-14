import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, created, ok, readJson, serverError, unauthorized, forbidden } from "@/lib/backend/http";
import { PRODUCT_CATEGORIES, isMadeToOrder } from "@/lib/types";
import type { ProductCategory } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* GET /api/products — the full catalog (public: the customer menu,    */
/* POS and admin screens all read this). Each product carries its      */
/* inventory row when it has one (drinks don't — they're made to       */
/* order). Stock enforcement happens server-side when ordering.        */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: {
        inventory: { select: { quantity: true, lowStockThreshold: true, lastUpdated: true } },
      },
    });
    return ok(products);
  } catch (err) {
    console.error("[products:GET]", err);
    return serverError();
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/products — create a product (ADMIN only).                 */
/* Batch-baked categories also get an InventoryItem (quantity 0,       */
/* threshold 5) exactly like the mock did — drinks never do.           */
/* ------------------------------------------------------------------ */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only the admin can add products.");

    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    // --- validate every field; never trust the browser ---
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 80) return badRequest("Name is required (max 80 characters).");

    const category = typeof body.category === "string" ? body.category : "";
    if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) {
      return badRequest(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`);
    }

    const price = body.price;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0 || price > 100000) {
      return badRequest("Price must be a positive number.");
    }

    const description = typeof body.description === "string" ? body.description.trim() : "";
    const emoji = typeof body.emoji === "string" && body.emoji.trim() ? body.emoji.trim().slice(0, 8) : "🧁";
    const available = typeof body.available === "boolean" ? body.available : true;

    const imageUrl = body.imageUrl === undefined || body.imageUrl === null ? null : body.imageUrl;
    if (imageUrl !== null && (typeof imageUrl !== "string" || !imageUrl.startsWith("/"))) {
      return badRequest("imageUrl must be a local path starting with '/' (e.g. /products/cupcake.jpg).");
    }

    // Transaction: the product and (maybe) its stock row are created
    // together — never one without the other.
    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: { name, category, price, description, emoji, imageUrl, available },
      });
      if (!isMadeToOrder(category as ProductCategory)) {
        await tx.inventoryItem.create({
          data: { productId: createdProduct.id, quantity: 0, lowStockThreshold: 5 },
        });
      }
      return tx.product.findUniqueOrThrow({
        where: { id: createdProduct.id },
        include: { inventory: { select: { quantity: true, lowStockThreshold: true, lastUpdated: true } } },
      });
    });

    return created(product);
  } catch (err) {
    console.error("[products:POST]", err);
    return serverError();
  }
}
