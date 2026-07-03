import { Check } from "lucide-react";
import Link from "next/link";
import { PRICING } from "@/lib/constants";

export default function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border bg-surface py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">수익 모델</h2>
          <p className="mt-2 text-muted">
            Freemium으로 시작하고, Pro 구독과 PDF 리포트로 확장하세요
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground">{PRICING.free.name}</h3>
            <p className="mt-2">
              <span className="text-3xl font-bold">₩0</span>
              <span className="text-muted"> /월</span>
            </p>
            <ul className="mt-6 space-y-3">
              {PRICING.free.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-6 block w-full rounded-xl border border-border py-2.5 text-center text-sm font-medium transition hover:bg-slate-50"
            >
              무료 시작
            </Link>
          </div>

          <div className="relative rounded-2xl border-2 border-primary bg-primary/5 p-6 shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
              추천
            </span>
            <h3 className="font-semibold text-foreground">{PRICING.pro.name}</h3>
            <p className="mt-2">
              <span className="text-3xl font-bold">₩{PRICING.pro.price.toLocaleString()}</span>
              <span className="text-muted"> /월</span>
            </p>
            <ul className="mt-6 space-y-3">
              {PRICING.pro.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              Pro 시작하기
            </Link>
          </div>

          <div className="rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground">{PRICING.pdfReport.label}</h3>
            <p className="mt-2">
              <span className="text-3xl font-bold">₩{PRICING.pdfReport.price.toLocaleString()}</span>
              <span className="text-muted"> /건</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                공인중개사·시행사용 정식 보고서
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                경사도·진입로·POI 종합 분석
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                3D 지형 스크린샷 포함
              </li>
            </ul>
            <Link
              href="/analyze"
              className="mt-6 block w-full rounded-xl border border-border py-2.5 text-center text-sm font-medium transition hover:bg-slate-50"
            >
              분석 후 다운로드
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
