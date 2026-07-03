import { getNgiiKey } from "@/lib/env";

interface NgiiElevationResponse {
  elevation?: number;
  status?: string;
}

/**
 * 국토정보플랫폼 고도 조회 (보조 DEM)
 * VWorld 고도 실패 시 fallback
 */
export async function fetchNgiiElevation(
  lng: number,
  lat: number
): Promise<number | null> {
  const url = new URL("https://map.ngii.go.kr/openapi/OpenApiElevationHandler.do");
  url.searchParams.set("serviceKey", getNgiiKey());
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const text = await res.text();
    try {
      const data = JSON.parse(text) as NgiiElevationResponse;
      if (typeof data.elevation === "number") return data.elevation;
    } catch {
      // JSON 파싱 실패 시 regex fallback
    }

    const match = text.match(/"elevation"\s*:\s*([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  } catch {
    return null;
  }
}

export async function fetchNgiiElevations(
  points: Array<{ lng: number; lat: number }>
): Promise<number[]> {
  const results = await Promise.all(
    points.map((p) => fetchNgiiElevation(p.lng, p.lat))
  );
  return results.map((v) => v ?? 0);
}
