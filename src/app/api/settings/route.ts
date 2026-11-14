import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/backend/session";
import { badRequest, forbidden, ok, readJson, serverError, unauthorized } from "@/lib/backend/http";

/* ------------------------------------------------------------------ */
/* CafeSettings — a SINGLE row (id "singleton"). Relational databases  */
/* don't do key/value configs well; one row of typed columns is the    */
/* clean way to store "the one café's settings".                       */
/*                                                                     */
/* GET is public: the storefront header/footer shows the café name,    */
/* address and opening hours to signed-out visitors too.               */
/* PATCH is admin-only.                                                */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  id: "singleton",
  cafeName: "Sweet Crumb Café",
  address: "BangBang, Cordova, Cebu",
  phone: "(02) 8123 4567",
  email: "hello@sweetcrumb.ph",
  openingHours: "8:00 AM – 9:00 PM daily",
  currency: "PHP",
};

export async function GET() {
  try {
    // First read creates the row with the mock's seed values, so the app
    // works out of the box on a fresh database.
    const settings = await prisma.cafeSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: DEFAULTS,
    });
    return ok(settings);
  } catch (err) {
    console.error("[settings:GET]", err);
    return serverError();
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only the admin can change café settings.");

    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body.");

    const data: Record<string, string> = {};
    for (const field of ["cafeName", "address", "phone", "email", "openingHours"] as const) {
      if (body[field] !== undefined) {
        const value = typeof body[field] === "string" ? (body[field] as string).trim() : "";
        if (!value || value.length > 120) return badRequest(`${field} must be 1-120 characters.`);
        data[field] = value;
      }
    }
    if (body.currency !== undefined) {
      const currency = typeof body.currency === "string" ? body.currency.trim() : "";
      if (!["PHP", "USD"].includes(currency)) return badRequest("currency must be PHP or USD.");
      data.currency = currency;
    }
    if (Object.keys(data).length === 0) return badRequest("Nothing to update.");

    const settings = await prisma.cafeSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { ...DEFAULTS, ...data },
    });
    return ok(settings);
  } catch (err) {
    console.error("[settings:PATCH]", err);
    return serverError();
  }
}
