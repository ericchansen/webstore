import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const health: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  // Database check is informational — it does NOT affect the HTTP status.
  // This keeps the health endpoint as a pure liveness check so a sleeping
  // DB doesn't mask the intentional checkout failure during the demo.
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.database = {
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    health.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return NextResponse.json(health, { status: 200 });
}
