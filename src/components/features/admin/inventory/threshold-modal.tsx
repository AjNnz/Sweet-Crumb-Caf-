"use client";

import { useState } from "react";

import { useStore } from "@/context/store";
import type { InventoryItem, Product } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/common/ui/button";
import { Field, Input } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";

/* Threshold modal — edit the "alert when at or below" level for a stock row. */
export function ThresholdModal({
  item,
  onClose,
}: {
  item: { product: Product; inv: InventoryItem } | null;
  onClose: () => void;
}) {
  const { setLowStockThreshold } = useStore();
  const { toast } = useToast();
  // Seeds from the row being edited (fresh mount on every open)
  const [value, setValue] = useState(() => (item ? String(item.inv.lowStockThreshold) : ""));

  const save = () => {
    const v = Number(value);
    if (item && !Number.isNaN(v) && v >= 0) {
      setLowStockThreshold(item.product.id, v);
      toast("Threshold updated.");
    }
    onClose();
  };

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={`Low-stock threshold — ${item?.product.name ?? ""}`}
    >
      <Field label="Alert when quantity falls to or below">
        <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} className="max-w-32" />
      </Field>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>Save</Button>
      </div>
    </Modal>
  );
}
