import { getVworldKey } from "@/lib/env";

const VWORLD_BASE = "https://api.vworld.kr/req";

interface VworldResponse {
  response?: {
    status?: string;
    result?: {
      point?: { x: string; y: string };
      featureCollection?: {
        features?: Array<{
          properties?: Record<string, string>;
          geometry?: { type: string; coordinates: unknown };
        }>;
      };
      items?: Array<{ point?: string; value?: string }>;
    };
  };
}

async function vworldFetch(params: Record<string, string>): Promise<VworldResponse> {
  const url = new URL(VWORLD_BASE + params.path);
  url.searchParams.set("key", getVworldKey());
  url.searchParams.set("format", "json");
  Object.entries(params).forEach(([k, v]) => {
    if (k !== "path") url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`VWorld API 오류 (${res.status})`);
  return res.json() as Promise<VworldResponse>;
}

export async function vworldGeocode(address: string) {
  const data = await vworldFetch({
    path: "/address",
    service: "address",
    request: "getcoord",
    type: "parcel",
    address,
  });

  const point = data.response?.result?.point;
  if (!point) return null;

  return { lng: parseFloat(point.x), lat: parseFloat(point.y) };
}

export interface CadastralInfo {
  pnu?: string;
  jibun?: string;
  jimok?: string;
  area?: number;
}

export async function fetchCadastral(
  lng: number,
  lat: number
): Promise<CadastralInfo | null> {
  const data = await vworldFetch({
    path: "/data",
    service: "data",
    request: "GetFeature",
    data: "LP_PA_CBND_BUBUN",
    geomFilter: `POINT(${lng} ${lat})`,
    size: "1",
  });

  const feature = data.response?.result?.featureCollection?.features?.[0];
  if (!feature?.properties) return null;

  const props = feature.properties;
  return {
    pnu: props.pnu,
    jibun: props.addr ?? props.jibun,
    jimok: props.jimok ?? props.lndcgrCodeNm,
    area: props.lndpclAr ? parseFloat(props.lndpclAr) : undefined,
  };
}

export async function fetchElevations(
  points: Array<{ lng: number; lat: number }>
): Promise<number[]> {
  const pointStr = points.map((p) => `${p.lng},${p.lat}`).join("|");

  const data = await vworldFetch({
    path: "/3D",
    service: "3D",
    request: "getElevation",
    point: pointStr,
  });

  const items = data.response?.result?.items ?? [];
  return items.map((item) => parseFloat(item.value ?? "0"));
}

export function calcSlopeFromElevations(
  elevations: number[],
  sampleDistanceM = 30
): { average: number; max: number } {
  if (elevations.length < 2) return { average: 0, max: 0 };

  const slopes: number[] = [];
  const center = elevations[0];
  for (let i = 1; i < elevations.length; i++) {
    const diff = Math.abs(elevations[i] - center);
    const slopeDeg = (Math.atan(diff / sampleDistanceM) * 180) / Math.PI;
    slopes.push(slopeDeg);
  }

  const average = slopes.reduce((a, b) => a + b, 0) / slopes.length;
  return {
    average: Math.round(average * 10) / 10,
    max: Math.round(Math.max(...slopes) * 10) / 10,
  };
}

export function slopeGrade(avg: number): "flat" | "gentle" | "moderate" | "steep" {
  if (avg < 8) return "flat";
  if (avg < 15) return "gentle";
  if (avg < 22) return "moderate";
  return "steep";
}

export function samplePointsAround(
  lng: number,
  lat: number,
  offsetDeg = 0.00027
): Array<{ lng: number; lat: number }> {
  return [
    { lng, lat },
    { lng: lng + offsetDeg, lat },
    { lng: lng - offsetDeg, lat },
    { lng, lat: lat + offsetDeg },
    { lng, lat: lat - offsetDeg },
  ];
}
