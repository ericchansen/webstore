# AGENTS.md — AI Agent Onboarding Guide

> This document is for AI coding agents (GitHub Copilot CLI, Codex, etc.) working in the **Cocoa Co Webstore** codebase.

## Project Overview

**Cocoa Co Webstore** is a full-stack e-commerce application.

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Radix UI (Shadcn), Sonner (toasts) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Prisma ORM |
| Payments | Stripe (PaymentIntent + Elements) |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Playwright (**Microsoft Edge only** — Chrome is NOT available) |
| Infra | Docker Compose (Postgres), GitHub Actions CI, Azure deployment |

---

## Getting Started

**Prerequisites:** Node.js 20+, Docker (for PostgreSQL)

```bash
npm ci                          # Install dependencies
docker compose up -d            # Start PostgreSQL
cp .env.example .env            # Copy env template, fill in Stripe keys
npx prisma generate             # Generate Prisma client
npx prisma db push              # Push schema to DB
npm run db:seed                 # Seed sample data
npm run dev                     # Start dev server at http://localhost:3000
```

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (TS/TSX files) |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run test:e2e:core` | Playwright core tests (Desktop Edge) |
| `npm run test:e2e:full` | All Playwright tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema to DB (dev) |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Environment Variables

Required in `.env` (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5434/webstore?schema=public` |
| `NEXT_PUBLIC_APP_URL` | App URL | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe test secret key | *(none — get from Stripe dashboard)* |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | *(none)* |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe test publishable key | *(none)* |

> **Note:** PostgreSQL runs on port **5434** (not default 5432) — this is set in `docker-compose.yml`.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # API routes (cart, checkout, orders)
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout page
│   ├── order-confirmation/ # Order confirmation page
│   ├── orders/             # Orders page
│   ├── products/           # Products listing & detail pages
│   ├── layout.tsx          # Root layout (Header, Footer, CartProvider)
│   ├── page.tsx            # Homepage (Server Component, fetches from DB)
│   └── globals.css         # Global styles (Tailwind v4)
├── components/
│   ├── cart/               # Cart drawer, cart items, cart provider (context)
│   ├── checkout/           # Checkout form, Stripe elements
│   ├── home/               # Hero, featured products, category showcase
│   ├── layout/             # Header, footer, navigation
│   ├── product/            # Product cards, grids, detail views
│   └── ui/                 # Shadcn/Radix UI primitives (button, dialog, etc.)
├── config/                 # Store configuration (branding, SEO)
├── generated/              # Prisma generated client (gitignored — never commit)
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── stripe.ts           # Stripe client config
│   └── utils.ts            # Utility functions (cn, formatPrice, etc.)
└── test/
    └── setup.ts            # Vitest test setup

prisma/
├── schema.prisma           # Database schema (Category, Product, Cart, Order)
└── seed.ts                 # Database seed script

e2e/
├── pages/                  # Page Object Model classes
├── fixtures/               # Test data fixtures (test-data.ts)
├── smoke.spec.ts           # Smoke tests (page rendering)
├── homepage.spec.ts        # Homepage tests
├── products.spec.ts        # Products page tests
├── product-detail.spec.ts  # Product detail tests
├── cart.spec.ts            # Cart tests
├── checkout.spec.ts        # Checkout flow tests
├── order-confirmation.spec.ts
├── stripe-payment.spec.ts  # Stripe payment tests
└── viewport.spec.ts        # Responsive viewport tests

infra/                      # Azure infrastructure (Bicep/deployment)
│   ├── main.bicep          # Production infrastructure
│   ├── main.bicepparam     # Production parameters
│   ├── deploy.ps1          # Manual deployment script
│   ├── destroy.ps1         # Manual teardown script
│   └── staging/
│       └── main.bicep      # Per-PR staging infrastructure

.github/workflows/
├── ci.yml                  # CI pipeline (lint, typecheck, unit tests, E2E, build)
├── deploy.yml              # Production deployment pipeline (manual dispatch)
├── pr-staging.yml.disabled # PR staging deploy (deactivated)
└── pr-cleanup.yml.disabled # PR staging cleanup (deactivated)
```

---

## Architecture Patterns

- **Server Components by default** — Pages fetch data directly from Prisma; no API layer needed for reads.
- **API Routes for mutations** — Cart operations, checkout, and order creation go through `/api/` routes.
- **Cart state** — React Context (`CartProvider`) with server-side persistence via Prisma `Cart`/`CartItem` models.
- **Stripe integration** — Checkout creates a `PaymentIntent` server-side; the client uses Stripe Elements for card input.
- **Database** — Prisma ORM with PostgreSQL. Models: `Category`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`.
- **Styling** — Tailwind CSS v4 with `class-variance-authority` for component variants, `tailwind-merge` for class merging.

