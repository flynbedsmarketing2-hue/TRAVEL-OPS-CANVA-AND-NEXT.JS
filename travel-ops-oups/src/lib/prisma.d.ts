import type { PrismaClient } from "@prisma/client";

declare global {
  var __prismaClient: PrismaClient | undefined;
}

export {};
