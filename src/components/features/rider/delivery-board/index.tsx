"use client";

import { useMemo } from "react";

import { useStore } from "@/context/store";

import { buildDeliveryQueues } from "./aggregation";
import { BoardHeader } from "./header";
import { QueuedSection } from "./queued-section";
import { MyDeliveriesSection } from "./my-deliveries-section";
import { OthersSection } from "./others-section";

/* ------------------------------------------------------------------ */
/* Delivery Board — a thin COMPOSITION. The header counter pills and   */
/* the three lane sections live in their own files; this file only     */
/* decides which lanes render.                                         */
/* ------------------------------------------------------------------ */
export default function DeliveryBoardPage() {
  const { orders, currentUser } = useStore();

  const { queued, mine, withOthers, deliveredToday } = useMemo(
    () => buildDeliveryQueues(orders, currentUser?.id),
    [orders, currentUser?.id],
  );

  return (
    <>
      <BoardHeader counts={{ queued: queued.length, mine: mine.length, deliveredToday: deliveredToday.length }} />

      {/* Unclaimed */}
      <QueuedSection orders={queued} />

      {/* Claimed by me */}
      <MyDeliveriesSection orders={mine} />

      {/* Claimed by other riders (read-only) */}
      {withOthers.length > 0 ? <OthersSection orders={withOthers} /> : null}
    </>
  );
}
