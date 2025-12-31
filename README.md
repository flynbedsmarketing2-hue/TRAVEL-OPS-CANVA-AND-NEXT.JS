# TRAVEL-OPS-CANVA-AND-NEXT.JS

## Golden path

```bash
npm install
npm run dev
```

## Prisma – one-command usage (Windows friendly)

Run every Prisma command from the repo root so the shared schema path and `.env` file run together. The root scripts validate that `travel-ops-oups/.env` exists with `DATABASE_URL`, then execute Prisma with `env-cmd` pointed at that file, so you never have to `cd` before running Prisma.

Use `npm run prisma:validate` first if you want to double-check the schema without hitting the database.

```
npm run prisma:pull
npm run prisma:push
npm run prisma:studio
```

Make sure Postgres is running and `travel-ops-oups/.env` contains a valid `DATABASE_URL` before running these commands; otherwise Prisma will report real connection errors instead of missing configuration.

## Fix Prisma P1000 in one command

When the Prisma CLI still hits P1000 (authentication failed), use the helper script to copy the credentials from your Docker Postgres container into `travel-ops-oups/.env`. The script masks the password in the log and the file is ignored so secrets stay out of git.

```
npm run db:up
npm run db:sync-env
npm run prisma:pull
```

This repo uses host port `5433` for Docker Postgres to avoid conflicts with a local `postgres.exe` listening on `5432`. If the commands still fail, double-check that the Docker Postgres container is up and listening on `5433`, then rerun `npm run db:sync-env`.

## Diagnose & reset Postgres

If `npm run db:sync-env` still leaves you with P1000 errors, run `npm run db:diagnose` to see what owns port 5432 and whether Docker actually maps 5433 to its Postgres container. The script will show netstat listeners, tasklist entries, and any Docker container/compose port mappings so you can spot mismatches.

```
npm run db:diagnose
```

If the existing Docker Postgres volume is stale or misconfigured, `npm run db:reset` tears down the compose stack (`down -v`) and brings it back up. **Warning:** this deletes the Docker volume, so rerun `npm run db:sync-env` and `npm run prisma:pull` afterward.

```
npm run db:reset
npm run db:sync-env
npm run prisma:pull
```
