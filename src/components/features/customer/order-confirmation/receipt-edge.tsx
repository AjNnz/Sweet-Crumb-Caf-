"use client";

import { cn } from "@/lib/utils";

/** Zigzag silhouette for the torn receipt edges (stretched to the paper width). */
function zigzagPath(width = 640, tooth = 16, height = 14) {
  const teeth = Math.ceil(width / tooth);
  let d = `M0 ${height}`;
  for (let i = 0; i < teeth; i++) {
    d += ` L${i * tooth + tooth / 2} 0 L${(i + 1) * tooth} ${height}`;
  }
  return `${d} Z`;
}

/** The decorative torn-paper zigzag above/below the receipt. */
export function ReceiptEdge({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 640 14"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("block h-3 w-full text-white", flip && "rotate-180")}
    >
      <path d={zigzagPath()} fill="currentColor" />
    </svg>
  );
}
