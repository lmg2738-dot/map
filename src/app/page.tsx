import Link from "next/link";
import {
  Mountain,
  Layers,
  Truck,
  MapPin,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import PricingSection from "@/components/PricingSection";

const features = [
  {
    icon: Layers,
    title: "3D 입체 지형 · 경사도",
    desc: "국토정보플랫폼 DEM과 브이월드 3D 지도를 융합하여 건축 허가 핵심 기준인 경사도를 시각화합니다.",
  },
  {
    icon: Truck,
    title: "진입로 · 물류 경로",
    desc: "T맵 기반 대형 차량 진입 경로 분석으로 공사 차량 접근 가능 여부를 사전에 확인합니다.",
  },
  {
    icon: MapPin,
    title: "입지 · POI 분석",
    desc: "전기·용수 시설, 편의시설, 혐오시설까지 주변 인프라를 거리 기반으로 스코어링합니다.",
  },
  {
    icon: Shield,
    title: "사기 예방 리포트",
    desc: "지적도 경계와 3D 지형을 한 화면에서 확인하여 기획 부동산 사기를 예방합니다.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 to-background py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-3.5 w-3.5" />
              Proptech SaaS · 토지 매입부터 개발 시뮬레이션까지
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              LandScout
              <span className="block text-2xl font-semibold text-primary sm:text-3xl">
                랜드스카우트
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              국토정보플랫폼 DEM·정사영상과 브이월드 3D 지도를 융합하여,
              토지의 경사도·도로 조건·주변 인프라를 3D로 시뮬레이션하고
              개발 타당성 보고서를 자동 생성합니다.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark"
              >
                무료로 분석 시작
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#pricing"
                className="rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-medium transition hover:bg-slate-50"
              >
                요금제 보기
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted">월 3회 무료 · 카드 등록 불필요</p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold">핵심 기능</h2>
            <p className="mt-2 text-center text-muted">
              시행사, 건축사, 임야 투자자를 위한 올인원 토지 분석
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-surface p-6 transition hover:border-primary/20 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-slate-50 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <Mountain className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-bold">
              여러 사이트를 돌아다닐 필요 없습니다
            </h2>
            <p className="mt-3 text-muted">
              3D 지형, 정사영상, 도로망, POI를 LandScout 하나에서 확인하세요.
              Cursor로 빠르게 구현한 차세대 토지 분석 플랫폼입니다.
            </p>
          </div>
        </section>

        <PricingSection />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        © 2026 LandScout. Proptech SaaS Demo.
      </footer>
    </>
  );
}
