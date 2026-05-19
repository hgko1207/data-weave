"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, MapPin, Search } from "lucide-react";
import { LAWD_BY_SIDO, getSigunguListWithCode } from "@/widgets/apartment/lawd-codes";

const SIDOS = Object.keys(LAWD_BY_SIDO);

export type LibraryMode = "location" | "book";

export type LibraryFilterValues = {
  sido: string;
  sigungu: string;
  mode: LibraryMode;
  q: string;
};

const MODE_OPTIONS: Array<{ value: LibraryMode; label: string; icon: typeof MapPin }> = [
  { value: "location", label: "도서관 위치", icon: MapPin },
  { value: "book", label: "도서명 검색", icon: BookOpen },
];

export function LibraryFilters({ current }: { current: LibraryFilterValues }) {
  const router = useRouter();
  const [sido, setSido] = useState(current.sido);
  const [sigungu, setSigungu] = useState(current.sigungu);
  const [query, setQuery] = useState(current.q);

  const sigunguOptions = useMemo(() => getSigunguListWithCode(sido), [sido]);

  const buildHref = (overrides: Partial<LibraryFilterValues>) => {
    const params = new URLSearchParams({
      sido: overrides.sido ?? current.sido,
      sigungu: overrides.sigungu ?? current.sigungu,
    });
    const mode = overrides.mode ?? current.mode;
    if (mode !== "location") params.set("mode", mode);
    const q = overrides.q ?? current.q;
    if (q) params.set("q", q);
    return `/w/library?${params.toString()}`;
  };

  const onSidoChange = (next: string) => {
    setSido(next);
    const first = getSigunguListWithCode(next)[0];
    if (first) setSigungu(first.name);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const match = sigunguOptions.find((o) => o.name === sigungu);
    if (!match) return;
    router.push(
      buildHref({ sido, sigungu: match.name, q: query.trim() }),
    );
  };

  const placeholder =
    current.mode === "book"
      ? "도서 제목 입력 (예: 채식주의자, 작별인사)"
      : "도서관명·동 검색 (선택)";

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-5">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        검색 조건
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        {/* row 1: 시·도 + 시·군·구 — 2분할 */}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-400">시·도</span>
            <select
              value={sido}
              onChange={(e) => onSidoChange(e.target.value)}
              className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              {SIDOS.map((s) => (
                <option key={s} value={s} className="bg-zinc-900">
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-400">시·군·구</span>
            <select
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
              className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              {sigunguOptions.map((sg) => (
                <option key={sg.code} value={sg.name} className="bg-zinc-900">
                  {sg.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* row 2: 키워드 input + 검색 버튼 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <Search className="h-4 w-4" aria-hidden />
            검색
          </button>
        </div>
      </form>

      {/* mode chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">검색 방식</span>
        <div className="flex flex-wrap gap-1.5">
          {MODE_OPTIONS.map((o) => {
            const active = o.value === current.mode;
            const Icon = o.icon;
            return (
              <Link
                key={o.value}
                href={buildHref({ mode: o.value })}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {o.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
