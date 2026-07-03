import { getKakaoKey } from "@/lib/env";

export interface KakaoCoord {
  lat: number;
  lng: number;
  addressName: string;
  region: string;
}

interface KakaoAddressDocument {
  address_name: string;
  x: string;
  y: string;
  address?: { region_1depth_name?: string; region_2depth_name?: string };
}

interface KakaoKeywordDocument {
  place_name: string;
  category_name: string;
  distance: string;
  x: string;
  y: string;
}

const KAKAO_BASE = "https://dapi.kakao.com/v2/local";

async function kakaoFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${KAKAO_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${getKakaoKey()}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Kakao API 오류 (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function geocodeAddress(query: string): Promise<KakaoCoord | null> {
  const data = await kakaoFetch<{ documents: KakaoAddressDocument[] }>(
    "/search/address.json",
    { query, size: "1" }
  );

  const doc = data.documents[0];
  if (!doc) return null;

  return {
    lat: parseFloat(doc.y),
    lng: parseFloat(doc.x),
    addressName: doc.address_name,
    region: [doc.address?.region_1depth_name, doc.address?.region_2depth_name]
      .filter(Boolean)
      .join(" "),
  };
}

export interface NearbyPlace {
  name: string;
  category: string;
  distanceM: number;
}

const POI_QUERIES = [
  { query: "변전소", category: "전기", type: "positive" as const },
  { query: "상수도", category: "용수", type: "positive" as const },
  { query: "편의점", category: "편의시설", type: "neutral" as const },
  { query: "초등학교", category: "교육", type: "positive" as const },
  { query: "매립장", category: "혐오시설", type: "negative" as const },
  { query: "공장", category: "산업", type: "negative" as const },
];

export async function searchNearbyPOI(
  lat: number,
  lng: number,
  radiusM = 3000
): Promise<Array<NearbyPlace & { type: "positive" | "neutral" | "negative" }>> {
  const results: Array<NearbyPlace & { type: "positive" | "neutral" | "negative" }> = [];

  await Promise.all(
    POI_QUERIES.map(async ({ query, category, type }) => {
      try {
        const data = await kakaoFetch<{ documents: KakaoKeywordDocument[] }>(
          "/search/keyword.json",
          {
            query,
            x: String(lng),
            y: String(lat),
            radius: String(radiusM),
            size: "1",
            sort: "distance",
          }
        );

        const doc = data.documents[0];
        if (!doc) return;

        results.push({
          name: doc.place_name,
          category,
          distanceM: parseInt(doc.distance, 10) || 0,
          type,
        });
      } catch {
        // 개별 POI 검색 실패는 무시
      }
    })
  );

  return results.sort((a, b) => a.distanceM - b.distanceM);
}