---

## Code Style & Conventions

- TypeScript **strict mode** enabled.
- ESLint with Next.js config — run `npm run lint` before committing.
- **Tailwind CSS** for all styling — no CSS modules, no styled-components.
- Use `cn()` utility from `@/lib/utils` for conditional class merging.
- Shadcn UI component patterns in `src/components/ui/`.
- Prisma client imported from `@/lib/prisma`.
- Path alias: **`@/`** maps to **`src/`**.

---

## Testing Conventions

### Unit Tests (Vitest)
- Located in `src/test/` or co-located with source files.
- Run with `npm run test`.

### E2E Tests (Playwright)
- **Browser: Microsoft Edge only** — Chrome is NOT available in this environment.
- Uses **Page Object Model** pattern — POM classes live in `e2e/pages/`.
- Test data fixtures in `e2e/fixtures/test-data.ts`.
- **Projects:** `smoke` (quick render checks), `Desktop Edge` (core flow tests).

### ⚠️ Critical Testing Rules
- **NEVER** use `networkidle` wait state — it causes flaky tests with Next.js. Use `domcontentloaded` or locator assertions instead.
- **Before committing**, always run:
  ```bash
  npm run lint && npm run test && npx playwright test --project="Desktop Edge"
  ```
- E2E tests are **mandatory** before pushing.

---

## CI Pipeline

Defined in `.github/workflows/ci.yml`. Runs on PRs and pushes to `main`/`master`:

1. **Lint** — ESLint
2. **Type Check** — `tsc --noEmit` (requires `npx prisma generate` first)
3. **Unit Tests** — Vitest (requires `npx prisma generate` first)
4. **E2E Tests** — Playwright Desktop Edge tests with PostgreSQL service container
5. **Build** — Production build (runs after lint + typecheck + unit tests pass)

---

## PR Staging Environments *(Deactivated)*

> **Note:** PR staging environments have been deactivated. The workflow files have been renamed to `.yml.disabled` and will not run. The documentation below is retained for reference.

Previously defined in `.github/workflows/pr-staging.yml` and `.github/workflows/pr-cleanup.yml` (now `.yml.disabled`).

**On PR opened/updated** (`pr-staging.yml.disabled`):
1. Deploys isolated Azure infrastructure per PR (PostgreSQL, Container Apps Environment, Container App) via Bicep in `infra/staging/main.bicep`
2. Builds and pushes Docker image to shared ACR in `rg-webstore-staging`
3. Creates/updates a Container App (`ca-pr<N>`) with the PR's code
4. Runs Playwright E2E tests against the deployed staging URL
5. Posts a PR comment with the staging URL and E2E results

**On PR closed/merged** (`pr-cleanup.yml.disabled`):
1. Deletes all Azure resources tagged with `pr-number=<N>`
2. Updates the PR comment to indicate the environment was destroyed

### GitHub Secrets Required (not currently in use)
| Secret | Description |
|--------|-------------|
| `AZURE_CLIENT_ID` | OIDC App Registration client ID |
| `AZURE_TENANT_ID` | Entra ID tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

### Azure Resources (not currently provisioned)
- **Resource Group:** `rg-webstore-staging` (shared, persistent)
- **ACR:** `acrwebstorestaging` (shared across PRs)
- **Per-PR:** PostgreSQL Flexible Server, Container Apps Environment, Container App, Log Analytics

---

## Git Workflow

- **Feature branches:** `<type>/<short-description>` (e.g., `feat/search`, `fix/cart-total`)
- **Conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`, `ci:`, `perf:`
- Always run lint + unit tests + E2E tests before committing.
- Scan staged diffs for secrets before committing — never commit API keys, tokens, or connection strings.

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Typecheck/build/tests fail with Prisma errors | Run `npx prisma generate` first |
| Database connection refused | Run `docker compose up -d` to start PostgreSQL |
| Wrong Postgres port | Port is **5434** (not 5432) — check `DATABASE_URL` |
| Playwright fails to launch browser | Use **Edge only** — Chrome is not available |
| Flaky E2E tests with timeouts | Remove any `networkidle` usage — use `domcontentloaded` or locator assertions |
| Missing `src/generated/` directory | This is gitignored — run `npx prisma generate` to create it |
| Checkout/payment tests fail | Stripe test keys are required in `.env` |
