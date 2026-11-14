/* ------------------------------------------------------------------ */
/* Shared types for the checkout feature (kept here so the section     */
/* files don't each re-declare the form shape).                        */
/* ------------------------------------------------------------------ */

export type FulfillmentForm = {
  name: string;
  email: string;
  contact: string;
  mode: "PICKUP" | "DELIVERY";
  address: string;
  notes: string;
};

export type FieldErrors = Record<string, string>;
