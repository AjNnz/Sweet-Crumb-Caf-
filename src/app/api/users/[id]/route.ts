import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, forbidden, notFound, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";
import { hashPassword } from "@/lib/backend/password";
import { EMAIL_RE, publicUser, validPassword } from "@/lib/backend/users";

/* ------------------------------------------------------------------ */
/* PATCH /api/users/[id] — edit a team account (ADMIN only):           */
/* name, email, role, password reset, ACTIVE/INACTIVE.                 */
/*                                                                     */
/* Three self-preservation guards the mock's UI implied but never      */
/* enforced — now the SERVER enforces them:                            */
/*   1. you can't deactivate your own account                          */
/*   2. you can't change your own role                                 */
/*   3. the café must always keep at least one ACTIVE admin            */
/* ------------------------------------------------------------------ */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getSessionUser(request);
    if (!admin) return unauthorized();
    if (admin.role !== "ADMIN") return forbidden("Only the admin can manage accounts.");

    const { id } = await params;
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return notFound("Account not found.");

    const data: { name?: string; email?: string; role?: string; status?: string; passwordHash?: string } = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > 80) return badRequest("Name is required (max 80 characters).");
      data.name = name;
    }
    if (body.email !== undefined) {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!EMAIL_RE.test(email) || email.length > 120) return badRequest("Enter a valid email.");
      if (email !== target.email) {
        const taken = await prisma.user.findFirst({ where: { email, id: { not: id } } });
        if (taken) return badRequest("Email is already in use.");
      }
      data.email = email;
    }
    if (body.role !== undefined) {
      const role = typeof body.role === "string" ? body.role : "";
      if (!["STAFF", "RIDER", "ADMIN"].includes(role)) return badRequest("Role must be STAFF, RIDER or ADMIN.");
      if (target.id === admin.id && role !== admin.role) {
        return badRequest("You can't change your own role.");
      }
      data.role = role;
    }
    if (body.status !== undefined) {
      const status = typeof body.status === "string" ? body.status : "";
      if (!["ACTIVE", "INACTIVE"].includes(status)) return badRequest("status must be ACTIVE or INACTIVE.");
      if (target.id === admin.id && status === "INACTIVE") {
        return badRequest("You can't deactivate your own account.");
      }
      data.status = status;
    }
    if (body.password !== undefined && body.password !== "") {
      if (!validPassword(body.password)) return badRequest("Password must be at least 6 characters.");
      data.passwordHash = await hashPassword(body.password);
    }

    // Guard 3: never remove the last active admin (by deactivation or demotion).
    if (
      target.role === "ADMIN" &&
      ((data.status === "INACTIVE") || (data.role !== undefined && data.role !== "ADMIN"))
    ) {
      const otherActiveAdmins = await prisma.user.count({
        where: { role: "ADMIN", status: "ACTIVE", id: { not: id } },
      });
      if (otherActiveAdmins === 0) {
        return badRequest("The café needs at least one active admin.");
      }
    }

    if (Object.keys(data).length === 0) return badRequest("Nothing to update.");
    const updated = await prisma.user.update({ where: { id }, data });
    return ok(publicUser(updated));
  } catch (err) {
    console.error("[users:PATCH]", err);
    return serverError();
  }
}
