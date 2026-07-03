"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import MapPanel from "@/components/MapPanel";
import AnalysisPanel from "@/components/AnalysisPanel";
import AddressSearch from "@/components/AddressSearch";
import type { LandAnalysis } from "@/lib/types";

async function fetchAnalysis(address: string): Promise<LandAnalysis> {
  const res = await fetch(`/api/analyze?address=${encodeURIComponent(address.trim())}`);
  if (!res.ok) throw new Error("분석 API 오류");
  return res.json();
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialAddress = searchParams.get("address") ?? "";

  const [address, setAddress] = useState(initialAddress);
  const [analysis, setAnalysis] = useState<LandAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = useCallback(async (addr: string) => {
    if (!addr.trim()) return;
    setLoading(true);
    try {
      const result = await fetchAnalysis(addr.trim());
      setAnalysis(result);
      router.replace(`/analyze?address=${encodeURIComponent(addr.trim())}`, {
        scroll: false,
      });
    } catch {
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!initialAddress.trim()) return;
    setAddress(initialAddress);
    setLoading(true);
    fetchAnalysis(initialAddress.trim())
      .then(setAnalysis)
      .catch(() => setAnalysis(null))
      .finally(() => setLoading(false));
  }, [initialAddress]);

  const handleDownload = () => {
    alert(
      "PDF 심층 리포트 (₩33,000/건)\n\n결제 연동 후 다운로드 가능합니다.\nPro 구독 시 월 3건 포함."
    );
  };

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted transition hover:bg-slate-100 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            대시보드
          </Link>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <AddressSearch
            value={address}
            onChange={setAddress}
            onSearch={() => runAnalysis(address)}
            loading={loading}
          />
        </div>

        {loading && (
          <div className="flex flex-1 items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted">
                DEM·지적도·POI 데이터 분석 중...
              </p>
            </div>
          </div>
        )}

        {!loading && analysis && (
          <div className="grid min-h-[calc(100vh-220px)] flex-1 gap-4 lg:grid-cols-2 animate-fade-in">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <MapPanel
                address={analysis.address}
                slopeGrade={analysis.slope.grade}
                coordinates={analysis.coordinates}
              />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <AnalysisPanel
                analysis={analysis}
                onDownloadReport={handleDownload}
              />
            </div>
          </div>
        )}

        {!loading && !analysis && (
          <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
            <p className="text-lg font-medium text-foreground">토지 주소를 입력하세요</p>
            <p className="mt-2 max-w-md text-sm text-muted">
              지번 또는 도로명 주소를 검색하면 3D 지형, 경사도, 진입로, POI 분석 결과를
              확인할 수 있습니다.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
