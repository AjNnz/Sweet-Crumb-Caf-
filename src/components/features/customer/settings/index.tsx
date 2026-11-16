"use client";

import { useStore } from "@/context/store";

import { SignInSection, SettingsForm } from "./settings-form";

/* ------------------------------------------------------------------ */
/* Settings — a thin COMPOSITION. The guard state and the form live    */
/* in their own file; this file only routes between them and keys the  */
/* form by user id.                                                    */
/* ------------------------------------------------------------------ */
export default function SettingsPage() {
  const { currentUser, isHydrated } = useStore();

  // Wait for the persisted session to hydrate before judging auth state
  if (!isHydrated) return null;

  // Signed-in customers only (same client-side guard as my-orders)
  if (!currentUser || currentUser.role !== "CUSTOMER") {
    return <SignInSection />;
  }

  return <SettingsForm key={currentUser.id} user={currentUser} />;
}
