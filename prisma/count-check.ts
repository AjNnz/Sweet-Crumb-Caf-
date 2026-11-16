/**
 * One-off: row counts per table + distinct customer names, to check the
 * "50 data points on 5 variables" course requirement.
 *   npx tsx prisma/count-check.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [users, products, orders, orderItems, inventory, movements] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.inventoryItem.count(),
    prisma.stockMovement.count(),
  ]);

  const groupedNames = await prisma.order.groupBy({
    by: ["customerName"],
    _count: { customerName: true },
  });
  const customers = groupedNames.length;

  console.log({ users, products, orders, orderItems, inventory, movements, distinctCustomerNames: customers });
  console.log("\nTop 5 most frequent customer names:");
  for (const g of [...groupedNames].sort((a, b) => b._count.customerName - a._count.customerName).slice(0, 5)) {
    console.log(`  ${g.customerName}: ${g._count.customerName}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
