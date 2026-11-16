/**
 * One-off CLI script: attaches the real product photos in /public/ba pics
 * to each product row (imageUrl), keeping emoji as the fallback visual.
 *
 *   npx tsx prisma/set-product-images.ts
 *
 * Images are organized into one subfolder per menu category:
 *   ba pics/cupcakes/ · ba pics/cakes/ · ba pics/pastries/
 *   ba pics/coffee/ · ba pics/other drinks/
 *
 * The DB stores a raw path (spaces intact) because next/image
 * percent-encodes it itself; pre-encoding would double-encode (%20 → %2520).
 */
import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";

import { prisma } from "../src/lib/prisma";

/** productId → file path under public/ba pics (subfolder = product category). */
const PRODUCT_IMAGES: Record<string, string> = {
  // ---- Cupcakes (prd-001..004 original + prd-021..028 October refresh) ----
  "prd-001": "cupcakes/classic chocolate cupcake.png",
  "prd-002": "cupcakes/red velvet cupcake.png",
  "prd-003": "cupcakes/salted caramel cupcake.png",
  "prd-004": "cupcakes/Vanilla Bean Cupcake.png",
  "prd-021": "cupcakes/double chocolate fudge cupcake.png",
  // File name has a typo ("cupckae") — matches product "Cookies & Cream Cupcake".
  "prd-022": "cupcakes/cookies and cream cupckae.png",
  "prd-023": "cupcakes/carrot walnut cupcake.png",
  "prd-024": "cupcakes/matcha cupcake.png",
  "prd-025": "cupcakes/banana pudding cupcake.png",
  "prd-026": "cupcakes/buko pandan cupcake.png",
  "prd-027": "cupcakes/coffee mocha cupcake.png",
  "prd-028": "cupcakes/strawberry lemonade cupcake.png",
  // ---- Cakes (slices + whole cakes) ----
  "prd-005": "cakes/chocolate dream cake.png",
  "prd-006": "cakes/blueberry cheesecake.png",
  "prd-007": "cakes/Whole carrot cake.png",
  "prd-008": "cakes/mocha torte.png",
  "prd-029": "cakes/ube macapuno cake slice.png",
  "prd-030": "cakes/mango graham cake.png",
  "prd-031": "cakes/red velvet whole cake.png",
  "prd-032": "cakes/tiramisu cake slice.png",
  "prd-033": "cakes/pandan chiffon cake.png",
  // ---- Pastries ----
  "prd-009": "pastries/butter croissant.png",
  "prd-010": "pastries/cinnamon roll.png",
  "prd-011": "pastries/Ube Ensaymada.png",
  "prd-012": "pastries/chocolate chip cookie.png",
  "prd-034": "pastries/classic pandesal.png",
  // File named "cheesy" — matches product "Cheese Pandesal".
  "prd-035": "pastries/cheesy pandesal.png",
  "prd-036": "pastries/spanish bread.png",
  "prd-037": "pastries/kabayan roll.png",
  "prd-038": "pastries/pan de coco.png",
  "prd-039": "pastries/apple pie slice.png",
  "prd-040": "pastries/banana bread.png",
  "prd-041": "pastries/fudge brownie.png",
  // File name has a typo ("scotchbar") — matches product "Butterscotch Bar".
  "prd-042": "pastries/butter scotchbar.png",
  "prd-043": "pastries/cream puff.png",
  // ---- Coffee (the menu's Cappuccino uses the hot version; "cappuccino iced.png"
  // is reserved for a future iced variant) ----
  "prd-013": "coffee/hot americano.png",
  "prd-014": "coffee/cafe latte.png",
  // File name has a typo ("Machiato") — matches product "Salted Caramel Macchiato".
  "prd-015": "coffee/Salted Caramel Machiato.png",
  // File named "iced brew" — this is the Cold Brew product.
  "prd-016": "coffee/iced brew.png",
  "prd-044": "coffee/cappuccino hot coffee.png",
  "prd-045": "coffee/mocha latte.png",
  "prd-046": "coffee/caramel cold brew hot.png",
  "prd-047": "coffee/flat white.png",
  "prd-048": "coffee/vietnamese iced coffee.png",
  // ---- Other drinks ----
  "prd-017": "other drinks/iced matcha latte.png",
  "prd-018": "other drinks/Strawberry Frappe.png",
  "prd-019": "other drinks/hot chocolate.png",
  "prd-020": "other drinks/calamansi cooler.png",
  "prd-049": "other drinks/mango smoothie.png",
  // File name has a typo ("slash") — matches product "Watermelon Slush".
  "prd-050": "other drinks/watermelon slash.png",
  "prd-051": "other drinks/lychee sparkling fizz.png",
  "prd-052": "other drinks/matcha frappe.png",
  "prd-053": "other drinks/cucumber lemon cooler.png",
  "prd-054": "other drinks/salted toffee frappe.png",
  "prd-055": "other drinks/pandan lemongrass tea.png",
};

async function main() {
  let updated = 0;
  for (const [productId, fileName] of Object.entries(PRODUCT_IMAGES)) {
    // Every path must exist on disk — refuse silently-broken images.
    const diskPath = path.join(process.cwd(), "public", "ba pics", fileName);
    if (!existsSync(diskPath)) {
      console.warn(`⚠ ${productId}: missing file "${fileName}" — skipped`);
      continue;
    }
    const imageUrl = `/ba pics/${fileName}`;
    const product = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
      select: { id: true, name: true },
    });
    updated++;
    console.log(`✓ ${product.id} ${product.name} → ${imageUrl}`);
  }
  console.log(`\nUpdated ${updated}/${Object.keys(PRODUCT_IMAGES).length} products.`);
}

main()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
