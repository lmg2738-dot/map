import { NextResponse } from "next/server";
import { getBaseHealth } from "@/lib/health";
import { logRequest, logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const health = getBaseHealth();
  const statusCode = health.status === "down" ? 503 : 200;

  logRequest("GET", "/api/health", statusCode, Date.now() - start);
  logger.info("Health check", "health", { status: health.status });

  return NextResponse.json(health, {
    status: statusCode,
    headers: { "Cache-Control": "no-store" },
  });
}
