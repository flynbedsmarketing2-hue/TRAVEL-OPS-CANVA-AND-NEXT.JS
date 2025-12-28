import { PrismaClient } from "@prisma/client";

declare global {
  var __prismaClient: PrismaClient | undefined;
}

const client = globalThis.__prismaClient ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prismaClient = client;
}

export { client as prisma };
