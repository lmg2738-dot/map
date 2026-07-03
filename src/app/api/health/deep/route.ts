import { NextResponse } from "next/server";
import {
  aggregateDeepStatus,
  checkEnvVars,
  getBaseHealth,
  getEnvStatus,
  runDeepChecks,
} from "@/lib/health";
import { logRequest, logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const start = Date.now();
  const base = getBaseHealth();
  const envChecks = checkEnvVars();
  const envStatus = getEnvStatus(envChecks);

  logger.info("Deep health check started", "health/deep");

  const services = await runDeepChecks();
  const status = aggregateDeepStatus(envStatus, services);
  const statusCode = status === "down" ? 503 : status === "degraded" ? 200 : 200;

  const result = {
    ...base,
    status,
    checks: {
      env: base.env,
      services,
    },
    summary: {
      envOk: envChecks.filter((c) => c.required && c.configured).length,
      envRequired: envChecks.filter((c) => c.required).length,
      servicesOk: services.filter((s) => s.status === "ok").length,
      servicesFailed: services.filter((s) => s.status === "fail").length,
      servicesSkipped: services.filter((s) => s.status === "skip").length,
    },
  };

  logRequest("GET", "/api/health/deep", statusCode, Date.now() - start);
  logger.info("Deep health check completed", "health/deep", {
    status,
    durationMs: Date.now() - start,
  });

  return NextResponse.json(result, {
    status: statusCode,
    headers: { "Cache-Control": "no-store" },
  });
}
