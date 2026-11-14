"use client";

import { useStore } from "@/context/store";
import { Button } from "@/components/common/ui/button";
import { Modal } from "@/components/common/ui/modal";
import { formatCurrency } from "@/lib/utils";
import type { Receipt } from "./aggregation";

/* ------------------------------------------------------------------ */
/* The printable receipt shown after a successful walk-in sale.        */
/* Mounted only while a receipt is set, so it is always open.          */
/* ------------------------------------------------------------------ */

export function ReceiptModal({ receipt, onClose }: { receipt: Receipt | null; onClose: () => void }) {
  const { settings } = useStore();
  return (
    <Modal open={!!receipt} onClose={onClose} title="Transaction saved 🎉">
      {receipt ? (
        <div className="text-sm">
          {/* Ticket-style mono block */}
          <div className="rounded-xl border border-dashed border-primary/30 bg-cream p-4 font-mono text-xs">
            <p className="text-center font-bold">{settings.cafeName.toUpperCase()}</p>
            <p className="text-center text-[10px]">{settings.address}</p>
            <p className="mt-2">Ref: {receipt.reference}</p>
            <p className="border-b border-dashed border-primary/30 pb-2">{new Date().toLocaleString("en-PH")}</p>
            <div className="mt-2 flex flex-col gap-1 border-b border-dashed border-primary/30 pb-2">
              {receipt.items.map((i) => (
                <div key={i.productId} className="flex justify-between">
                  <span className="truncate pr-2">
                    {i.quantity}× {i.name}
                  </span>
                  <span>{formatCurrency(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Received</span>
              <span>{formatCurrency(receipt.amountReceived)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change</span>
              <span>{formatCurrency(receipt.change)}</span>
            </div>
            <p className="mt-2 border-t border-dashed border-primary/30 pt-2 text-center">Thank you — come again!</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              🖨 Print receipt
            </Button>
            <Button className="flex-1" onClick={onClose}>
              New Sale
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
