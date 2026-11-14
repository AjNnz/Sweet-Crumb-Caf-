"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import type { ProductCategory } from "@/lib/types";
import { useToast } from "@/components/common/toast";

import type { Receipt } from "./aggregation";
import { buildTicketItems, ticketTotal } from "./aggregation";
import { CashierHeader } from "./header";
import { ProductGrid } from "./product-grid";
import { TicketPanel } from "./ticket-panel";
import { PaymentModal } from "./payment-modal";
import { ReceiptModal } from "./receipt-modal";

/* ------------------------------------------------------------------ */
/* Cashier / POS — a thin COMPOSITION. The product grid, the ticket    */
/* panel and the two modals each live in their own file; this file     */
/* owns the search/category/ticket state and which modal is open.      */
/* ------------------------------------------------------------------ */
export default function CashierPage() {
  const { products, getStock } = useStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | ProductCategory>("All");
  const [ticket, setTicket] = useState<Record<string, number>>({});
  const [payOpen, setPayOpen] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // What the grid shows — filtered by category and search.
  const selectable = useMemo(
    () =>
      products.filter(
        (p) =>
          p.available &&
          !p.archived &&
          (category === "All" || p.category === category) &&
          (!search.trim() ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())),
      ),
    [products, category, search],
  );

  // The priced ticket rows, shared by the panel and the payment modal.
  const ticketItems = useMemo(() => buildTicketItems(ticket, products), [ticket, products]);
  const total = ticketTotal(ticketItems);

  // Add/remove one unit, capped by live stock.
  const addTicket = (productId: string, delta = 1) => {
    const stock = getStock(productId);
    setTicket((t) => {
      const next = (t[productId] ?? 0) + delta;
      if (next > stock) {
        toast(`Only ${stock} in stock for that item.`, "error");
        return t;
      }
      if (next <= 0) {
        const copy = { ...t };
        delete copy[productId];
        return copy;
      }
      return { ...t, [productId]: next };
    });
  };

  // After a successful save: show the receipt and start a fresh ticket.
  const handleSaved = (r: Receipt) => {
    setReceipt(r);
    setTicket({});
    setPayOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <CashierHeader search={search} onSearch={setSearch} />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Product grid (with category pills) */}
        <ProductGrid
          selectable={selectable}
          ticket={ticket}
          category={category}
          onCategory={setCategory}
          onAdd={addTicket}
        />

        {/* Current ticket */}
        <TicketPanel
          items={ticketItems}
          total={total}
          onAdd={addTicket}
          onClear={() => setTicket({})}
          onPay={() => setPayOpen(true)}
        />
      </div>

      {/* Modals (each owns its own form state) */}
      {payOpen ? <PaymentModal ticketItems={ticketItems} onClose={() => setPayOpen(false)} onSaved={handleSaved} /> : null}
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
