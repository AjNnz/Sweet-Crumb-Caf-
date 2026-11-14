"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useStore } from "@/context/store";
import { cn } from "@/lib/utils";
import { CartIcon, HomeIcon, LogoutIcon, MenuIcon, UserIcon } from "@/components/common/icons";

export function SiteNav() {
  const { cartCount, currentUser, logout, settings } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/menu", label: "Menu", icon: MenuIcon },
    { href: "/my-orders", label: "My Orders", icon: Receipt },
    { href: "/cart", label: "Cart", icon: CartIcon, badge: cartCount },
  ];

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg text-white shadow-sm">
            ☕
          </span>
          <span className="hidden font-display text-lg font-bold text-primary sm:block">
            {settings.cafeName}
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                active(href) ? "bg-primary text-white" : "text-espresso hover:bg-latte",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge ? (
                <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-espresso">
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Account */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-espresso shadow-sm hover:bg-latte">
                <UserIcon className="h-4 w-4" />
                <span className="hidden max-w-24 truncate sm:block">{currentUser.name.split(" ")[0]}</span>
              </button>
              <div className="invisible absolute right-0 top-full z-10 w-44 translate-y-1 rounded-xl border border-primary/10 bg-white p-1.5 opacity-0 shadow-lift transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <p className="px-2.5 py-1 text-[11px] text-mocha">{currentUser.email}</p>
                {currentUser.role === "CUSTOMER" ? (
                  <Link
                    href="/settings"
                    className="block rounded-lg px-2.5 py-2 text-sm text-espresso hover:bg-latte"
                  >
                    Settings
                  </Link>
                ) : (
                  <Link
                    href={currentUser.role === "STAFF" ? "/staff/cashier" : "/admin/dashboard"}
                    className="block rounded-lg px-2.5 py-2 text-sm text-espresso hover:bg-latte"
                  >
                    My Workspace
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogoutIcon className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
            >
              <UserIcon className="h-4 w-4" /> Login
            </Link>
          )}

          {/* Mobile cart + menu button */}
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-espresso hover:bg-accent md:hidden"
            aria-label="Cart"
          >
            <CartIcon className="h-5 w-5" />
            {cartCount ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl text-espresso hover:bg-latte md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open ? (
        <nav className="border-t border-primary/10 bg-cream px-4 py-2 md:hidden" onClick={() => setOpen(false)}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium",
                active(href) ? "bg-primary text-white" : "text-espresso hover:bg-latte",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function Receipt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0", className)}>
      <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5Z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}

export function SiteFooter() {
  const { settings } = useStore();
  return (
    <footer className="mt-16 border-t border-primary/10 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-bold text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">☕</span>
            {settings.cafeName}
          </p>
          <p className="mt-3 text-sm text-mocha">
            Fresh cupcakes, cakes, pastries and coffee, baked in small batches every day.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-espresso">Visit us</p>
          <p className="mt-2 text-sm text-mocha">{settings.address}</p>
          <p className="text-sm text-mocha">{settings.phone}</p>
          <p className="text-sm text-mocha">{settings.email}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-espresso">Opening hours</p>
          <p className="mt-2 text-sm text-mocha">{settings.openingHours}</p>
          <div className="mt-4 flex gap-2">
            <Link href="/menu" className="text-sm font-medium text-secondary hover:underline">
              Browse menu →
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-primary/5 py-4 text-center text-xs text-mocha">
        © {new Date().getFullYear()} {settings.cafeName}
      </div>
    </footer>
  );
}
