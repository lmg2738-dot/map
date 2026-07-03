"use client";

import { Search, Loader2 } from "lucide-react";
import { SAMPLE_ADDRESSES } from "@/lib/constants";

interface AddressSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export default function AddressSearch({
  value,
  onChange,
  onSearch,
  loading,
}: AddressSearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch();
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="지번 또는 도로명 주소를 입력하세요"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none ring-primary/20 transition focus:border-primary focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              분석 중
            </>
          ) : (
            "분석"
          )}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted">샘플:</span>
        {SAMPLE_ADDRESSES.map((addr) => (
          <button
            key={addr}
            type="button"
            onClick={() => {
              onChange(addr);
            }}
            className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted transition hover:border-primary/30 hover:text-primary"
          >
            {addr.split(" ").slice(-2).join(" ")}
          </button>
        ))}
      </div>
    </div>
  );
}
