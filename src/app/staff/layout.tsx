"use client";

import { AuthGuard } from "@/components/features/layout/auth-guard";
import { StaffShell } from "@/components/features/layout/staff-shell";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allow={["STAFF", "ADMIN"]}>
      <StaffShell>{children}</StaffShell>
    </AuthGuard>
  );
}
