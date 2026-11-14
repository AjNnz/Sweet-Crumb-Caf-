import { prisma } from "@/lib/prisma";
import { badRequest, created, readJson, serverError } from "@/lib/backend/http";
import { hashPassword } from "@/lib/backend/password";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/backend/session";
import { EMAIL_RE, publicUser, validPassword } from "@/lib/backend/users";

/**
 * POST /api/auth/register — the public signup form (customers only).
 * Staff accounts are NEVER created here — they come from the admin's
 * staff-management screen. Mirrors the mock: after registering, the user
 * is signed in immediately (the session cookie is set on this response).
 */
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 80) return badRequest("Name is required (max 80 characters).");

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email) || email.length > 120) return badRequest("Enter a valid email.");

    if (!validPassword(body.password)) return badRequest("Password must be at least 6 characters.");
    const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 40) : null;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return badRequest("An account with this email already exists.");

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "CUSTOMER", contact },
    });

    // Auto-login, exactly like the mock did after signup.
    const response = created(publicUser(user));
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (err) {
    console.error("[register]", err);
    return serverError();
  }
}
