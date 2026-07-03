function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`환경변수 ${name} 이(가) 설정되지 않았습니다.`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export function getVworldKey() {
  return requireEnv("VWORLD_API_KEY");
}

export function getNgiiKey() {
  return requireEnv("NGII_API_KEY");
}

export function getKakaoKey() {
  return requireEnv("KAKAO_REST_API_KEY");
}

export function getOpenRouterKey() {
  return requireEnv("OPENROUTER_API_KEY");
}

export function getOpenRouterMeta() {
  return {
    siteUrl: optionalEnv("OPENROUTER_SITE_URL"),
    appName: optionalEnv("OPENROUTER_APP_NAME") ?? "LandScout",
  };
}
