# Sweet Crumb Café — Cafe Management & Business Analytics System

A web-based cafe management and business analytics system built with **Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma · SQLite**.

One application, four role interfaces sharing one real database:

| Interface | Who | What |
|---|---|---|
| **Admin / Owner** | `admin@cafe.com` / `admin123` | Dashboard KPIs, products, inventory, transactions, reports (daily / weekly / monthly sales, product, inventory, channel), staff management, settings — under `/admin` |
| **Staff / Cashier** | `staff@cafe.com` / `staff123` | POS with payment validation & change calculation, order management (kitchen queue), ready-for-handoff board (pickup + delivery), transaction history — under `/staff` |
| **Delivery Rider** | `rider@cafe.com` / `rider123` | Delivery board (claim, start, deliver), delivery history — under `/rider` |
| **Customer** | `jasmine@gmail.com` / `customer123` (or guest) | Landing page, online menu, product details, cart, pickup-or-delivery checkout, order confirmation, my orders |

## Running

```bash
npm install
npx prisma generate          # create the typed Prisma client
npx tsx prisma/seed.ts       # build the demo database (accounts, menu, stock, ~60 days of orders)
npm run dev                  # development  → http://localhost:3000
npm run build                # production build
```

The SQLite database lives at `prisma/dev.db` (configured by `.env` → `DATABASE_URL`). Re-running the seed at any time wipes and regenerates the full demo scenario with fresh dates.

## Pages (23)

**Public ** `/`, `/login`, `/register`, `/forgot-password`
**Customer ** `/menu`, `/menu/[id]`, `/cart`, `/checkout`, `/order-confirmation`, `/my-orders`
**Staff ** `/staff/cashier`, `/staff/orders`, `/staff/ready`, `/staff/transactions`
**Rider ** `/rider`, `/rider/history`
**Admin ** `/admin/dashboard`, `/admin/products`, `/admin/inventory`, `/admin/transactions`, `/admin/reports`, `/admin/staff`, `/admin/settings`

## Architecture

**See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full backend-vs-frontend folder map, request-flow walkthrough, and "where do I change X?" quick reference.**

```
src/
  lib/                 — pure logic, no React
    types.ts           — shared domain model (Product, Order/Transaction, Inventory, User…)
    mock-data.ts       — deterministic demo generator (products, users, 60 days of orders) —
                         consumed ONLY by the seed; the app itself never imports it
    analytics.ts       — descriptive aggregations, SMA forecasting, demand estimates,
                         and the prescriptive recommendation generator
    utils.ts           — cn() + formatters
    prisma.ts          — the singleton Prisma client
    backend/           — server-side toolkit used by the API routes
      session.ts       — HMAC-signed httpOnly cookie sessions (7-day TTL)
      password.ts      — bcryptjs hashing (10 rounds)
      http.ts          — JSON response + body-reading helpers
      users.ts         — public user shaping (hashes never leave the server)
      orders.ts        — money math, order references, stock validation/ledger
      seed.ts          — resetAndSeed(): the demo scenario, shared by the CLI
                         and the /api/dev/reset-demo endpoint
  context/
    store.tsx          — THE shared data layer: same state shape and action names
                         as before, but every action is now a fetch to /api/*
                         (no optimistic updates; the server response is the truth)
  components/
    common/            — shared primitives (dependency-free)
      ui/              — button, card, input, badge, modal
      charts.tsx       — SVG bar / line / donut / horizontal-bar charts
      toast.tsx        — notifications
      theme-provider.tsx
    shared/
      transaction-table.tsx — used by staff + admin transaction views
    features/          — organized by side of the app
      layout/          — site-nav, admin-shell, staff-shell, rider-shell, auth-guard
      customer/        — landing, menu, cart, checkout, my-orders screens…
      auth/            — login, register, forgot-password screens
      staff/           — cashier, orders, transactions screens
      rider/           — delivery board, delivery history screens
      admin/           — dashboard, products, inventory, reports… screens
  app/
    api/               — the REST backend (route handlers)
      auth/            — login · logout · me · register · profile · forgot-password
      products/        — catalog CRUD (+ [id])
      inventory/       — stock rows, PATCH threshold, adjust movements
      orders/          — list/checkout + [id] actions (status, payment, cancel,
                         delivery leg, trash)
      users/           — account directory + staff CRUD (+ [id])
      settings/        — cafe settings (public GET, admin PATCH)
      dev/reset-demo/  — admin-only full reseed
    (auth)/            — /login · /register · /forgot-password (public)
    (customer)/        — /, /menu, /cart, /checkout, /my-orders … (site nav/footer)
    staff/             — /staff/* (guarded)
    rider/             — /rider/* (guarded)
    admin/             — /admin/* (guarded)
prisma/
  schema.prisma        — 7 models: User, Product, InventoryItem, StockMovement,
                         Order, OrderItem, CafeSettings
  seed.ts              — CLI entry: npx tsx prisma/seed.ts
  dev.db               — the SQLite database (created by migrate/seed)
```

### Business rules implemented

