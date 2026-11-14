"use client";

import { AuthGuard } from "@/components/features/layout/auth-guard";
import { AdminShell } from "@/components/features/layout/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allow={["ADMIN"]}>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
