"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function LoginPage() {
  const router = useRouter();

  const handleSocialLogin = (provider: string) => {
    alert(`${provider} 소셜 로그인은 OAuth 연동 후 사용 가능합니다.\n데모로 대시보드로 이동합니다.`);
    router.push("/dashboard");
  };

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="text-center text-2xl font-bold">로그인</h1>
          <p className="mt-2 text-center text-sm text-muted">
            LandScout에 오신 것을 환영합니다
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("카카오")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 text-sm font-medium text-[#191919] transition hover:bg-[#F5DC00]"
            >
              카카오로 시작하기
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("네이버")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#03C75A] py-3 text-sm font-medium text-white transition hover:bg-[#02B350]"
            >
              네이버로 시작하기
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            로그인 시{" "}
            <Link href="#" className="underline">
              이용약관
            </Link>
            과{" "}
            <Link href="#" className="underline">
              개인정보처리방침
            </Link>
            에 동의합니다.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          계정 없이{" "}
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            무료 체험하기
          </Link>
        </p>
      </main>
    </>
  );
}
