import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const health: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.database = {
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    health.status = "degraded";
    health.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const statusCode = health.status === "ok" ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
