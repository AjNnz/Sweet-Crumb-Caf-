import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/backend/session";

/**
 * POST /api/auth/logout — "deletes" the session by overwriting the cookie
 * with an empty one that instantly expires. There is nothing server-side
 * to remove: the cookie itself WAS the session.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
