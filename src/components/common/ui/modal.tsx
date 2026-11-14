"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  /** For simple confirm dialogs */
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger" | "success" | "secondary";
  onConfirm?: () => void;
  wide?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  confirmVariant = "primary",
  onConfirm,
  wide,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className={cn(
          "max-h-[90svh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-lift",
          wide ? "max-w-2xl" : "max-w-md",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? <h3 className="text-lg font-bold text-espresso">{title}</h3> : null}
        {description ? <p className="mt-1 text-sm text-mocha">{description}</p> : null}
        <div className={cn(title || description ? "mt-4" : "")}>{children}</div>
        {confirmLabel ? (
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
