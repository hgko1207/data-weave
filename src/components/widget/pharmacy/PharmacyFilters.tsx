"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getSigunguList } from "@/widgets/pharmacy/sigungu-list";

const SIDOS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

const RADIUS_OPTIONS = [3, 5, 10, 20] as const;
const KIND_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "pharmacy", label: "약국" },
  { value: "er", label: "응급실" },
] as const;

export type PharmacyFilterValues = {
  sido: string;
  sigungu: string;
  radius: number;
  kind: "all" | "pharmacy" | "er";
};

export function PharmacyFilters({ current }: { current: PharmacyFilterValues }) {
  const router = useRouter();
  const [sido, setSido] = useState(current.sido);
  const [sigungu, setSigungu] = useState(current.sigungu);

  const sigunguOptions = useMemo(() => getSigunguList(sido), [sido]);

  const buildHref = (overrides: Partial<PharmacyFilterValues>) => {
    const params = new URLSearchParams({
      sido: overrides.sido ?? current.sido,
      sigungu: overrides.sigungu ?? current.sigungu,
      radius: String(overrides.radius ?? current.radius),
      kind: overrides.kind ?? current.kind,
    });
    return `/w/pharmacy?${params.toString()}`;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams({
      sido,
      sigungu,
      radius: String(current.radius),
      kind: current.kind,
    });
    router.push(`/w/pharmacy?${params.toString()}`);
  };

  const onSidoChange = (value: string) => {
    setSido(value);
    // 새 시·도로 바꾸면 시·군·구는 '전체'(빈 값)로 리셋
    setSigungu("");
  };

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-5">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        검색 조건
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
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
            disabled={sigunguOptions.length === 0}
            className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:text-zinc-500"
          >
            <option value="" className="bg-zinc-900">
              {sigunguOptions.length === 0 ? "해당 없음" : "전체"}
            </option>
            {sigunguOptions.map((sg) => (
              <option key={sg} value={sg} className="bg-zinc-900">
                {sg}
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

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <ChipGroup
          label="반경"
          options={RADIUS_OPTIONS.map((r) => ({
            value: String(r),
            label: `${r}km`,
            active: r === current.radius,
            href: buildHref({ radius: r }),
          }))}
        />
        <ChipGroup
          label="종류"
          options={KIND_OPTIONS.map((k) => ({
            value: k.value,
            label: k.label,
            active: k.value === current.kind,
            href: buildHref({ kind: k.value }),
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
      <div className="flex gap-1.5">
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
