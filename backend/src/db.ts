import { PrismaClient } from "@prisma/client";

// One Prisma client for the process lifetime. In dev with tsx watch this
// module can re-evaluate on hot reload, so stash the instance on globalThis
// to avoid exhausting SQLite connections across reloads.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const db = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
