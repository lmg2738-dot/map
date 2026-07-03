"use client";

import {
  TrendingUp,
  Truck,
  MapPin,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { LandAnalysis } from "@/lib/types";
import { PRICING } from "@/lib/constants";

interface AnalysisPanelProps {
  analysis: LandAnalysis;
  onDownloadReport?: () => void;
  canDownload?: boolean;
}

const gradeLabels: Record<LandAnalysis["slope"]["grade"], string> = {
  flat: "평지",
  gentle: "완경사",
  moderate: "중경사",
  steep: "급경사",
};

const feasibilityConfig = {
  high: { label: "개발 적합", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 },
  medium: { label: "조건부 적합", color: "text-amber-600 bg-amber-50", icon: AlertTriangle },
  low: { label: "추가 검토 필요", color: "text-red-600 bg-red-50", icon: XCircle },
};

function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalysisPanel({
  analysis,
  onDownloadReport,
  canDownload = true,
}: AnalysisPanelProps) {
  const FeasIcon = feasibilityConfig[analysis.developmentFeasibility].icon;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">토지 분석 결과</h2>
          <p className="mt-1 text-xs text-muted line-clamp-2">{analysis.address}</p>
        </div>
        <div
          className="score-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{ "--score": analysis.overallScore } as React.CSSProperties}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-sm font-bold text-primary">
            {analysis.overallScore}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${feasibilityConfig[analysis.developmentFeasibility].color}`}
      >
        <FeasIcon className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">
          {feasibilityConfig[analysis.developmentFeasibility].label}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-muted">{analysis.summary}</p>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-muted">면적</p>
          <p className="mt-1 text-lg font-semibold">{analysis.area.toLocaleString()}㎡</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-muted">지목</p>
          <p className="mt-1 text-lg font-semibold">{analysis.landCategory}</p>
        </div>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">경사도 분석 (DEM)</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted">평균 경사</span>
            <p className="font-semibold">{analysis.slope.average}°</p>
          </div>
          <div>
            <span className="text-muted">최대 경사</span>
            <p className="font-semibold">{analysis.slope.max}°</p>
          </div>
          <div>
            <span className="text-muted">등급</span>
            <p className="font-semibold">{gradeLabels[analysis.slope.grade]}</p>
          </div>
          <div>
            <span className="text-muted">건축 가능</span>
            <p className={`font-semibold ${analysis.slope.buildable ? "text-emerald-600" : "text-red-600"}`}>
              {analysis.slope.buildable ? "가능" : "제한"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">진입로 · 물류 경로</h3>
        </div>
        <ScoreBar label="진입로 점수" score={analysis.access.entryScore} />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <span className="text-muted">도로 접면</span>
            <p className="font-medium">{analysis.access.roadAdjacent ? "있음" : "없음"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <span className="text-muted">도로 폭</span>
            <p className="font-medium">{analysis.access.roadWidthM}m</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <span className="text-muted">화물차 진입</span>
            <p className="font-medium">{analysis.access.truckAccessible ? "가능" : "불가"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <span className="text-muted">고속도로</span>
            <p className="font-medium">{analysis.access.nearestHighwayKm}km</p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">주변 POI</h3>
        </div>
        <ul className="space-y-2">
          {analysis.poi.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    item.type === "positive"
                      ? "bg-emerald-500"
                      : item.type === "negative"
                        ? "bg-red-400"
                        : "bg-slate-400"
                  }`}
                />
                <span className="font-medium">{item.name}</span>
                <span className="text-muted">{item.category}</span>
              </div>
              <span className="text-muted">{item.distanceM.toLocaleString()}m</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-auto space-y-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onDownloadReport}
          disabled={!canDownload}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <FileDown className="h-4 w-4" />
          PDF 심층 리포트 다운로드
        </button>
        <p className="text-center text-xs text-muted">
          건당 {PRICING.pdfReport.price.toLocaleString()}원 · Pro 구독 시 월 3건 포함
        </p>
      </div>
    </div>
  );
}
