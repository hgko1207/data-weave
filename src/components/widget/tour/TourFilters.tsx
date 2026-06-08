"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mountain, Palette, PartyPopper, Tent, ShoppingBag, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LAWD_BY_SIDO, getSigunguListWithCode } from "@/widgets/apartment/lawd-codes";
import type { TourCategory } from "@/widgets/tour/schema";

const SIDOS = Object.keys(LAWD_BY_SIDO);

export type TourFilterValues = {
  sido: string;
  sigungu: string;
  category: TourCategory;
};

const CATEGORIES: Array<{ value: TourCategory; label: string; icon: LucideIcon }> = [
  { value: "all", label: "전체", icon: Sparkles },
  { value: "nature", label: "자연", icon: Mountain },
  { value: "culture", label: "문화·역사", icon: Palette },
  { value: "festival", label: "축제·공연", icon: PartyPopper },
  { value: "leisure", label: "레저·체험", icon: Tent },
  { value: "shopping", label: "쇼핑·시장", icon: ShoppingBag },
];

export function TourFilters({ current }: { current: TourFilterValues }) {
  const router = useRouter();
  const [sido, setSido] = useState(current.sido);
  const [sigungu, setSigungu] = useState(current.sigungu);

  const sigunguOptions = useMemo(() => getSigunguListWithCode(sido), [sido]);

  const buildHref = (overrides: Partial<TourFilterValues>) => {
    const nextSido = overrides.sido ?? current.sido;
    const nextSigungu = overrides.sigungu ?? current.sigungu;
    const params = new URLSearchParams({ sido: nextSido });
    if (nextSigungu) params.set("sigungu", nextSigungu); // 빈 값 = 시·도 전체
    const cat = overrides.category ?? current.category;
    if (cat !== "all") params.set("category", cat);
    return `/w/tour?${params.toString()}`;
  };

  // 시·도 바꾸면 시·군·구는 '전체'로 리셋.
  const onSidoChange = (next: string) => {
    setSido(next);
    setSigungu("");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sigungu && !sigunguOptions.find((o) => o.name === sigungu)) return;
    router.push(buildHref({ sido, sigungu }));
  };

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-5">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        검색 조건
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
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
            <option value="" className="bg-zinc-900">
              전체
            </option>
            {sigunguOptions.map((sg) => (
              <option key={sg.code} value={sg.name} className="bg-zinc-900">
                {sg.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          검색
        </button>
      </form>

      {/* 카테고리 chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-400">카테고리</span>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const active = c.value === current.category;
            const Icon = c.icon;
            return (
              <Link
                key={c.value}
                href={buildHref({ category: c.value })}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {c.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
