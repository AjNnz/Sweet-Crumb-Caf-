"use client";

import { Modal } from "@/components/common/ui/modal";
import type { InventoryItem, InventoryMovement, Product } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

/* Movement history modal — the paper trail of one stock row. */

const MOVEMENT_LABEL: Record<InventoryMovement["type"], string> = {
  ADD: "Stock added",
  SOLD: "Sold",
  WASTED: "Wasted / unsold",
  ADJUSTMENT: "Adjustment",
};

export function HistoryModal({
  product,
  inv,
  onClose,
}: {
  product?: Product;
  inv: InventoryItem | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!inv}
      onClose={onClose}
      title={`Movement history — ${product?.name ?? ""}`}
      wide
    >
      {inv ? (
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-primary/10 text-left text-mocha">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Type</th>
                <th className="py-2 pr-2 text-right">Quantity</th>
                <th className="py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {[...inv.movements].reverse().slice(0, 40).map((m) => (
                <tr key={m.id} className="border-b border-primary/5">
                  <td className="py-2 pr-2 whitespace-nowrap text-mocha">{formatDateTime(m.date)}</td>
                  <td className="py-2 pr-2 font-semibold text-espresso">{MOVEMENT_LABEL[m.type]}</td>
                  <td className="py-2 pr-2 text-right font-mono">
                    {m.type === "ADD" || (m.type === "ADJUSTMENT" && m.quantity >= 0) ? "+" : m.type === "SOLD" || m.type === "WASTED" ? "−" : "+"}
                    {m.quantity}
                  </td>
                  <td className="py-2 text-mocha">{m.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!inv.movements.length ? (
            <p className="py-8 text-center text-sm text-mocha">No movements recorded yet.</p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
