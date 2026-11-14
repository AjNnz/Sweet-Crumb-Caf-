/**
 * CLI entry point for demo seeding:
 *   npx tsx prisma/seed.ts
 *
 * The actual seeding logic lives in src/lib/backend/seed.ts so the same
 * code also powers the admin's "Reset demo data" button (which calls the
 * /api/dev/reset-demo endpoint). dotenv loads .env because the bare Node
 * process (unlike Next.js) doesn't read it automatically.
 */
import "dotenv/config";

import { resetAndSeed } from "../src/lib/backend/seed";
import { prisma } from "../src/lib/prisma";

resetAndSeed()
  .then((counts) => {
    console.log(
      `Seeded: ${counts.users} users, ${counts.products} products, ` +
        `${counts.inventoryItems} stock items, ${counts.movements} stock movements, ` +
        `${counts.orders} orders.`,
    );
    return prisma.$disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
