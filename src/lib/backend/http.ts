import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/* Response helpers — one consistent shape for the whole API           */
/*                                                                     */
/* Success: the data itself.  Failure: { error: "message" } plus the   */
/* right HTTP status code. The frontend can then trust:                */
/*   res.ok  → data is in the body                                     */
/*   !res.ok → { error } explains why                                  */
/* ------------------------------------------------------------------ */

export function ok<T>(data: T) {
  return NextResponse.json(data);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Please sign in.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "You do not have permission to do that.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found.") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Something went wrong.") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Read and parse a JSON request body. Returns null when absent/malformed
 * so every route can start with the same guard instead of try/catch. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
