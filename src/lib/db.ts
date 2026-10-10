import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton (avoids exhausting connections during Next.js
 * hot reload in development).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function databaseHealthCheck() {
  try {
    const [metricCount, brandCount, datasetCount] = await Promise.all([
      prisma.metric.count(),
      prisma.brand.count(),
      prisma.dataset.count(),
    ]);
    return { ok: true, metricCount, brandCount, datasetCount };
  } catch (error) {
    return {
      ok: false,
      metricCount: 0,
      brandCount: 0,
      datasetCount: 0,
      error: error instanceof Error ? error.message : "数据库连接失败",
    };
  }
}
