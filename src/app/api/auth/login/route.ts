import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/backend/password";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/backend/session";
import { badRequest, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";

/**
 * POST /api/auth/login  — body: { email, password }
 * Sets the session cookie on success. Notice the SAME generic error for
 * "no such account" and "wrong password": we never reveal which emails
 * exist, that would be a gift to attackers.
 */
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!email || !password) return badRequest("Email and password are required.");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE") return unauthorized("Invalid email or password.");

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return unauthorized("Invalid email or password.");

    const response = ok({ id: user.id, name: user.name, email: user.email, role: user.role });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (err) {
    console.error("[login]", err);
    return serverError();
  }
}
