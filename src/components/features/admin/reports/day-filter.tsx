"use client";

import { Input } from "@/components/common/ui/input";

/* ------------------------------------------------------------------ */
/* Shared day picker for the Product performance and Channel comparison */
/* tabs. `day` is a YYYY-MM-DD string from the native date input (the    */
/* same key buildReports() uses), or "" meaning "all dates".             */
/* ------------------------------------------------------------------ */
export function DayFilter({
  day,
  onChange,
}: {
  day: string;
  onChange: (value: string) => void;
}) {
  // Local calendar date (not UTC) so "today" is correct in the morning.
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const label = day
    ? new Date(`${day}T00:00:00`).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "all dates";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 bg-cream px-4 py-2.5">
      <p className="text-xs text-mocha">
        Showing <span className="font-semibold text-espresso">{label}</span> · completed &amp; paid orders · up to today
      </p>
      <div className="flex items-center gap-2">
        <label htmlFor="report-day" className="text-xs font-semibold text-mocha">
          Filter by day
        </label>
        <Input
          id="report-day"
          type="date"
          value={day}
          max={todayKey}
          onChange={(e) => {
            const value = e.target.value;
            // max disables future dates in the picker; this also guards
            // against a manually typed date beyond today.
            if (!value || value <= todayKey) onChange(value);
          }}
          className="h-9 w-40 text-xs"
          aria-label="Filter report rows by a specific day (today or earlier)"
        />
        {day ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs font-semibold text-secondary hover:underline"
          >
            All dates
          </button>
        ) : null}
      </div>
    </div>
  );
}
