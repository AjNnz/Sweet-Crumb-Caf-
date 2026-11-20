"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared day picker for Product performance and Channel comparison.   */
/* A small custom calendar is used instead of <input type="date">      */
/* because browser date pickers differ: future days are explicitly     */
/* rendered gray AND disabled here, so they can never be clicked or    */
/* typed. `day` is a YYYY-MM-DD local-date key; "" means all dates.    */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function DayFilter({ day, onChange }: { day: string; onChange: (value: string) => void }) {
  const today = new Date();
  const todayKey = dateKey(today);
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const base = day ? fromKey(day) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingBlanks = firstDay.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const canGoNext = month.getTime() < currentMonth.getTime();
  const label = day
    ? fromKey(day).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
    : "all dates";

  const pick = (d: number) => {
    const key = dateKey(new Date(month.getFullYear(), month.getMonth(), d));
    if (key > todayKey) return; // extra safety — the button is also disabled
    onChange(key);
    setOpen(false);
  };

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 bg-cream px-4 py-2.5">
      <p className="text-xs text-mocha">
        Showing <span className="font-semibold text-espresso">{label}</span> · completed &amp; paid orders · up to today
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-mocha">Filter by day</span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-9 w-44 items-center justify-between rounded-xl border border-primary/20 bg-white px-3 text-xs text-espresso hover:border-secondary focus:outline-none focus:ring-2 focus:ring-accent/40"
          aria-expanded={open}
        >
          <span>{day ? label : "All dates"}</span>
          <span aria-hidden>▾</span>
        </button>
        {day ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="text-xs font-semibold text-secondary hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      {open ? (
        <>
          {/* Click-away layer: one click closes the calendar. */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-4 top-full z-50 mt-2 w-64 rounded-2xl border border-primary/10 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="rounded-lg px-2 py-1 text-sm text-espresso hover:bg-latte"
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="text-xs font-bold text-espresso">
                {month.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className={cn(
                  "rounded-lg px-2 py-1 text-sm",
                  canGoNext ? "text-espresso hover:bg-latte" : "cursor-not-allowed text-gray-300",
                )}
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} className="text-[10px] font-semibold uppercase text-mocha">
                  {w}
                </span>
              ))}
              {cells.map((d, i) => {
                if (d === null) return <span key={`blank-${i}`} />;
                const key = dateKey(new Date(month.getFullYear(), month.getMonth(), d));
                const future = key > todayKey;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={future}
                    onClick={() => pick(d)}
                    className={cn(
                      "h-8 rounded-lg text-xs transition-colors",
                      future
                        ? "cursor-not-allowed bg-gray-100 text-gray-300"
                        : key === day
                          ? "bg-primary font-bold text-white"
                          : "text-espresso hover:bg-latte",
                    )}
                    aria-label={`${key}${future ? " (future date, unavailable)" : ""}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-mocha">Future dates are unavailable.</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
