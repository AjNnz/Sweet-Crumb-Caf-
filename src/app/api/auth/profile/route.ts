import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";
import { verifyPassword, hashPassword } from "@/lib/backend/password";
import { EMAIL_RE, publicUser, validPassword } from "@/lib/backend/users";

/**
 * PATCH /api/auth/profile — a CUSTOMER edits their own profile.
 * Changing the password requires proving the current one first — a stolen
 * tab must not be able to lock the real owner out.
 */
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized("Please sign in to update your profile.");
    if (user.role !== "CUSTOMER") return unauthorized("Only customer profiles are editable here.");

    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 80) : user.name;

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) return badRequest("Email is required.");
    if (!EMAIL_RE.test(email) || email.length > 120) return badRequest("Enter a valid email.");
    if (email !== user.email) {
      const taken = await prisma.user.findFirst({ where: { email, id: { not: user.id } } });
      if (taken) return badRequest("Another account already uses that email.");
    }

    const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 40) : user.contact;

    const data: { name: string; email: string; contact: string | null; passwordHash?: string } = {
      name,
      email,
      contact,
    };

    if (body.newPassword !== undefined && body.newPassword !== "") {
      if (!validPassword(body.newPassword)) return badRequest("New password must be at least 6 characters.");
      const currentOk = typeof body.currentPassword === "string" && (await verifyPassword(body.currentPassword, user.passwordHash));
      if (!currentOk) return badRequest("Current password is incorrect.");
      data.passwordHash = await hashPassword(body.newPassword);
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return ok(publicUser(updated));
  } catch (err) {
    console.error("[profile]", err);
    return serverError();
  }
}
