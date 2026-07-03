import type { LandAnalysis } from "./types";

function hashAddress(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return min + r * (max - min);
}

export function analyzeLand(address: string): LandAnalysis {
  const seed = hashAddress(address);
  const avgSlope = seededRandom(seed, 3, 28);
  const maxSlope = avgSlope + seededRandom(seed + 1, 2, 12);
  const roadWidth = seededRandom(seed + 2, 3, 8);
  const roadAdjacent = roadWidth >= 4;
  const truckAccessible = roadWidth >= 5.5;
  const entryScore = Math.round(
    (roadAdjacent ? 40 : 10) +
      (truckAccessible ? 35 : 5) +
      seededRandom(seed + 3, 10, 25)
  );

  let grade: LandAnalysis["slope"]["grade"];
  if (avgSlope < 8) grade = "flat";
  else if (avgSlope < 15) grade = "gentle";
  else if (avgSlope < 22) grade = "moderate";
  else grade = "steep";

  const buildable = avgSlope < 25;
  const overallScore = Math.round(
    (buildable ? 30 : 10) +
      entryScore * 0.4 +
      seededRandom(seed + 4, 15, 30)
  );

  let feasibility: LandAnalysis["developmentFeasibility"];
  if (overallScore >= 75) feasibility = "high";
  else if (overallScore >= 50) feasibility = "medium";
  else feasibility = "low";

  const poiTemplates = [
    { name: "변전소", category: "전기", type: "positive" as const, dist: seededRandom(seed + 10, 200, 1200) },
    { name: "상수도 취수장", category: "용수", type: "positive" as const, dist: seededRandom(seed + 11, 500, 2500) },
    { name: "편의점", category: "편의시설", type: "neutral" as const, dist: seededRandom(seed + 12, 300, 1500) },
    { name: "쓰레기 매립장", category: "혐오시설", type: "negative" as const, dist: seededRandom(seed + 13, 2000, 8000) },
    { name: "초등학교", category: "교육", type: "positive" as const, dist: seededRandom(seed + 14, 400, 2000) },
    { name: "공장", category: "산업", type: "negative" as const, dist: seededRandom(seed + 15, 800, 3000) },
  ];

  const summaries: Record<LandAnalysis["developmentFeasibility"], string> = {
    high: "경사도와 도로 접근성이 양호하여 소규모 건축 시행에 적합한 토지입니다. DEM 기반 3D 분석 결과 개발 타당성이 높습니다.",
    medium: "일부 경사 구간과 진입로 조건 보완이 필요하나, 적절한 설계로 개발 가능성이 있습니다.",
    low: "급경사 구간과 도로 접근성 제약으로 추가 검토가 필요합니다. 토목 공사 비용을 고려해야 합니다.",
  };

  return {
    address,
    coordinates: {
      lat: 37.5 + seededRandom(seed + 20, -0.3, 0.3),
      lng: 127.0 + seededRandom(seed + 21, -0.3, 0.3),
    },
    area: Math.round(seededRandom(seed + 22, 150, 3500)),
    landCategory: seed % 3 === 0 ? "임야" : seed % 3 === 1 ? "대" : "전",
    slope: {
      average: Math.round(avgSlope * 10) / 10,
      max: Math.round(maxSlope * 10) / 10,
      grade,
      buildable,
    },
    access: {
      roadAdjacent,
      roadWidthM: Math.round(roadWidth * 10) / 10,
      truckAccessible,
      nearestHighwayKm: Math.round(seededRandom(seed + 30, 1.5, 15) * 10) / 10,
      entryScore: Math.min(100, entryScore),
    },
    poi: poiTemplates.map((p) => ({
      name: p.name,
      category: p.category,
      distanceM: Math.round(p.dist),
      type: p.type,
    })),
    overallScore: Math.min(100, overallScore),
    developmentFeasibility: feasibility,
    summary: summaries[feasibility],
    dataSource: "mock",
  };
}

export function generateDemHeights(
  size: number,
  seed: number
): Float32Array {
  const heights = new Float32Array(size * size);
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const nz = z / size;
      const h =
        Math.sin(nx * Math.PI * 2 + seed) * 0.3 +
        Math.cos(nz * Math.PI * 3 + seed * 0.5) * 0.25 +
        Math.sin((nx + nz) * Math.PI * 4) * 0.15 +
        seededRandom(seed + x * size + z, 0, 0.1);
      heights[z * size + x] = h;
    }
  }
  return heights;
}
