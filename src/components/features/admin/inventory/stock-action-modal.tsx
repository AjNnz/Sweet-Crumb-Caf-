"use client";

import { useStore } from "@/context/store";
import type { InventoryItem, Product } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/common/ui/button";
import { Field, Input, Select, Textarea } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";
import type { InventoryMovement } from "@/lib/types";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Stock action modal — ADD a batch, record WASTAGE, or recount as an   */
/* ADJUSTMENT. Mounted only while `item` is set, so its form state      */
/* starts fresh every time it opens.                                    */
/* ------------------------------------------------------------------ */

export function StockActionModal({
  item,
  onClose,
}: {
  item: { product: Product; inv: InventoryItem } | null;
  onClose: () => void;
}) {
  const { adjustStock } = useStore();
  const { toast } = useToast();
  const [form, setForm] = useState({ type: "ADD" as InventoryMovement["type"], quantity: "", note: "" });

  const submit = () => {
    if (!item) return;
    const qty = Number(form.quantity);
    if (!form.quantity || Number.isNaN(qty) || qty < 0) {
      toast("Enter a valid quantity.", "error");
      return;
    }
    if (form.type === "WASTED" && qty > item.inv.quantity) {
      toast("Cannot waste more than the available quantity.", "error");
      return;
    }
    if (form.type === "ADJUSTMENT" && !form.note.trim()) {
      toast("Adjustments require a note explaining the recount.", "error");
      return;
    }
    adjustStock(item.product.id, form.type, qty, form.note.trim() || undefined);
    const verb = form.type === "ADD" ? "Stock added" : form.type === "WASTED" ? "Wastage recorded" : "Quantity adjusted";
    toast(`${verb} for ${item.product.name}.`);
    onClose();
  };

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={`Adjust stock — ${item?.product.name ?? ""}`}
      description={item ? `Currently ${item.inv.quantity} units available.` : ""}
    >
      <div className="grid gap-4 text-sm">
        <Field label="Action">
          <Select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as InventoryMovement["type"] })}
          >
            <option value="ADD">➕ Add stock (new batch)</option>
            <option value="WASTED">🗑 Record wastage / unsold</option>
            <option value="ADJUSTMENT">🔁 Recount adjustment (set exact)</option>
          </Select>
        </Field>
        {form.type !== "ADJUSTMENT" ? (
          <Field label="Quantity">
            <Input
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="0"
            />
          </Field>
        ) : (
          <Field label="Corrected quantity on hand">
            <Input
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder={String(item?.inv.quantity ?? 0)}
            />
          </Field>
        )}
        <Field
          label={form.type === "ADJUSTMENT" ? "Reason (required)" : "Note (optional)"}
          error={form.type === "ADJUSTMENT" && !form.note.trim() && form.quantity !== "" ? "Required" : undefined}
        >
          <Textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder={form.type === "WASTED" ? "e.g. unsold at closing, damaged packaging…" : "e.g. morning batch, recount after stock taking…"}
            className="min-h-16"
          />
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit}>Apply</Button>
      </div>
    </Modal>
  );
}
