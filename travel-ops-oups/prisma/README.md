# Prisma local setup

Automation around the Prisma schema lives inside `travel-ops-oups`. Follow this guide when you need to bootstrap the database for local development.

## Required environment variable

- `DATABASE_URL` (example: `postgresql://travelops:password@localhost:5432/travelops?schema=public`)
- Copy `.env.example` to `.env.local` inside `travel-ops-oups/` and update `DATABASE_URL` for your target Postgres instance.

## Docker Compose Postgres option

1. Create a `docker compose` file (for example `travel-ops-oups/prisma/docker-compose.yml`) that exposes Postgres on `5432`:

   ```yaml
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_USER: travelops
         POSTGRES_PASSWORD: password
         POSTGRES_DB: travelops
       ports:
         - 5432:5432
       volumes:
         - postgres-data:/var/lib/postgresql/data

   volumes:
     postgres-data:
   ```

2. Start it from the repository root:

   ```bash
   docker compose -f travel-ops-oups/prisma/docker-compose.yml up -d
   ```

3. Update `DATABASE_URL` to match the container credentials (`postgresql://travelops:password@localhost:5432/travelops?schema=public`).

## Local Postgres option

- Install Postgres via your platform package manager (Homebrew, apt, etc.).
- Start the service (e.g. `brew services start postgresql` or `sudo service postgresql start`).
- Create a dedicated database and user, then update `DATABASE_URL`.

## Prisma commands

Run these from `travel-ops-oups/`.

- `npm run prisma:generate` – refreshes the generated Prisma client after schema changes.
- `npm run db:push` – creates or syncs the schema to your database (`DATABASE_URL` must be set).
- `npm run db:studio` – launches Prisma Studio so you can inspect tables and rows.

## Verifying the connection

1. Run `npx prisma db pull` to fetch the current schema metadata; failure indicates the connection string is invalid.
2. If you have `psql`, execute `psql "$DATABASE_URL" -c '\dt'` to list tables and confirm connectivity.
3. After `db:push`, start the app (`npm run dev`) and hit `http://localhost:3000/api/products/pricing`; a `200` response means Prisma can reach the database and the pricing routes are ready.
