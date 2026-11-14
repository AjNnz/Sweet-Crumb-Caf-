"use client";

import { cn } from "@/lib/utils";
import { Mode, TABS } from "./aggregation";

/* The six report pills. Where the tab bar renders; the chosen tab is
 * owned by the parent screen. */
export function ReportsTabs({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            mode === t.id ? "bg-primary text-white shadow-sm" : "bg-white text-espresso shadow-sm hover:bg-latte",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
