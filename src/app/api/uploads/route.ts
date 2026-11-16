import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSessionUser } from "@/lib/backend/session";
import { badRequest, forbidden, ok, serverError, unauthorized } from "@/lib/backend/http";

/* ------------------------------------------------------------------ */
/* POST /api/uploads — save a product photo (ADMIN only).              */
/*                                                                     */
/* The browser sends multipart form-data with an image in the "file"   */
/* field; we validate it, give it a collision-proof name, and store it */
/* in "public/ba pics/uploads/" so the usual <Image> rendering (and    */
/* next/image's optimizer) picks it up like every other photo.         */
/* The returned { url } is what the product row stores in imageUrl.    */
/* ------------------------------------------------------------------ */

/** Accepted image types → file extension. The MIME type is what the
 * browser reports; the extension whitelist keeps the filename valid. */
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — plenty for a product photo

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden("Only the admin can upload product images.");

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return badRequest("Expected an image file in the 'file' field.");
    if (file.size === 0) return badRequest("The file is empty.");
    if (file.size > MAX_BYTES) return badRequest("Image must be 5 MB or smaller.");

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) return badRequest("Only PNG, JPEG, WebP or GIF images are allowed.");

    // Build a filesystem-safe name from the original: slugify it and add
    // a timestamp so two uploads never overwrite each other.
    const base =
      file.name
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "product";
    const fileName = `${base}-${Date.now()}${ext}`;

    const dir = path.join(process.cwd(), "public", "ba pics", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));

    // Store the raw path (spaces intact) — next/image percent-encodes it.
    return ok({ url: `/ba pics/uploads/${fileName}` });
  } catch (err) {
    console.error("[uploads:POST]", err);
    return serverError("Image upload failed.");
  }
}
