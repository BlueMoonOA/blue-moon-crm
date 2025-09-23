// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// In dev we reuse the same client across HMR reloads
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prismaInstance =
  global.__prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prismaInstance;
}

// Export BOTH a default and a named export so either import style works
export const prisma = prismaInstance;
export default prismaInstance;
