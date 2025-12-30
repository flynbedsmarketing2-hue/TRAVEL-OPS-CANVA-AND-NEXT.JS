# Project Map

## Repo layout

- **Repo root (`/workspace/TRAVEL-OPS-CANVA-AND-NEXT.JS`)**
  - Wrapper that contains dependencies and a single app folder.
  - Entrypoints: `package.json`, `start-travel-ops.bat`.
- **App (`travel-ops-oups/`)**
  - The Next.js app lives here (`travel-ops-oups/src`).
  - Prisma schema and client: `travel-ops-oups/prisma/schema.prisma`, `travel-ops-oups/src/lib/prisma.ts`.
  - API routes: `travel-ops-oups/src/app/api/*`.

## Route map

| Route | Store(s) | API / data source |
| --- | --- | --- |
| `/dashboard` | `useProductStore`, `useBookingStore`, `useTaskStore`, `useCrmStore`, `useMarketingStore` | Prisma via `/api/products` (products), shared-data JSON via `/api/shared/*` (bookings, tasks, leads, campaigns/content) |
| `/packages` | `useProductStore` | Prisma via `/api/products` |
| `/packages/[id]` | `useProductStore` | Prisma via `/api/products` |
| `/pricing` | _No store_ (local state + fetch) | Prisma via `/api/pricing` |
| `/sales` | `useBookingStore`, `useProductStore` | shared-data JSON via `/api/shared/bookings` (bookings), Prisma via `/api/products` (products) |
| `/ops` | `useProductStore`, `useOpsStatusStore` | Prisma via `/api/products` (packages); ops status is local-only in Zustand (no API) |
| `/tasks` | `useTaskStore` | shared-data JSON via `/api/shared/tasks` |
| `/crm` (subroutes `/crm/leads`, `/crm/pipeline`) | `useCrmStore` | shared-data JSON via `/api/shared/leads` |
| `/marketing` (subroutes `/marketing/campaigns`, `/marketing/content`) | `useMarketingStore` | shared-data JSON via `/api/shared/campaigns` and `/api/shared/content` |
| `/voyages` | `useProductStore` | Prisma via `/api/products` |

## Data sources

- **Prisma/Postgres**
  - Used for product inventory and pricing scenarios.
  - APIs: `src/app/api/products/*`, `src/app/api/pricing`.
  - Schema: `prisma/schema.prisma`.
- **shared-data JSON persistence**
  - Used for tasks, leads, campaigns, content, bookings, etc.
  - APIs: `src/app/api/shared/*`.
  - Backed by JSON files created in `travel-ops-oups/shared-data/` at runtime via `src/lib/sharedStorage`.

## Where to change what

- **UI components:** `src/components/*`
- **Stores (client state + API bindings):** `src/stores/*`
- **APIs (server routes):** `src/app/api/*`
- **DB schema:** `prisma/schema.prisma`
