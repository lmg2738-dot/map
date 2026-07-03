"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  Crown,
  ArrowRight,
  History,
} from "lucide-react";
import Header from "@/components/Header";
import AddressSearch from "@/components/AddressSearch";
import { PRICING } from "@/lib/constants";

const recentReports = [
  { address: "경기도 양평군 용문면 신원리 123", score: 78, date: "2026-07-01" },
  { address: "강원특별자치도 춘천시 남산면 방하리 45-2", score: 62, date: "2026-06-28" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const reportsUsed = 1;
  const reportsLimit = PRICING.free.reportsPerMonth;

  const handleSearch = () => {
    if (!address.trim()) return;
    setLoading(true);
    setTimeout(() => {
      router.push(`/analyze?address=${encodeURIComponent(address.trim())}`);
    }, 600);
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
          <p className="mt-1 text-muted">분석할 토지 주소를 입력하세요</p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <AddressSearch
            value={address}
            onChange={setAddress}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-muted">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">이번 달 분석</span>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {reportsUsed}
              <span className="text-base font-normal text-muted"> / {reportsLimit}회</span>
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(reportsUsed / reportsLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-muted">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-medium">PDF 리포트</span>
            </div>
            <p className="mt-2 text-2xl font-bold">0건</p>
            <p className="mt-1 text-xs text-muted">건당 ₩33,000</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 text-amber-700">
              <Crown className="h-4 w-4" />
              <span className="text-xs font-medium">현재 플랜</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-900">Free</p>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline"
            >
              Pro 업그레이드
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted" />
            <h2 className="text-sm font-semibold">최근 분석</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {recentReports.map((report) => (
              <li key={report.address}>
                <Link
                  href={`/analyze?address=${encodeURIComponent(report.address)}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-primary/30"
                >
                  <div>
                    <p className="text-sm font-medium">{report.address}</p>
                    <p className="text-xs text-muted">{report.date}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {report.score}점
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
