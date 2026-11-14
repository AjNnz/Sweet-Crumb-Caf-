"use client";

import { useState } from "react";

import { useToast } from "@/components/common/toast";

/* ------------------------------------------------------------------ */
/* Shared rider-action plumbing. Each lane section gets its own        */
/* instance; `busy` disables the button for the order being acted on.  */
/* ------------------------------------------------------------------ */

export function useDeliveryRun() {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  // All rider actions hit the server; each returns the updated order
  // (or the reason it refused — e.g. someone else claimed it first).
  const run = async (
    orderId: string,
    action: () => Promise<{ ok: boolean; error?: string }>,
    success: string,
  ) => {
    setBusy(orderId);
    const result = await action();
    setBusy(null);
    if (result.ok) toast(success);
    else toast(result.error ?? "Something went wrong.", "error");
  };

  return { busy, run };
}
