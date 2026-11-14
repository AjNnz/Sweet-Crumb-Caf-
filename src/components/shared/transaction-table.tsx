"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import type { Order, OrderStatus } from "@/lib/types";
import {
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  cn,
  displayCustomerName,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Input, Select } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";
import { SearchIcon } from "@/components/common/icons";

interface Props {
  orders: Order[];
  /** Show customer details column (admin view) */
  showCustomer?: boolean;
  /** Optional extra filter/status controls */
  allowStatusFilter?: boolean;
}

export function TransactionTable({ orders, showCustomer = false, allowStatusFilter = true }: Props) {
  const { updateOrderPayment } = useStore();
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    let list = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (channel !== "ALL") list = list.filter((o) => o.channel === channel);
    if (status !== "ALL") list = list.filter((o) => o.orderStatus === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          displayCustomerName(o.customerName, o.channel).toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [orders, search, channel, status]);

  return (
    <div className="flex flex-col gap-3">
      {/* Controls — the two filter dropdowns stay side-by-side in one row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <span className="absolute left-3 top-0 flex h-10 items-center text-mocha">
            <SearchIcon />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="pl-9"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <Select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-36">
            <option value="ALL">All channels</option>
            <option value="WALK-IN">Walk-in</option>
            <option value="ONLINE">Online</option>
          </Select>
          {allowStatusFilter ? (
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
              <option value="ALL">All statuses</option>
              {(Object.keys(ORDER_STATUS_STYLES) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_STYLES[s].label}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
      </div>

      {/* Table (desktop) / cards (mobile) */}
      <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-cream text-left text-xs uppercase tracking-wide text-mocha">
                <th className="px-4 py-3">Reference</th>
                {showCustomer ? <th className="px-4 py-3">Customer</th> : null}
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((o) => (
                <tr key={o.id} className="border-b border-primary/5 transition-colors hover:bg-cream/60">
                  <td className="px-4 py-3 font-semibold text-espresso">{o.reference}</td>
                  {showCustomer ? (
                    <td className="px-4 py-3 text-mocha">
                      {displayCustomerName(o.customerName, o.channel)}
                      {o.customerContact ? <span className="block text-[10px]">{o.customerContact}</span> : null}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 whitespace-nowrap text-mocha">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge className={o.channel === "WALK-IN" ? "bg-latte text-mocha" : "bg-sky-100 text-sky-800"}>
                      {o.channel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-mocha">{o.items.reduce((s, i) => s + i.quantity, 0)} pcs</td>
                  <td className="px-4 py-3">
                    <Badge className={PAYMENT_STATUS_STYLES[o.paymentStatus].className}>
                      {PAYMENT_STATUS_STYLES[o.paymentStatus].label} · {o.paymentMethod}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ORDER_STATUS_STYLES[o.orderStatus].className}>
                      {ORDER_STATUS_STYLES[o.orderStatus].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button className="text-xs font-semibold text-secondary hover:underline" onClick={() => setSelected(o)}>
                      View
                    </button>
                    {o.paymentStatus !== "PAID" && o.orderStatus !== "CANCELLED" ? (
                      <button
                        className="ml-3 text-xs font-semibold text-emerald-700 hover:underline"
                        onClick={() => updateOrderPayment(o.id, "PAID")}
                      >
                        Mark paid
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length ? (
          <p className="py-10 text-center text-sm text-mocha">No transactions found.</p>
        ) : (
          <p className="border-t border-primary/10 bg-cream px-4 py-2 text-center text-[11px] text-mocha">
            Showing {Math.min(filtered.length, 50)} of {filtered.length} transactions
          </p>
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.reference}
        description={selected ? formatDateTime(selected.createdAt) : ""}
        wide
      >
        {selected ? (
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge className={cn("gap-1", ORDER_STATUS_STYLES[selected.orderStatus].className)}>
                <span className={`h-2 w-2 rounded-full ${ORDER_STATUS_STYLES[selected.orderStatus].dot}`} />
                {ORDER_STATUS_STYLES[selected.orderStatus].label}
              </Badge>
              <Badge className={PAYMENT_STATUS_STYLES[selected.paymentStatus].className}>
                {PAYMENT_STATUS_STYLES[selected.paymentStatus].label}
              </Badge>
              <Badge className="bg-latte text-mocha">{selected.channel}</Badge>
            </div>
            <p className="text-mocha">
              <span className="font-semibold text-espresso">{displayCustomerName(selected.customerName, selected.channel)}</span>
              {selected.customerContact ? (
                <>
                  {" · "}
                  {selected.customerContact}
                </>
              ) : null}
              {selected.fulfillment ? (
                <span className="block text-xs">
                  {selected.fulfillment.mode === "DELIVERY"
                    ? `Delivery · ${selected.fulfillment.address ?? ""}`
                    : "Store pickup"}
                  {selected.fulfillment.notes ? ` · 📝 ${selected.fulfillment.notes}` : ""}
                </span>
              ) : null}
            </p>
            <div className="rounded-xl bg-cream p-3">
              {selected.items.map((i) => (
                <div key={i.productId} className="flex justify-between py-1">
                  <span>
                    <span className="font-semibold">{i.quantity}×</span> {i.name}
                  </span>
                  <span>{formatCurrency(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-primary/10 pt-2 text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(selected.total)}</span>
              </div>
              {selected.amountReceived !== undefined ? (
                <div className="mt-1 flex justify-between text-xs text-mocha">
                  <span>Received / Change</span>
                  <span>
                    {formatCurrency(selected.amountReceived)} / {formatCurrency(selected.change ?? 0)}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              {selected.paymentStatus !== "PAID" && selected.orderStatus !== "CANCELLED" ? (
                <Button
                  variant="success"
                  onClick={() => {
                    updateOrderPayment(selected.id, "PAID");
                    setSelected(null);
                  }}
                >
                  Record payment
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
