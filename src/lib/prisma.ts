import { PrismaClient } from "@prisma/client";

// ONE PrismaClient per process — without this, dev hot-reloads would
// open a new DB connection on every file save until SQLite gives up.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;