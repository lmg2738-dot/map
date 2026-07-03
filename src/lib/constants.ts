export const PRICING = {
  free: {
    name: "Free",
    price: 0,
    reportsPerMonth: 3,
    features: ["월 3회 토지 분석", "기본 경사도 분석", "POI 요약"],
  },
  pro: {
    name: "Pro",
    price: 99000,
    reportsPerMonth: Infinity,
    features: [
      "무제한 3D 시뮬레이션",
      "경사도·T맵 진입로 분석",
      "정사영상 오버레이",
      "우선 지원",
    ],
  },
  pdfReport: {
    price: 33000,
    label: "PDF 심층 리포트",
  },
} as const;

export const SAMPLE_ADDRESSES = [
  "경기도 양평군 용문면 신원리 123",
  "강원특별자치도 춘천시 남산면 방하리 45-2",
  "경상북도 포항시 북구 흥해읍 대임리 78",
  "제주특별자치도 제주시 애월읍 고성리 56",
];
