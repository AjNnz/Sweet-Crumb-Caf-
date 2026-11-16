"use client";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* The demo-account quick-fill panel under the login card. One tap     */
/* pre-fills the form with a seeded account.                           */
/* ------------------------------------------------------------------ */

const DEMO_ACCOUNTS: Array<[string, string, string]> = [
  ["Admin", "admin@cafe.com", "admin123"],
  ["Staff", "staff@cafe.com", "staff123"],
  ["Rider", "rider@cafe.com", "rider123"],
  ["Customer", "jasmine@gmail.com", "customer123"],
];

export function DemoAccounts({ onFill }: { onFill: (email: string, password: string) => void }) {
  return (
    <div className="mt-4 rounded-2xl bg-white/10 p-4 text-xs text-white/90 backdrop-blur">
      <p className="font-semibold text-accent">Demo accounts</p>
      <div className="mt-2 grid gap-1.5">
        {DEMO_ACCOUNTS.map(([role, mail, pass]) => (
          <button
            key={role}
            type="button"
            onClick={() => onFill(mail, pass)}
            className={cn("flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-left hover:bg-white/20")}
          >
            <span>
              <span className="font-semibold">{role}</span> — {mail}
            </span>
            <span className="text-white/70">use →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
