"use client";

import { useState } from "react";

import { useStore } from "@/context/store";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/common/ui/button";
import { Field, Input, Select, Textarea } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";
import { cn } from "@/lib/utils";

const BLANK = { name: "", category: "Cupcakes" as ProductCategory, price: "", description: "", emoji: "🧁", available: true };
const EMOJI_CHOICES = ["🧁", "🍰", "🎂", "🥐", "🥮", "🥠", "🍪", "☕", "🧋", "🍵", "🥤", "🍫", "🍹", "🍩"];

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
        }
      : BLANK,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        <Field label="Product image placeholder" className="sm:col-span-2">
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
