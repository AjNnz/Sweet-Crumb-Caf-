import { prisma } from "@/lib/prisma";
import { badRequest, ok, readJson, serverError } from "@/lib/backend/http";
import { hashPassword } from "@/lib/backend/password";
import { validPassword } from "@/lib/backend/users";

/**
 * POST /api/auth/forgot-password — the mock's demo-grade password reset.
 *
 * HONEST SECURITY NOTE: a real app emails a time-limited reset LINK and
 * never accepts a new password directly — there is no way to prove the
 * person typing is the account owner. This endpoint keeps the demo's
 * behaviour (and even reveals whether an email exists, which a production
 * app would never confirm). Fine for a local demo; the comment exists so
 * nobody mistakes it for the real pattern.
 */
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    if (!validPassword(body.newPassword)) return badRequest("Password must be at least 6 characters.");

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return badRequest("No account found with that email.");

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(body.newPassword) },
    });
    return ok({ reset: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return serverError();
  }
}
