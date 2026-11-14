import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/* Cookie sessions                                                     */
/*                                                                     */
/* After login the browser stores a cookie that only the server can    */
/* read (httpOnly — JavaScript on the page can never steal it). The    */
/* cookie is not encrypted but it IS SIGNED: "userId.expiry" plus an   */
/* HMAC fingerprint. A user editing their cookie can't forge a valid   */
/* fingerprint without the server's SESSION_SECRET.                    */
/*                                                                     */
/* Cookie format:  <userId>.<expiryMillis>.<hmac-sha256-of-the-above>  */
/* ------------------------------------------------------------------ */

const COOKIE_NAME = "cafe_session";
const SESSION_TTL_MS = 7 * 24 * 3600 * 1000; // one week

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is missing — add it to .env and restart.");
  return s;
}

/** HMAC fingerprint of a payload, keyed with the server secret. */
function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(userId: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true, // invisible to page JavaScript — XSS can't steal it
    sameSite: "lax" as const, // sent on normal navigation + same-site fetches
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
    secure: process.env.NODE_ENV === "production", // HTTPS-only once deployed
  };
}

/** Read one cookie from the raw Cookie header. Works with every request
 * type — plain `Request` objects don't have a `.cookies` helper. */
function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Verify the cookie's signature and expiry. Returns the userId or null. */
export function readSessionUserId(request: Request): string | null {
  const raw = readCookie(request, COOKIE_NAME);
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, mac] = parts;
  // Constant-time comparison so attackers can't time their way to a valid MAC.
  const expected = Buffer.from(sign(`${userId}.${expires}`));
  const provided = Buffer.from(mac);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) return null;
  if (Number(expires) < Date.now()) return null; // session expired
  return userId;
}

/** The full logged-in user (fresh from the DB), or null. Routes also use
 * the returned role to decide permissions. */
export async function getSessionUser(request: Request) {
  const userId = readSessionUserId(request);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE") return null;
  return user;
}

export const SESSION_COOKIE = COOKIE_NAME;
