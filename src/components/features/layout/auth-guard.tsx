"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import type { Role } from "@/lib/types";

/**
 * Client-side role guard. Protects the UI while the app has no backend;
 * when the backend exists, server-side sessions/API authorization take over.
 */
export function AuthGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { currentUser, isHydrated } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;
    if (!currentUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allow.includes(currentUser.role)) {
      const home =
        currentUser.role === "ADMIN"
          ? "/admin/dashboard"
          : currentUser.role === "STAFF"
            ? "/staff/cashier"
            : currentUser.role === "RIDER"
              ? "/rider"
              : "/menu";
      router.replace(home);
    }
  }, [isHydrated, currentUser, allow, pathname, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3 text-mocha">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-primary" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !allow.includes(currentUser.role)) {
    return null; // redirecting
  }

  return <>{children}</>;
}

export function roleHome(role: Role) {
  return role === "ADMIN"
    ? "/admin/dashboard"
    : role === "STAFF"
      ? "/staff/cashier"
      : role === "RIDER"
        ? "/rider"
        : "/menu";
}
