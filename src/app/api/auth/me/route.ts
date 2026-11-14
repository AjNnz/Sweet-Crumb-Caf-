import { getSessionUser } from "@/lib/backend/session";
import { ok, unauthorized } from "@/lib/backend/http";

/**
 * GET /api/auth/me — "who am I?" The frontend calls this on every page
 * load to restore the session. Never returns the passwordHash.
 */
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    return ok({ id: user.id, name: user.name, email: user.email, role: user.role, contact: user.contact });
  } catch (err) {
    console.error("[me]", err);
    return unauthorized(); // broken/missing secret → treat as signed out
  }
}
