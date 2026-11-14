"use client";

import { useStore } from "@/context/store";
import { cn } from "@/lib/utils";

/* Page header — greeting + the three board counters. */
export function BoardHeader({
  counts,
}: {
  counts: { queued: number; mine: number; deliveredToday: number };
}) {
  const { currentUser } = useStore();
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold text-espresso">Delivery Board</h1>
        <p className="mt-1 text-sm text-mocha">
          Hi {currentUser?.name.split(" ")[0]} — claim a delivery, pick it up and mark it delivered.
        </p>
      </div>
      <div className="flex gap-2 text-center">
        <Counter value={counts.queued} label="To claim" />
        <Counter value={counts.mine} label="Mine" />
        <Counter value={counts.deliveredToday} label="Delivered today" tone="text-emerald-600" />
      </div>
    </header>
  );
}

function Counter({ value, label, tone = "text-primary" }: { value: number; label: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-primary/10 bg-white px-4 py-2 shadow-card">
      <p className={cn("font-display text-xl font-bold", tone)}>{value}</p>
      <p className="text-[11px] text-mocha">{label}</p>
    </div>
  );
}
