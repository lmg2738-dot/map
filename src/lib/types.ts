export type PlanType = "free" | "pro";

export interface POIItem {
  name: string;
  category: string;
  distanceM: number;
  type: "positive" | "neutral" | "negative";
}

export interface LandAnalysis {
  address: string;
  coordinates: { lat: number; lng: number };
  area: number;
  landCategory: string;
  slope: {
    average: number;
    max: number;
    grade: "flat" | "gentle" | "moderate" | "steep";
    buildable: boolean;
  };
  access: {
    roadAdjacent: boolean;
    roadWidthM: number;
    truckAccessible: boolean;
    nearestHighwayKm: number;
    entryScore: number;
  };
  poi: POIItem[];
  overallScore: number;
  developmentFeasibility: "high" | "medium" | "low";
  summary: string;
  aiModel?: string;
  dataSource: "live" | "partial" | "mock";
}

export interface UserSession {
  name: string;
  email: string;
  plan: PlanType;
  reportsUsedThisMonth: number;
  reportsLimit: number;
}
