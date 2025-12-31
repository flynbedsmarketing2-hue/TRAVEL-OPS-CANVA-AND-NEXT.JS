# v0-stable baseline

## What v0-stable means
"v0-stable" marks the known working snapshot of the project before UX/product stabilization work begins. All core features should build, link to the shared infrastructure (Docker Postgres, Prisma config, etc.), and run without additional structural changes.

## Golden path (Windows)
These commands document the workflow that should succeed when the repo is healthy:

```powershell
npm install
npm run dev
```

## Prisma commands (run from repo root)
Shared Prisma tooling assumes the schema and `.env` file live under `travel-ops-oups`, so always run these from the repository root:

```
npm run prisma:validate
npm run prisma:pull
npm run prisma:push
```

## Troubleshooting
- P1000: Prisma authentication errors usually mean `travel-ops-oups/.env` is missing or has stale credentials; rerun `npm run db:sync-env` after ensuring the Docker Postgres container (listening on host port `5433`) is running.
- Port conflict: the stack relies on host port `5433` for Docker Postgres so that `postgres.exe` on `5432` can keep running; if you see a bind error, make sure nothing else is latching onto `5433` or stop the local Postgres service before restarting the Docker stack.
