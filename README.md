# 🍫 Cacao & Co. — Artisan Chocolate Webstore

A demo e-commerce storefront for artisan chocolates, built as the **target workload** for the [Azure SRE Agent demo](https://github.com/ericchansen/azure-sre-agent-demo). Browse products, manage a cart, and place orders — or break checkout on demand to trigger automated incident response.

## Architecture

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Browser    │────▶│  Azure Container App │────▶│  PostgreSQL Flexible│
│              │     │  (Next.js)           │     │  Server             │
└─────────────┘     └──────────┬───────────┘     └─────────────────────┘
                               │
                    ┌──────────┴───────────┐
                    │  Application Insights │
                    │  (OpenTelemetry)      │
                    └──────────────────────┘
```

- **Azure Container Apps** — hosts the Next.js standalone build
- **Azure Container Registry** — stores Docker images
- **PostgreSQL Flexible Server** — product catalog, carts, and orders
- **Application Insights** — OpenTelemetry-based telemetry for request tracing and failure detection
- **Key Vault** — secrets management (DB credentials, connection strings)

## Local Development

**Prerequisites:** Node.js 20+, Docker

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Set up environment
cp .env.example .env   # or create .env with: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webstore

# 4. Run migrations and seed data
npx prisma migrate dev
npm run db:seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse the store.

### Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed product catalog |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |

## Deployment

Infrastructure is defined in Bicep (`infra/main.bicep`) and provisions all Azure resources.

```bash
# Deploy infrastructure
./infra/deploy.ps1 -ResourceGroup <rg-name> -Location <region> -PostgresPassword <password>
```

CI/CD is handled by GitHub Actions:

- **`ci.yml`** — lint, typecheck, and test on every push/PR
- **`deploy.yml`** — manual workflow dispatch to build, push to ACR, and update the Container App
- **`pr-staging.yml`** / **`pr-cleanup.yml`** — *(deactivated)* ephemeral staging environments for PRs (workflow files renamed to `.yml.disabled`)

## Demo Failure Mode

The webstore includes a built-in failure toggle for demonstrating Azure SRE Agent capabilities.

### Triggering the Failure

Set the `DEMO_BROKEN_CHECKOUT` environment variable on the Container App:

```bash
az containerapp update -n <app-name> -g <rg-name> \
  --set-env-vars DEMO_BROKEN_CHECKOUT=true
```

### What Happens

When `DEMO_BROKEN_CHECKOUT=true`, the `POST /api/orders` endpoint:

1. Introduces a 1.5-second delay simulating a downstream timeout
2. Records error attributes and events on the active OpenTelemetry span
3. Returns **503 Service Unavailable**

Browsing products and managing the cart still work — only checkout is broken.

### SRE Agent Response

The companion [Azure SRE Agent](https://github.com/ericchansen/azure-sre-agent-demo) detects the spike in 503 errors via Application Insights, investigates the telemetry, traces the failure to the source code, and recommends a rollback or env var fix.

### Restoring Normal Operation

```bash
az containerapp update -n <app-name> -g <rg-name> \
  --set-env-vars DEMO_BROKEN_CHECKOUT=false
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Database | PostgreSQL 15 via Prisma ORM |
| Styling | Tailwind CSS + shadcn/ui |
| Telemetry | Azure Monitor OpenTelemetry |
| Container | Docker (Node 20 Alpine, standalone build) |
| Infrastructure | Bicep → Azure Container Apps, ACR, Key Vault, PostgreSQL Flexible Server |
| CI/CD | GitHub Actions |

## Companion Repo

👉 [ericchansen/azure-sre-agent-demo](https://github.com/ericchansen/azure-sre-agent-demo) — Bicep templates for deploying the Azure SRE Agent that monitors this webstore.
