"use client";

import { useStore } from "@/context/store";
import type { Product } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Modal } from "@/components/common/ui/modal";

/* ------------------------------------------------------------------ */
/* The two destructive-action confirms. Each is mounted only while a   */
/* product is selected (see index.tsx).                                */
/* ------------------------------------------------------------------ */

/* Archive = hide from menu, keep in history and reports. */
export function ArchiveConfirm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { archiveProduct } = useStore();
  const { toast } = useToast();
  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title="Archive product?"
      description={`${product?.name ?? ""} will be hidden from the menu but kept in history and reports.`}
      confirmLabel="Archive"
      confirmVariant="secondary"
      onConfirm={() => {
        if (product) {
          archiveProduct(product.id);
          toast("Product archived.");
        }
        onClose();
      }}
    />
  );
}

/* Delete = permanent. The database refuses when the product is on past
 * orders — surface that advice instead of a false success toast. */
export function DeleteConfirm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { deleteProduct } = useStore();
  const { toast } = useToast();
  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title="Delete product permanently?"
      description={`${product?.name ?? ""} and its inventory record will be removed. Past transactions keep their item snapshots.`}
      confirmLabel="Delete"
      confirmVariant="danger"
      onConfirm={async () => {
        if (product) {
          const result = await deleteProduct(product.id);
          if (result.ok) toast("Product deleted.", "info");
          else toast(result.error ?? "Could not delete the product.", "error");
        }
        onClose();
      }}
    />
  );
}
