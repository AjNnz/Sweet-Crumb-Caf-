import { getSessionUser } from "@/lib/backend/session";
import { forbidden, ok, serverError, unauthorized } from "@/lib/backend/http";
import { resetAndSeed } from "@/lib/backend/seed";

/**
 * POST /api/dev/reset-demo — the admin's "Reset demo data" button, now
 * REAL: it wipes the database and regenerates the full demo scenario
 * (accounts, menu, stock, 60 days of history) with fresh dates.
 */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only the admin can reset the demo data.");

    const counts = await resetAndSeed();
    return ok({ reset: true, ...counts });
  } catch (err) {
    console.error("[reset-demo]", err);
    return serverError();
  }
}
