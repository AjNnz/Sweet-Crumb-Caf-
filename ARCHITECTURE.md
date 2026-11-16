# Architecture — Backend vs. Frontend

Sweet Crumb Café is a **full-stack Next.js application**: one program that contains
BOTH the backend and the frontend, built and served together. This document maps
which folders are which, so you always know where a piece of logic lives.

> **Why isn't there a separate `backend/` folder at the top level?**
> Next.js requires API route files (`route.ts`) to live inside `src/app/api/…`,
> and both halves share one TypeScript domain model. Splitting them into two
> separate programs (e.g. Express + Next) would mean two servers, two
> `package.json` files, CORS handling, and duplicated types — a rewrite for no
> functional gain. Instead, the backend is *logically* grouped, as shown below.

---

## 🖥️ BACKEND — "the server half"

Everything that runs only on the server: database access, business rules,
password hashing, session signing. The browser never sees this code.

| Location | Role |
|---|---|
| `src/app/api/**/route.ts` | **REST API endpoints** (thin adapters — validate, delegate, respond). Auth · products · inventory · orders · users · settings · uploads · dev/reset-demo |
| `src/lib/backend/` | **The real backend toolkit** (the "services layer"): |
| ↳ `session.ts` | HMAC-signed httpOnly cookie sessions (7-day TTL) |
| ↳ `password.ts` | bcryptjs hashing (10 rounds) |
| ↳ `http.ts` | JSON response + body-reading helpers |
| ↳ `users.ts` | Public user shaping (password hashes never leave the server) |
| ↳ `orders.ts` | Money math, order references, stock validation + ledger |
| ↳ `seed.ts` | `resetAndSeed()` demo scenario (also used by the CLI) |
| `src/lib/prisma.ts` | Singleton Prisma client — the only doorway to the database |
| `prisma/schema.prisma` | Database schema (User, Product, Order, OrderItem, InventoryItem, StockMovement, CafeSettings) |
| `prisma/dev.db` | The SQLite database itself — the whole DB is this one file |
| `prisma/seed.ts` | CLI entry point that calls `resetAndSeed()` |
| `prisma/set-product-images.ts` | One-off script attaching product photos to DB rows |
| `prisma/count-check.ts` | Row-count checker for the data-requirement audit |
| `src/lib/mock-data.ts` | The seed DATA source (products, users, stock, 60 days of orders). Imported only by the seed — the running app never touches it |

**Request flow (example: customer checks out):**

```
Browser (React)
   ↓  fetch("POST /api/orders")
src/app/api/orders/route.ts        ← route handler: reads/validates the body
   ↓
src/lib/backend/orders.ts          ← business rules: totals, stock ledger, ref
   ↓
src/lib/prisma.ts                  ← database client
   ↓
prisma/dev.db                      ← SQLite writes the rows
   ↓ (response travels back up)
Browser state updates from the server's JSON — the server response is the truth
```

---

## 🎨 FRONTEND — "the browser half"

Everything that renders and reacts in the user's browser.

| Location | Role |
|---|---|
| `src/app/(customer)/` | Public site pages: landing, `/menu`, `/menu/[id]`, `/cart`, `/checkout`, `/order-confirmation`, `/my-orders`, settings |
| `src/app/(auth)/` | `/login`, `/register`, `/forgot-password` |
| `src/app/staff/` | Cashier POS, kitchen order queue, ready-for-handoff board, transactions |
| `src/app/rider/` | Delivery board, delivery history |
| `src/app/admin/` | Dashboard, products, inventory, transactions, reports, staff, settings |
| `src/components/features/` | Screen section components, organized by side of the app (customer / staff / rider / admin / auth / layout). Each screen is a thin page composing `<Section />` pieces |
| `src/components/common/` | Dependency-free primitives: `ui/` (button, card, input, badge, modal), `charts.tsx` (SVG bar/line/donut charts), `toast.tsx`, `theme-provider.tsx` |
| `src/components/shared/` | Components used by more than one side (e.g. `transaction-table.tsx`) |
| `src/context/store.tsx` | THE shared client data layer — every action is a `fetch` to `/api/*`; no optimistic updates |
| `src/hooks/` | Small client hooks |
| `public/` | Static assets — product photos in `public/ba pics/` (subfolders per category) |

Each role area is route-guarded (`features/layout/auth-guard.tsx`): staff pages
refuse customers, admin pages refuse staff, and so on — the check runs on the
client against `/api/auth/me`, while the API itself re-verifies the session on
every request (never trust the browser).

---

## 🔀 SHARED — "used by both halves"

| Location | Role |
|---|---|
| `src/lib/types.ts` | The domain model (Product, Order, Inventory, User…) + constants like `DELIVERY_FEE` and `isMadeToOrder()`. One vocabulary for API, DB shapes, and UI |
| `src/lib/analytics.ts` | Pure math: descriptive aggregations, SMA forecasting, demand estimates, recommendation generator. Called by admin/reports (frontend) and can be reused by API routes |
| `src/lib/utils.ts` | `cn()` class merger + currency/date formatters |

---

## Quick reference

| I want to change… | Go to |
|---|---|
| A page's layout/sections | `src/components/features/<side>/<page>/` |
| A business rule (e.g. stock validation) | `src/lib/backend/` |
| A REST endpoint's shape | `src/app/api/<resource>/route.ts` |
| Database tables/columns | `prisma/schema.prisma` → then `npx prisma generate` |
| Demo data (menu, accounts, history) | `src/lib/mock-data.ts` → then `npx tsx prisma/seed.ts` |
| Chart rendering | `src/components/common/charts.tsx` |
| Money math / analytics | `src/lib/analytics.ts` |
