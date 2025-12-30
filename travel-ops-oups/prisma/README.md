# Prisma local setup

## Required environment variables

- `DATABASE_URL` (e.g. `postgresql://USER:PASSWORD@HOST:5432/DB?schema=public`)

## Push the schema

From `travel-ops-oups/`:

```bash
npm run db:push
```

## App areas that rely on Prisma

- Products API routes
- Pricing API routes
