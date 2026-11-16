"use client";

import { useState } from "react";

import { useStore } from "@/context/store";
import type { User } from "@/lib/types";

import { StaffHeader, StaffCard } from "./staff-card";
import { StaffFormModal, ToggleConfirm } from "./staff-modals";

/* ------------------------------------------------------------------ */
/* Staff Management — a thin COMPOSITION. The header/cards and the     */
/* two modals live in their own files; this file owns the filter and   */
/* which modal is open. `editing` is {} for new, the user for edit.    */
/* ------------------------------------------------------------------ */
export default function AdminStaffPage() {
  const { users } = useStore();

  // Non-customer accounts only — customers manage themselves.
  const staff = users.filter((u) => u.role !== "CUSTOMER");

  const [editing, setEditing] = useState<(Partial<User> & { id?: string }) | null>(null);
  const [toggling, setToggling] = useState<User | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <StaffHeader onAdd={() => setEditing({})} />

      {/* Account cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {staff.map((u) => (
          <StaffCard key={u.id} user={u} onEdit={setEditing} onToggle={setToggling} />
        ))}
      </div>

      {/* Modals (each owns its own form state) */}
      {editing !== null ? <StaffFormModal user={editing} onClose={() => setEditing(null)} /> : null}
      <ToggleConfirm user={toggling} onClose={() => setToggling(null)} />
    </div>
  );
}
