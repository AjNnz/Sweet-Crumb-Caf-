"use client";

import { useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import { useStore } from "@/context/store";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/common/ui/button";
import { Field, Input, Select, Textarea } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";
import Image from "next/image";
import { cn } from "@/lib/utils";

const BLANK = { name: "", category: "Cupcakes" as ProductCategory, price: "", description: "", emoji: "🧁", available: true, imageUrl: null as string | null };
const EMOJI_CHOICES = ["🧁", "🍰", "🎂", "🥐", "🥮", "🥠", "🍪", "☕", "🧋", "🍵", "🥤", "🍫", "🍹", "🍩"];
/** MIME types the photo input accepts (must match /api/uploads). */
const PHOTO_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

/* ------------------------------------------------------------------ */
/* Add/Edit product modal. Mounted only while a product is being       */
/* edited (`product === undefined` means "new"), so the form starts    */
/* fresh every time it opens.                                          */
/* ------------------------------------------------------------------ */
export function ProductFormModal({
  product,
  onClose,
}: {
  /** The product being edited, or undefined when creating a new one. */
  product?: Partial<Product> & { id?: string };
  onClose: () => void;
}) {
  const { saveProduct } = useStore();
  const { toast } = useToast();
  // Seeds from the product row (or BLANK for a new product) on mount.
  const [form, setForm] = useState(() =>
    product?.id
      ? {
          name: product.name ?? "",
          category: product.category ?? "Cupcakes",
          price: String(product.price ?? ""),
          description: product.description ?? "",
          emoji: product.emoji ?? "🧁",
          available: product.available ?? true,
          imageUrl: product.imageUrl ?? null,
        }
      : BLANK,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Photo upload bookkeeping: a file is in flight to /api/uploads, and the
  // dropzone lights up while the admin drags a picture over it.
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  /* Uploads the chosen image right away (before "Save"), so the admin sees
   * the real preview and the stored imageUrl matches what's on disk. */
  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (res.ok && data?.url) {
        setForm((f) => ({ ...f, imageUrl: data.url! }));
        toast("Image uploaded.", "success");
      } else {
        toast(data?.error ?? "Image upload failed.", "error");
      }
    } catch {
      toast("Image upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const onPhotoPicked = (e: ChangeEvent<HTMLInputElement>) => {
    // Reset the input first so picking the SAME file again still fires change.
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void uploadPhoto(file);
  };

  const onPhotoDropped = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadPhoto(file);
  };

  const save = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required.";
    const price = Number(form.price);
    if (!form.price || Number.isNaN(price) || price <= 0) errs.price = "Enter a valid price.";
    if (!form.description.trim()) errs.description = "A short description is required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    saveProduct({
      id: product?.id,
      name: form.name.trim(),
      category: form.category,
      price,
      description: form.description.trim(),
      emoji: form.emoji,
      // Always send the photo: null (or unchanged) clears/keeps it on PATCH,
      // and a fresh upload's path is what the menu will render.
      imageUrl: form.imageUrl,
      // an available product with 0 stock still shows "sold out" correctly in the menu
      available: form.available,
      ...(product?.id ? {} : { archived: false, createdAt: new Date().toISOString() }),
    });
    // saveProduct also creates the opening inventory entry (qty 0) for new products
    toast(product?.id ? "Product updated." : "Product added to the menu.");
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} title={product?.id ? "Edit Product" : "Add New Product"} wide>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <Field label="Product name" error={errors.name}>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Classic Chocolate Cupcake" />
        </Field>
        <Field label="Category" error={errors.category}>
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Price (₱)" error={errors.price}>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="100.00"
          />
        </Field>
        <Field label="Availability">
          <Select value={form.available ? "yes" : "no"} onChange={(e) => setForm({ ...form, available: e.target.value === "yes" })}>
            <option value="yes">Available for ordering</option>
            <option value="no">Hidden / unavailable</option>
          </Select>
        </Field>
        <Field label="Description" error={errors.description} className="sm:col-span-2">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short, appetizing description…" />
        </Field>
        {/* Product photo — a real file upload (click or drag-and-drop).
         * The upload happens immediately via /api/uploads and the preview
         * shows the exact photo the menu will render. The emoji picker
         * below only matters when NO photo was uploaded. */}
        <Field label="Product photo" className="sm:col-span-2">
          <div className="flex flex-wrap items-start gap-4">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onPhotoDropped}
              className={cn(
                "relative flex h-40 w-40 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed text-center transition-colors",
                dragOver ? "border-accent bg-latte" : "border-primary/25 bg-cream hover:border-accent",
              )}
            >
              {form.imageUrl ? (
                /* Show the actual photo (whole product visible, same treatment
                 * as the menu) plus a remove button outside this label. */
                <Image src={form.imageUrl} alt="Product photo preview" fill sizes="160px" className="object-contain" />
              ) : (
                <>
                  <span className="text-3xl">🖼️</span>
                  <span className="px-3 text-xs text-mocha">{uploading ? "Uploading…" : "Click to choose a photo — or drag one here"}</span>
                </>
              )}
              <input type="file" accept={PHOTO_ACCEPT} onChange={onPhotoPicked} disabled={uploading} className="hidden" />
            </label>
            <div className="flex flex-col gap-2 text-xs text-mocha">
              <p>PNG, JPEG, WebP or GIF · up to 5 MB.</p>
              <p>The photo shows on the menu, product page and POS. It replaces the emoji fallback.</p>
              <div className="flex gap-2">
                {uploading && <span className="font-semibold text-accent">Uploading…</span>}
                {form.imageUrl && !uploading && (
                  <Button
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setForm({ ...form, imageUrl: null })}
                  >
                    Remove photo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Field>
        <Field label="Fallback emoji (shown only when there's no photo)" className="sm:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setForm({ ...form, emoji: e })}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition-colors",
                  form.emoji === e ? "border-primary bg-latte ring-2 ring-accent/50" : "border-primary/15 hover:bg-cream",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>{product?.id ? "Save changes" : "Add product"}</Button>
      </div>
    </Modal>
  );
}
