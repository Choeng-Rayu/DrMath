import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Transient network/database errors that can clear up on retry (e.g. a pooled
// connection that dropped, or Supabase briefly pausing the project).
const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1017", "P2024"]);

function isTransient(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError && TRANSIENT_CODES.has(error.code))
  );
}

/**
 * Runs `run()` with a few short retries on transient database errors. Used for
 * page reads so a one-off connection blip renders the page instead of a 500.
 */
export async function withDbRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await run();
    } catch (error) {
      if (!isTransient(error) || attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw new Error("unreachable");
}
