"use client";

import { cn } from "@/lib/utils";

/** The dashboard window sizes. */
export const RANGES = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
  { days: 60, label: "All" },
];

/* Page title + the 7/14/30/All range pills. */
export function DashboardHeader({ range, onChange }: { range: number; onChange: (days: number) => void }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Dashboard</h1>
        <p className="text-xs text-mocha">Business overview across all channels and interfaces.</p>
      </div>
      <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => onChange(r.days)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              range === r.days ? "bg-primary text-white" : "text-mocha hover:bg-latte",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
