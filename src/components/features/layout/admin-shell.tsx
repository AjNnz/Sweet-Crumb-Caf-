"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import { cn } from "@/lib/utils";
import {
  BoxIcon,
  DashboardIcon,
  InventoryIcon,
  LogoutIcon,
  MenuIcon,
  ReceiptIcon,
  ReportIcon,
  SettingsIcon,
  StaffIcon,
} from "@/components/common/icons";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/products", label: "Products", icon: BoxIcon },
  { href: "/admin/inventory", label: "Inventory", icon: InventoryIcon },
  { href: "/admin/transactions", label: "Transactions", icon: ReceiptIcon },
  { href: "/admin/reports", label: "Reports", icon: ReportIcon },
  { href: "/admin/staff", label: "Staff Management", icon: StaffIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, settings, lowStockItems } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoutAndGo = () => {
    logout();
    router.push("/login");
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-accent text-espresso shadow-sm" : "text-latte hover:bg-white/10",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
            {href === "/admin/inventory" && lowStockItems.length ? (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {lowStockItems.length}
              </span>
            ) : null}
          </Link>
        );
      })}
      <div className="mt-auto border-t border-white/10 pt-3">
        <button
          onClick={logoutAndGo}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-latte hover:bg-white/10"
        >
          <LogoutIcon className="h-4.5 w-4.5" /> Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-svh bg-cream">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-primary md:flex">
        <div className="flex items-center gap-2.5 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-xl">☕</span>
          <div>
            <p className="font-display text-base font-bold leading-tight text-white">{settings.cafeName}</p>
            <p className="text-[11px] text-latte/70">Admin Console</p>
          </div>
        </div>
        {nav}
        <div className="border-t border-white/10 p-4 text-xs text-latte/80">
          Signed in as<br />
          <span className="font-semibold text-white">{currentUser?.name}</span>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-primary px-4 md:hidden">
        <div className="flex items-center gap-2 text-white">
          <span className="text-lg">☕</span>
          <span className="font-display font-bold">{settings.cafeName}</span>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="flex h-full w-64 flex-col bg-primary pt-14" onClick={(e) => e.stopPropagation()}>
            {nav}
          </aside>
          <div className="flex-1 bg-espresso/50" />
        </div>
      ) : null}

      <main className="min-w-0 flex-1 pb-10 pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
