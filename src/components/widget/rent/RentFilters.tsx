"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  LAWD_BY_SIDO,
  getSigunguListWithCode,
} from "@/widgets/apartment/lawd-codes";
import { formatYm, nextMonth, previousMonth } from "@/widgets/apartment/fetch";

const SIDOS = Object.keys(LAWD_BY_SIDO);

export type RentTypeFilter = "all" | "jeonse" | "monthly";
export type RentSort =
  | "date-desc"
  | "deposit-desc"
  | "deposit-asc"
  | "rent-desc"
  | "area-desc";

const TYPE_OPTIONS: Array<{ value: RentTypeFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "jeonse", label: "전세" },
  { value: "monthly", label: "월세" },
];

const SORT_OPTIONS: Array<{ value: RentSort; label: string }> = [
  { value: "date-desc", label: "최신순" },
  { value: "deposit-desc", label: "보증금↓" },
  { value: "deposit-asc", label: "보증금↑" },
  { value: "rent-desc", label: "월세↓" },
  { value: "area-desc", label: "면적↓" },
];

export type RentFilterValues = {
  sido: string;
  sigungu: string;
  lawdCd: string;
  dealYm: string;
  type: RentTypeFilter;
  sort: RentSort;
};

export function RentFilters({ current }: { current: RentFilterValues }) {
  const router = useRouter();
  const [sido, setSido] = useState(current.sido);
  const [sigungu, setSigungu] = useState(current.sigungu);

  const sigunguOptions = useMemo(() => getSigunguListWithCode(sido), [sido]);

  const buildHref = (overrides: Partial<RentFilterValues>) => {
    const params = new URLSearchParams({
      sido: overrides.sido ?? current.sido,
      sigungu: overrides.sigungu ?? current.sigungu,
      lawdCd: overrides.lawdCd ?? current.lawdCd,
      dealYm: overrides.dealYm ?? current.dealYm,
    });
    const type = overrides.type ?? current.type;
    if (type !== "all") params.set("type", type);
    const sort = overrides.sort ?? current.sort;
    if (sort !== "date-desc") params.set("sort", sort);
    return `/w/rent?${params.toString()}`;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const match = sigunguOptions.find((o) => o.name === sigungu);
    if (!match) return;
    router.push(buildHref({ sido, sigungu: match.name, lawdCd: match.code }));
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

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        {/* row 1: 시·도 + 시·군·구 + 기간 stepper — 3등분 (매매와 통일) */}
        <div className="grid gap-3 md:grid-cols-3">
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

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-400">기간</span>
            <div className="flex h-10 items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-2">
              <Link
                href={buildHref({ dealYm: previousMonth(current.dealYm) })}
                aria-label="이전 달"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Link>
              <p className="font-mono text-sm font-medium text-zinc-100">
                {formatYm(current.dealYm)}
              </p>
              <Link
                href={buildHref({ dealYm: nextMonth(current.dealYm) })}
                aria-label="다음 달"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        {/* row 2: 검색 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <Search className="h-4 w-4" aria-hidden />
            검색
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-3">
        <ChipGroup
          label="종류"
          options={TYPE_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
            active: o.value === current.type,
            href: buildHref({ type: o.value }),
          }))}
        />
        <ChipGroup
          label="정렬"
          options={SORT_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
            active: o.value === current.sort,
            href: buildHref({ sort: o.value }),
          }))}
        />
      </div>
    </section>
  );
}

function ChipGroup({
  label,
  options,
}: {
  label: string;
  options: Array<{ value: string; label: string; active: boolean; href: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Link
            key={o.value}
            href={o.href}
            aria-current={o.active ? "page" : undefined}
            className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
              o.active
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
