import { PrismaClient } from "@prisma/client";

const url = process.env.TEST_DATABASE_URL;

export const prisma = new PrismaClient(
  url ? { datasources: { db: { url } } } : undefined
);
