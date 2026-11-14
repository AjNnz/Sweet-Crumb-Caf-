"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/context/store";
import type { Product } from "@/lib/types";
import { useToast } from "@/components/common/toast";

import { ProductsHeader, ProductFilters } from "./header";
import { ProductTable } from "./product-table";
import { ProductFormModal } from "./product-form-modal";
import { ArchiveConfirm, DeleteConfirm } from "./confirm-modals";

/* ------------------------------------------------------------------ */
/* Products — a thin COMPOSITION. The header/filters, the table and    */
/* the three modals each live in their own file; this file owns the    */
/* filter state and which modal (if any) is open. `editing` is {} for  */
/* a new product, the Product itself when editing, null when closed.   */
/* ------------------------------------------------------------------ */
export default function AdminProductsScreen() {
  const { products, saveProduct } = useStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<(Partial<Product> & { id?: string }) | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [archiving, setArchiving] = useState<Product | null>(null);

  // Archived products only appear when the toggle is on.
  const filtered = useMemo(() => {
    let list = products.filter((p) => (p.archived ?? false) === showArchived);
    if (categoryFilter !== "ALL") list = list.filter((p) => p.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, categoryFilter, showArchived]);

  return (
    <div className="flex flex-col gap-4">
      <ProductsHeader onAdd={() => setEditing({})} />

      {/* Filters — one row on desktop; search stacks above the filters on mobile */}
      <ProductFilters
        search={search}
        onSearch={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilter={setCategoryFilter}
        showArchived={showArchived}
        onShowArchived={() => setShowArchived(!showArchived)}
      />

      {/* Table */}
      <ProductTable
        rows={filtered}
        showArchived={showArchived}
        onEdit={setEditing}
        onArchive={setArchiving}
        onRestore={(p) => {
          saveProduct({ id: p.id, archived: false, available: true });
          toast("Product restored.");
        }}
        onDelete={setDeleting}
      />

      {/* Modals (each owns its own form state) */}
      {editing !== null ? <ProductFormModal product={editing} onClose={() => setEditing(null)} /> : null}
      <ArchiveConfirm product={archiving} onClose={() => setArchiving(null)} />
      <DeleteConfirm product={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
