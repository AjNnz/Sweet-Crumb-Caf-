"use client";

import { useState } from "react";

import { useStore } from "@/context/store";
import type { User } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/common/ui/button";
import { Field, Input, Select } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";

const BLANK_FORM = { name: "", email: "", role: "STAFF" as User["role"], password: "" };

/* ------------------------------------------------------------------ */
/* Add/Edit staff modal. Owns the form + error state, seeded on mount; */
/* mounted only while editing (`user === undefined` means "new").       */
/* ------------------------------------------------------------------ */
export function StaffFormModal({
  user,
  onClose,
}: {
  /** The user being edited, or undefined/partial when creating a new one. */
  user?: Partial<User> & { id?: string };
  onClose: () => void;
}) {
  const { saveStaffMember } = useStore();
  const { toast } = useToast();

  // Seeds from the user row (or BLANK for a new account) on mount.
  const [form, setForm] = useState(() =>
    user?.id
      ? { name: user.name ?? "", email: user.email ?? "", role: user.role ?? "STAFF", password: "" }
      : BLANK_FORM,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email.";
    // Only a brand-new account requires an initial password
    if (!user?.id && form.password.length < 6) errs.password = "Initial password must be at least 6 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const result = await saveStaffMember({
      id: user?.id,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      password: form.password || undefined,
    });
    if (!result.ok) {
      // The backend reports duplicate emails — surface on the field
      if (result.error) setErrors({ email: result.error });
      return;
    }
    toast(user?.id ? "Staff account updated." : "Staff account created.");
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} title={user?.id ? "Edit staff account" : "Add staff account"}>
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
        <Field label={user?.id ? "New password (leave blank to keep current)" : "Initial password"} error={errors.password}>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••" />
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>{user?.id ? "Save changes" : "Create account"}</Button>
      </div>
    </Modal>
  );
}

/* Deactivate / reactivate confirm. */
export function ToggleConfirm({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { toggleStaffStatus } = useStore();
  const { toast } = useToast();
  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={user?.status === "ACTIVE" ? "Deactivate account?" : "Reactivate account?"}
      description={
        user?.status === "ACTIVE"
          ? `${user.name} will no longer be able to log in. Their transaction history is kept.`
          : `${user?.name ?? ""} will be able to log in again with their existing password.`
      }
      confirmLabel={user?.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
      confirmVariant={user?.status === "ACTIVE" ? "danger" : "success"}
      onConfirm={() => {
        if (user) {
          toggleStaffStatus(user.id);
          toast("Account updated.");
        }
        onClose();
      }}
    />
  );
}
