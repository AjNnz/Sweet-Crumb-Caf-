"use client";

import { useState } from "react";

import { useStore } from "@/context/store";
import type { User } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { Field, Input, Select } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";
import { cn, formatDate } from "@/lib/utils";
import { useToast } from "@/components/common/toast";

const BLANK_FORM = { name: "", email: "", role: "STAFF" as User["role"], password: "" };

export default function AdminStaffPage() {
  const { users, saveStaffMember, toggleStaffStatus, settings } = useStore();
  const { toast } = useToast();

  const [editing, setEditing] = useState<{ id?: string } | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toggling, setToggling] = useState<User | null>(null);

  const staff = users.filter((u) => u.role !== "CUSTOMER");

  const openNew = () => {
    setEditing({});
    setForm(BLANK_FORM);
    setErrors({});
  };

  const openEdit = (u: User) => {
    setEditing({ id: u.id });
    setForm({ name: u.name, email: u.email, role: u.role, password: "" });
    setErrors({});
  };

  const save = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email.";
    if (!editing?.id && form.password.length < 6) errs.password = "Initial password must be at least 6 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const result = await saveStaffMember({
      id: editing?.id,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      password: form.password || undefined,
    });
    if (!result.ok) {
      if (result.error) setErrors({ email: result.error });
      return;
    }
    toast(editing?.id ? "Staff account updated." : "Staff account created.");
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">Staff Management</h1>
          <p className="text-xs text-mocha">Add staff accounts, edit details, and activate or deactivate access.</p>
        </div>
        <Button onClick={openNew}>＋ Add Staff Account</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {staff.map((u) => {
          const isSelf = u.email === settings.email;
          return (
            <div
              key={u.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-card",
                u.status === "INACTIVE" ? "border-red-100 opacity-75" : "border-primary/10",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white",
                  u.role === "ADMIN" ? "bg-primary" : "bg-secondary",
                )}
              >
                {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-espresso">
                  {u.name}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      u.role === "ADMIN" ? "bg-latte text-primary" : "bg-cream text-mocha",
                    )}
                  >
                    {u.role}
                  </span>
                  {isSelf ? (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">You</span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-mocha">{u.email}</p>
                <p className="text-[10px] text-mocha">
                  Joined {formatDate(u.createdAt)} ·{" "}
                  <span className={u.status === "ACTIVE" ? "text-emerald-700" : "text-red-600"}>
                    {u.status === "ACTIVE" ? "Active" : "Deactivated"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                  Edit
                </Button>
                {!isSelf ? (
                  <button
                    onClick={() => setToggling(u)}
                    className={cn(
                      "text-xs font-semibold hover:underline",
                      u.status === "ACTIVE" ? "text-red-600" : "text-emerald-700",
                    )}
                  >
                    {u.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit staff account" : "Add staff account"}>
        <div className="grid gap-4 text-sm">
          <Field label="Full name" error={errors.name}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Maria Santos" />
          </Field>
          <Field label="Email (used to log in)" error={errors.email}>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staff@cafe.com" />
          </Field>
          <Field label="Assigned role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as User["role"] })}>
              <option value="STAFF">STAFF — POS, orders & transactions</option>
              <option value="ADMIN">ADMIN — full business access</option>
            </Select>
          </Field>
          <Field label={editing?.id ? "New password (leave blank to keep current)" : "Initial password"} error={errors.password}>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••"
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button onClick={save}>{editing?.id ? "Save changes" : "Create account"}</Button>
        </div>
      </Modal>

      {/* Toggle confirm */}
      <Modal
        open={!!toggling}
        onClose={() => setToggling(null)}
        title={toggling?.status === "ACTIVE" ? "Deactivate account?" : "Reactivate account?"}
        description={
          toggling?.status === "ACTIVE"
            ? `${toggling.name} will no longer be able to log in. Their transaction history is kept.`
            : `${toggling?.name ?? ""} will be able to log in again with their existing password.`
        }
        confirmLabel={toggling?.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
        confirmVariant={toggling?.status === "ACTIVE" ? "danger" : "success"}
        onConfirm={() => {
          if (toggling) {
            toggleStaffStatus(toggling.id);
            toast("Account updated.");
          }
          setToggling(null);
        }}
      />
    </div>
  );
}
