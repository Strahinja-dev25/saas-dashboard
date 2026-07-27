import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const getPrismaClient = () => {
  if (globalThis.prisma) return globalThis.prisma;
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
};

export const db = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
