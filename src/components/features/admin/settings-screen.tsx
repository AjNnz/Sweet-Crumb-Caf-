"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import { Button } from "@/components/common/ui/button";
import { Field, Input } from "@/components/common/ui/input";
import { Modal } from "@/components/common/ui/modal";
import { useToast } from "@/components/common/toast";

export default function AdminSettingsPage() {
  const { settings, updateSettings, currentUser, logout, resetDemoData } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({ ...settings });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  const save = () => {
    updateSettings(form);
    toast("Cafe information saved.");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Settings</h1>
        <p className="text-xs text-mocha">Cafe information, account profile and system options.</p>
      </div>

      {/* Cafe information */}
      <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <h2 className="font-display text-lg font-bold text-espresso">Cafe information</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <Field label="Cafe name" className="sm:col-span-2">
            <Input value={form.cafeName} onChange={(e) => setForm({ ...form, cafeName: e.target.value })} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Opening hours" className="sm:col-span-2">
            <Input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} disabled={!dirty}>
            {dirty ? "Save changes" : "Saved"}
          </Button>
        </div>
      </section>

      {/* Profile */}
      <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <h2 className="font-display text-lg font-bold text-espresso">Profile</h2>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            {currentUser?.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="font-semibold text-espresso">{currentUser?.name}</p>
            <p className="text-xs text-mocha">
              {currentUser?.email} · role {currentUser?.role}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-mocha">
          Profile editing and password changes will be handled by the backend account system in a later phase.
        </p>
      </section>

      {/* System */}
      <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <h2 className="font-display text-lg font-bold text-espresso">System</h2>
        <div className="mt-3 flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-cream p-3">
            <div>
              <p className="font-medium text-espresso">Reset demo data</p>
              <p className="text-xs text-mocha">Restores the original products, inventory and 60 days of seed transactions.</p>
            </div>
            <Button variant="outline" onClick={() => setConfirmReset(true)}>
              Reset
            </Button>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3">
            <div>
              <p className="font-medium text-espresso">Log out</p>
              <p className="text-xs text-mocha">End your admin session.</p>
            </div>
            <Button variant="danger" onClick={() => setConfirmLogout(true)}>
              Logout
            </Button>
          </div>
        </div>
      </section>

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
