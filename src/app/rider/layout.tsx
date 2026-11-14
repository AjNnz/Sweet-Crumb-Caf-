"use client";

import { AuthGuard } from "@/components/features/layout/auth-guard";
import { RiderShell } from "@/components/features/layout/rider-shell";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allow={["RIDER"]}>
      <RiderShell>{children}</RiderShell>
    </AuthGuard>
  );
}
