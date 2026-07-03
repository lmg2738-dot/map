import packageJson from "../../package.json";

const REQUIRED_ENV = [
  "VWORLD_API_KEY",
  "NGII_API_KEY",
  "KAKAO_REST_API_KEY",
  "OPENROUTER_API_KEY",
] as const;

const OPTIONAL_ENV = ["OPENROUTER_SITE_URL", "OPENROUTER_APP_NAME"] as const;

export type HealthStatus = "ok" | "degraded" | "down";

export interface EnvCheck {
  name: string;
  configured: boolean;
  required: boolean;
}

export interface ServiceCheck {
  name: string;
  status: "ok" | "fail" | "skip";
  latencyMs?: number;
  message?: string;
}

function isConfigured(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export function checkEnvVars(): EnvCheck[] {
  const required = REQUIRED_ENV.map((name) => ({
    name,
    configured: isConfigured(name),
    required: true,
  }));
  const optional = OPTIONAL_ENV.map((name) => ({
    name,
    configured: isConfigured(name),
    required: false,
  }));
  return [...required, ...optional];
}

export function getEnvStatus(checks: EnvCheck[]): HealthStatus {
  const missingRequired = checks.filter((c) => c.required && !c.configured);
  if (missingRequired.length === checks.filter((c) => c.required).length) return "down";
  if (missingRequired.length > 0) return "degraded";
  return "ok";
}

export function getBaseHealth() {
  const envChecks = checkEnvVars();
  const envStatus = getEnvStatus(envChecks);

  return {
    service: "LandScout",
    version: packageJson.version,
    status: envStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "unknown",
    deployment: {
      vercel: Boolean(process.env.VERCEL),
      region: process.env.VERCEL_REGION ?? null,
      url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    },
    runtime: {
      nodeVersion: process.version,
    },
    env: {
      status: envStatus,
      checks: envChecks.map(({ name, configured, required }) => ({
        name,
        configured,
        required,
      })),
    },
    routes: {
      home: "/",
      dashboard: "/dashboard",
      analyze: "/analyze",
      health: "/api/health",
      healthDeep: "/api/health/deep",
      analyzeApi: "/api/analyze?address={address}",
    },
  };
}

async function timedFetch(
  name: string,
  url: string,
  init?: RequestInit
): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      return { name, status: "fail", latencyMs, message: `HTTP ${res.status}` };
    }
    return { name, status: "ok", latencyMs };
  } catch (err) {
    return {
      name,
      status: "fail",
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : "unknown error",
    };
  }
}

export async function runDeepChecks(): Promise<ServiceCheck[]> {
  const checks: ServiceCheck[] = [];

  checks.push(
    await timedFetch("openrouter-models", "https://openrouter.ai/api/v1/models")
  );

  if (isConfigured("KAKAO_REST_API_KEY")) {
    checks.push(
      await timedFetch(
        "kakao-local",
        "https://dapi.kakao.com/v2/local/search/address.json?query=서울",
        { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
      )
    );
  } else {
    checks.push({ name: "kakao-local", status: "skip", message: "KAKAO_REST_API_KEY 미설정" });
  }

  if (isConfigured("VWORLD_API_KEY")) {
    const url = new URL("https://api.vworld.kr/req/address");
    url.searchParams.set("service", "address");
    url.searchParams.set("request", "getcoord");
    url.searchParams.set("key", process.env.VWORLD_API_KEY!);
    url.searchParams.set("type", "parcel");
    url.searchParams.set("address", "서울특별시 중구 세종대로 110");
    url.searchParams.set("format", "json");
    checks.push(await timedFetch("vworld-geocode", url.toString()));
  } else {
    checks.push({ name: "vworld-geocode", status: "skip", message: "VWORLD_API_KEY 미설정" });
  }

  return checks;
}

export function aggregateDeepStatus(
  envStatus: HealthStatus,
  services: ServiceCheck[]
): HealthStatus {
  if (envStatus === "down") return "down";
  const failed = services.filter((s) => s.status === "fail");
  if (failed.length > 0) return "degraded";
  if (envStatus === "degraded") return "degraded";
  return "ok";
}
