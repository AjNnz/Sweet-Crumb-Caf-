import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, created, forbidden, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";
import { hashPassword } from "@/lib/backend/password";
import { EMAIL_RE, publicUser, validPassword } from "@/lib/backend/users";

/* ------------------------------------------------------------------ */
/* GET /api/users — the account directory.                             */
/*   ADMIN          → everyone (staff management + customers view)     */
/*   STAFF / RIDER  → team members only (e.g. the rider board shows    */
/*                    who is handling which delivery)                  */
/*   CUSTOMER       → 403 (customer emails are private)                */
/* Password hashes never leave the server.                             */
/* ------------------------------------------------------------------ */
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role === "CUSTOMER") return forbidden("The account directory is staff-only.");

    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const allowed = ["ADMIN", "STAFF", "RIDER", "CUSTOMER"];

    const users = await prisma.user.findMany({
      where: role && allowed.includes(role)
        ? { role }
        : user.role === "ADMIN"
          ? undefined
          : { role: { not: "CUSTOMER" } }, // staff/riders see the team, not the customers
      orderBy: { createdAt: "asc" },
    });
    return ok(users.map(publicUser));
  } catch (err) {
    console.error("[users:GET]", err);
    return serverError();
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/users — create a team account (ADMIN only).               */
/* Mirrors the mock: staff screen requires an initial password; roles  */
/* offered are STAFF / RIDER / ADMIN. Customers register themselves.   */
/* ------------------------------------------------------------------ */
export async function POST(request: Request) {
  try {
    const admin = await getSessionUser(request);
    if (!admin) return unauthorized();
    if (admin.role !== "ADMIN") return forbidden("Only the admin can create team accounts.");

    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 80) return badRequest("Name is required (max 80 characters).");

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email) || email.length > 120) return badRequest("Enter a valid email.");

    const role = typeof body.role === "string" ? body.role : "";
    if (!["STAFF", "RIDER", "ADMIN"].includes(role)) {
      return badRequest("Role must be STAFF, RIDER or ADMIN (customers sign themselves up).");
    }

    // The mock's default password for a quick staff account: cafe123.
    const password = body.password === undefined || body.password === "" ? "cafe123" : body.password;
    if (!validPassword(password)) return badRequest("Password must be at least 6 characters.");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return badRequest("Email is already in use.");

    const createdUser = await prisma.user.create({
      data: { name, email, role, passwordHash: await hashPassword(password) },
    });
    return created(publicUser(createdUser));
  } catch (err) {
    console.error("[users:POST]", err);
    return serverError();
  }
}