- Orders created **at the POS are `WALK-IN`**, orders from the **website are `ONLINE`** — automatically.
- Customers choose **store pickup or delivery** at checkout; delivery orders carry a flat fee and progress `QUEUED → CLAIMED → OUT FOR DELIVERY → DELIVERED`. The rider stage starts when the kitchen marks the order **READY** — only then do delivery orders appear on the **rider delivery board**.
- **Cash on delivery** is collected by the rider — marking the delivery done settles the payment (PAID) but does **not** complete the order. Staff close the loop on the **Ready for Handoff** page: the **→ Completed** button appears there only after the rider marks the delivery delivered, and while the rider leg is in progress the card mirrors it live (waiting for rider → accepted → out for delivery).
- Orders marked **Ready** by the kitchen leave Order Management and appear on the staff **Ready for Handoff** page — 🏬 pickup orders wait to be collected (staff can complete them), 🛵 delivery orders show the live rider stage. The kitchen queue has no Completed button, so a stray click can never finish an order early.
- Sales revenue only counts **completed + paid** orders (cancelled/unpaid excluded).
- One order contains many **order items (transaction details)** with name/price snapshots.
- Inventory is **finished-products only**: additions, wastage/unsold recording, adjustments, movement history, low-stock thresholds and alerts.
- Stock sold is deducted from inventory; cancelled orders restore stock; menus can never sell beyond available stock.
- **Only the customer can cancel their own order** (from My Orders, until preparation starts) — a paid order is refunded and its stock restored; staff only advance the workflow.
- **Cancelled orders are housekeeping-safe**: staff can trash them from the queue (two-step confirm). Deletion is permanent and refused for anything that isn't cancelled.
- Guest checkout is supported; customer accounts are optional.
- **One session per browser** — signing in sets an HMAC-signed, httpOnly cookie (7-day TTL) shared by every tab, so "who is signed in" is consistent across the whole app. Shared cafe data (orders, products, stock) refreshes on a light 20-second poll (and on window focus), so a rider board updates when staff advance a kitchen order elsewhere.
- POS validates sufficient payment, computes change, prints a receipt and clears the ticket.
- Reporting: the **Dashboard** surfaces KPIs and trends, while **Reports** provides daily / weekly / monthly sales (chronologically ordered), product performance, inventory & wastage, and channel comparison — all exportable to CSV, all from the same transaction data.
- **Unsold-products analytics** on the Dashboard: a daily *unsold products* chart (end-of-shift write-offs for batch-baked goods, respects the range selector) plus a *sell-through by product* breakdown showing each item's **sold % vs unsold %** in one combined two-tone bar list — slow movers stand out at a glance.

> **No real payment gateway** — online payments are simulated (mark-paid flows / cash-on-pickup).

## The backend

The mock localStorage layer is gone — a real server sits under `src/app/api/`, with **Prisma + SQLite** as the database and **every rule the UI enforces re-enforced server-side** (the browser is a suggestion; the server is the law):

- **Auth**: `POST /api/auth/login` verifies the bcrypt hash and sets the session cookie; `/api/auth/me` answers "who is this browser"; register, profile edits and the demo forgot-password flow are all server-authoritative.
- **Passwords** are hashed (bcryptjs, 10 rounds) and **never leave the server** — the API only ever returns public user shapes.
- **Prices are snapshotted from the database** at checkout — price fields arriving from the browser are ignored (order items keep name/price snapshots so history survives menu edits).
- **Stock is transactional**: walk-in sales validate and deduct inside one Prisma transaction (two cashiers can't both sell the last croissant); online orders reserve nothing but refuse to oversell, deducting when the sale is final (completed-and-paid, or COD settled at the door); cancellations restore stock with exact-delta `SOLD`/`ADJUSTMENT` ledger movements.
- **Role rules** are enforced per endpoint: customers see only their own orders (and a 403 on the account directory), riders see claimable deliveries plus their own history, the kitchen ladder refuses skipped steps, only customers can cancel (before preparation starts), and the last active admin can't be demoted or deactivated.
- **Sessions die with their data**: resetting the demo data invalidates the current session, because the accounts themselves are regenerated.

### API surface

| Endpoint | Methods | Who |
|---|---|---|
| `/api/auth/login` · `logout` · `me` | POST · POST · GET | everyone |
| `/api/auth/register` · `profile` · `forgot-password` | POST · PATCH · POST | public / self / public |
| `/api/products` (+ `/[id]`) | GET · POST · PATCH · DELETE | public reads, admin writes |
| `/api/inventory` (+ `/adjust`) | GET · PATCH · POST | staff + admin |
| `/api/orders` (+ `/[id]`) | GET · POST · PATCH · DELETE | role-filtered (see GET rules above) |
| `/api/users` (+ `/[id]`) | GET · POST · PATCH | admin (riders/staff get the team view) |
| `/api/settings` | GET · PATCH | public reads, admin writes |
| `/api/dev/reset-demo` | POST | admin only |

The frontend talks to these through `src/context/store.tsx` — the same typed `StoreContextValue` the pages have always consumed, now backed by a thin `api()` fetch wrapper and row→type mappers. Pages didn't change shape; the 11 actions that need the server's answer simply became `async`.

## Demo data

`npx tsx prisma/seed.ts` (or Admin → Settings → **Reset demo data**) wipes the database and regenerates **~60 days of realistic transactions** (weekday/weekend rhythm, drink bias, a recent demand up-trend, a few low-stock items) plus **deterministic end-of-shift waste history** for the batch-baked goods — so dashboard charts, forecasts, unsold analytics and recommendations show meaningful patterns.

One honest nuance: history is **imported as receipts, not replayed through the stock ledger** — inventory carries its current quantities plus "Opening stock loaded" (ADD) and end-of-shift (WASTED) movements, exactly like a real café adopting the system. `SOLD` movements start accruing from real sales made through the app.
"# Sweet-Crumb-Caf-" 
