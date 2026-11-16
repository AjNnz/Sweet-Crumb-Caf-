"use client";

import { useStore } from "@/context/store";
import type { User } from "@/lib/types";
import { Button } from "@/components/common/ui/button";
import { cn, formatDate } from "@/lib/utils";

/* Page header — title + the Add entry point. */
export function StaffHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Staff Management</h1>
        <p className="text-xs text-mocha">Add staff accounts, edit details, and activate or deactivate access.</p>
      </div>
      <Button onClick={onAdd}>＋ Add Staff Account</Button>
    </div>
  );
}

/* One staff account card — initials avatar, role pill, actions. */
export function StaffCard({
  user,
  onEdit,
  onToggle,
}: {
  user: User;
  onEdit: (u: User) => void;
  onToggle: (u: User) => void;
}) {
  const { settings } = useStore();
  const isSelf = user.email === settings.email;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-card",
        user.status === "INACTIVE" ? "border-red-100 opacity-75" : "border-primary/10",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white",
          user.role === "ADMIN" ? "bg-primary" : "bg-secondary",
        )}
      >
        {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-semibold text-espresso">
          {user.name}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              user.role === "ADMIN" ? "bg-latte text-primary" : "bg-cream text-mocha",
            )}
          >
            {user.role}
          </span>
          {isSelf ? <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">You</span> : null}
        </p>
        <p className="truncate text-xs text-mocha">{user.email}</p>
        <p className="text-[10px] text-mocha">
          Joined {formatDate(user.createdAt)} ·{" "}
          <span className={user.status === "ACTIVE" ? "text-emerald-700" : "text-red-600"}>
            {user.status === "ACTIVE" ? "Active" : "Deactivated"}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
          Edit
        </Button>
        {/* You can't deactivate your own account */}
        {!isSelf ? (
          <button
            onClick={() => onToggle(user)}
            className={cn("text-xs font-semibold hover:underline", user.status === "ACTIVE" ? "text-red-600" : "text-emerald-700")}
          >
            {user.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
