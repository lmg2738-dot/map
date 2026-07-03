"use client";

import dynamic from "next/dynamic";
import { Layers, Map } from "lucide-react";
import { useState } from "react";

const Terrain3D = dynamic(() => import("./Terrain3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl bg-slate-100 text-sm text-muted">
      3D 지형 로딩 중...
    </div>
  ),
});

interface MapPanelProps {
  address: string;
  slopeGrade: string;
  coordinates: { lat: number; lng: number };
}

export default function MapPanel({
  address,
  slopeGrade,
  coordinates,
}: MapPanelProps) {
  const [viewMode, setViewMode] = useState<"3d" | "cadastral">("3d");

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">지적도 · 3D 지형</h2>
        <div className="flex rounded-lg border border-border bg-surface p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "3d"
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Layers className="h-3 w-3" />
            3D DEM
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cadastral")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "cadastral"
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Map className="h-3 w-3" />
            지적도
          </button>
        </div>
      </div>

      <div className="flex-1">
        {viewMode === "3d" ? (
          <Terrain3D address={address} slopeGrade={slopeGrade} />
        ) : (
          <div className="relative flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-emerald-50 to-sky-50">
            <div className="absolute inset-4 rounded-lg border-2 border-sky-500/60 bg-sky-500/5" />
            <Map className="mb-2 h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-foreground">지적편집도 경계</p>
            <p className="mt-1 max-w-xs text-center text-xs text-muted">
              {address}
            </p>
            <p className="mt-3 font-mono text-xs text-muted">
              {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
            </p>
            <p className="mt-4 text-xs text-muted">
              카카오/네이버 지적도 API 연동 시 실제 경계 표시
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
