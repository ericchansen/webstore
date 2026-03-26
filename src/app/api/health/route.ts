import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 3000;

export async function GET() {
  const health: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  // Database check is informational — it does NOT affect the HTTP status.
  // This keeps the health endpoint as a pure liveness check so transient
  // database issues don't cause the health probe itself to fail.
  try {
    const start = Date.now();
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), DB_TIMEOUT_MS)
      ),
    ]);
    health.database = {
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    health.status = "degraded";
    health.database = {
      status: "error",
      error:
        process.env.NODE_ENV === "production"
          ? "Database check failed"
          : error instanceof Error
            ? error.message
            : "Unknown error",
    };
  }

  return NextResponse.json(health, { status: 200 });
}
