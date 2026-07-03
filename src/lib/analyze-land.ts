import { geocodeAddress, searchNearbyPOI } from "@/lib/apis/kakao";
import { generateLandSummary } from "@/lib/apis/openrouter";
import { fetchNgiiElevations } from "@/lib/apis/ngii";
import {
  calcSlopeFromElevations,
  fetchCadastral,
  fetchElevations,
  samplePointsAround,
  slopeGrade,
  vworldGeocode,
} from "@/lib/apis/vworld";
import { analyzeLand as mockAnalyzeLand } from "@/lib/mock-analysis";
import type { LandAnalysis, POIItem } from "@/lib/types";

function defaultSummary(feasibility: LandAnalysis["developmentFeasibility"]): string {
  const map: Record<LandAnalysis["developmentFeasibility"], string> = {
    high: "경사도와 입지 조건이 양호하여 소규모 건축 시행에 적합한 토지로 분석됩니다.",
    medium: "일부 조건 보완이 필요하나, 적절한 설계로 개발 가능성이 있습니다.",
    low: "경사도 또는 입지 제약으로 추가 검토 및 토목 비용 산정이 필요합니다.",
  };
  return map[feasibility];
}

function calcFeasibility(score: number): LandAnalysis["developmentFeasibility"] {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function calcOverallScore(
  slope: LandAnalysis["slope"],
  poi: POIItem[],
  hasCadastral: boolean
): number {
  let score = slope.buildable ? 35 : 10;
  score += Math.max(0, 25 - slope.average);
  score += hasCadastral ? 15 : 5;

  const negativePoi = poi.filter((p) => p.type === "negative" && p.distanceM < 1000).length;
  const positivePoi = poi.filter((p) => p.type === "positive" && p.distanceM < 2000).length;
  score += positivePoi * 5 - negativePoi * 8;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export async function analyzeLandLive(address: string): Promise<LandAnalysis> {
  let dataSource: LandAnalysis["dataSource"] = "live";
  let lat = 0;
  let lng = 0;
  let resolvedAddress = address;

  const kakaoCoord = await geocodeAddress(address).catch(() => null);
  if (kakaoCoord) {
    lat = kakaoCoord.lat;
    lng = kakaoCoord.lng;
    resolvedAddress = kakaoCoord.addressName;
  } else {
    const vworldCoord = await vworldGeocode(address).catch(() => null);
    if (vworldCoord) {
      lat = vworldCoord.lat;
      lng = vworldCoord.lng;
    } else {
      return { ...mockAnalyzeLand(address), dataSource: "mock" };
    }
    dataSource = "partial";
  }

  const samplePoints = samplePointsAround(lng, lat);
  let elevations = await fetchElevations(samplePoints).catch(() => [] as number[]);

  if (elevations.length === 0 || elevations.every((e) => e === 0)) {
    elevations = await fetchNgiiElevations(samplePoints).catch(() => []);
    dataSource = "partial";
  }

  const slopeData =
    elevations.length >= 2
      ? calcSlopeFromElevations(elevations)
      : { average: 0, max: 0 };

  const grade = slopeGrade(slopeData.average);
  const buildable = slopeData.average < 25;

  const cadastral = await fetchCadastral(lng, lat).catch(() => null);
  if (!cadastral) dataSource = "partial";

  const poiResults = await searchNearbyPOI(lat, lng).catch(() => []);
  const poi: POIItem[] =
    poiResults.length > 0
      ? poiResults.map((p) => ({
          name: p.name,
          category: p.category,
          distanceM: p.distanceM,
          type: p.type,
        }))
      : mockAnalyzeLand(address).poi;

  const slope = {
    average: slopeData.average,
    max: slopeData.max,
    grade,
    buildable,
  };

  const overallScore = calcOverallScore(slope, poi, !!cadastral);
  const developmentFeasibility = calcFeasibility(overallScore);

  const baseAnalysis: LandAnalysis = {
    address: resolvedAddress,
    coordinates: { lat, lng },
    area: cadastral?.area ? Math.round(cadastral.area) : 0,
    landCategory: cadastral?.jimok ?? "미확인",
    slope,
    access: {
      roadAdjacent: false,
      roadWidthM: 0,
      truckAccessible: false,
      nearestHighwayKm: 0,
      entryScore: Math.round(overallScore * 0.4),
    },
    poi,
    overallScore,
    developmentFeasibility,
    summary: defaultSummary(developmentFeasibility),
    dataSource,
  };

  try {
    const ai = await generateLandSummary({
      address: baseAnalysis.address,
      coordinates: baseAnalysis.coordinates,
      slope: baseAnalysis.slope,
      landCategory: baseAnalysis.landCategory,
      area: baseAnalysis.area,
      poi: baseAnalysis.poi,
      overallScore: baseAnalysis.overallScore,
      developmentFeasibility: baseAnalysis.developmentFeasibility,
    });
    baseAnalysis.summary = ai.content;
    baseAnalysis.aiModel = ai.model;
  } catch {
    // AI 실패 시 기본 요약 유지
  }

  return baseAnalysis;
}
