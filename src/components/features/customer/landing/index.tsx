"use client";

import { HeroSection } from "./hero";
import { CategoriesSection } from "./categories";
import { FeaturedSection, CtaSection } from "./featured";

/* ------------------------------------------------------------------ */
/* Landing page — a thin COMPOSITION. Every band of the page lives in  */
/* its own section file.                                               */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <HeroSection />

      {/* Category cards */}
      <CategoriesSection />

      {/* Featured products */}
      <FeaturedSection />

      {/* Bottom CTA */}
      <CtaSection />
    </main>
  );
}
