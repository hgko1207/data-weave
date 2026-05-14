"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { LAWD_BY_SIDO, getSigunguListWithCode } from "@/widgets/apartment/lawd-codes";
import { formatYm, nextMonth, previousMonth } from "@/widgets/apartment/fetch";

const SIDOS = Object.keys(LAWD_BY_SIDO);

export type ApartmentFilterValues = {
  sido: string;
  sigungu: string;
  lawdCd: string;
  dealYm: string;
};

export function ApartmentFilters({ current }: { current: ApartmentFilterValues }) {
  const router = useRouter();
  const [sido, setSido] = useState(current.sido);
  const [sigungu, setSigungu] = useState(current.sigungu);

  const sigunguOptions = useMemo(() => getSigunguListWithCode(sido), [sido]);

  const buildHref = (overrides: Partial<ApartmentFilterValues>) => {
    const params = new URLSearchParams({
      sido: overrides.sido ?? current.sido,
      sigungu: overrides.sigungu ?? current.sigungu,
      lawdCd: overrides.lawdCd ?? current.lawdCd,
      dealYm: overrides.dealYm ?? current.dealYm,
    });
    return `/w/apartment?${params.toString()}`;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const match = sigunguOptions.find((o) => o.name === sigungu);
    if (!match) return;
    router.push(
      buildHref({
        sido,
        sigungu: match.name,
        lawdCd: match.code,
      }),
    );
  };

  const onSidoChange = (next: string) => {
    setSido(next);
    const first = getSigunguListWithCode(next)[0];
    if (first) setSigungu(first.name);
  };

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-5">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        검색 조건
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
      >
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

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <Search className="h-4 w-4" aria-hidden />
          검색
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
        <Link
          href={buildHref({ dealYm: previousMonth(current.dealYm) })}
          aria-label="이전 달"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
        <p className="font-mono text-sm font-medium text-zinc-100">
          {formatYm(current.dealYm)}
        </p>
        <Link
          href={buildHref({ dealYm: nextMonth(current.dealYm) })}
          aria-label="다음 달"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
