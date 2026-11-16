"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import type { CafeSettings } from "@/lib/types";
import { useToast } from "@/components/common/toast";
import { Modal } from "@/components/common/ui/modal";

import { CafeInfoSection, ProfileSection, SystemSection } from "./sections";

/* ------------------------------------------------------------------ */
/* Settings — a thin COMPOSITION. The three section cards live in      */
/* their own file; this file owns the form state and the two confirm   */
/* dialogs.                                                            */
/* ------------------------------------------------------------------ */
export default function AdminSettingsPage() {
  const { settings, updateSettings, currentUser, logout, resetDemoData } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState<CafeSettings>({ ...settings });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Settings</h1>
        <p className="text-xs text-mocha">Cafe information, account profile and system options.</p>
      </div>

      {/* Cafe information */}
      <CafeInfoSection
        form={form}
        dirty={dirty}
        onChange={(patch) => setForm({ ...form, ...patch })}
        onSave={() => {
          updateSettings(form);
          toast("Cafe information saved.");
        }}
      />

      {/* Profile */}
      <ProfileSection user={currentUser ?? {}} />

      {/* System */}
      <SystemSection onReset={() => setConfirmReset(true)} onLogout={() => setConfirmLogout(true)} />

      {/* Confirmations */}
      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all demo data?"
        description="Your changes (new products, orders, staff accounts) will be replaced with the original seed data."
        confirmLabel="Reset everything"
        confirmVariant="danger"
        onConfirm={() => {
          resetDemoData();
          setConfirmReset(false);
          toast("Demo data restored.", "info");
        }}
      />
      <Modal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Log out?"
        confirmLabel="Logout"
        confirmVariant="danger"
        onConfirm={() => {
          logout();
          router.push("/login");
        }}
      />
    </div>
  );
}
