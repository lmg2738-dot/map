"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Mountain } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/analyze", label: "토지 분석" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Mountain className="h-4 w-4" />
          </span>
          LandScout
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-slate-100 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
          >
            로그인
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <MapPin className="h-3.5 w-3.5" />
            분석 시작
          </Link>
        </div>
      </div>
    </header>
  );
}
