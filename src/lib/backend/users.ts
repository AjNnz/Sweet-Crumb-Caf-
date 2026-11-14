import type { User } from "@prisma/client";

/* ------------------------------------------------------------------ */
/* Shared user helpers.                                                */
/* ------------------------------------------------------------------ */

/** Same email pattern the login/signup forms use — one rule, both sides. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The only password rule in the whole app (matching the mock's forms). */
export function validPassword(plain: unknown): plain is string {
  return typeof plain === "string" && plain.length >= 6 && plain.length <= 100;
}

/**
 * Strip the password hash before ANY user data leaves the server.
 * Every users route returns THIS shape and nothing fatter — one leak of
 * `passwordHash` in some JSON response and the whole auth system is moot.
 */
export function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    contact: user.contact,
    createdAt: user.createdAt,
  };
}
