"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LAWD_BY_SIDO, getSigunguListWithCode } from "@/widgets/apartment/lawd-codes";
import type { EmergencyLevel } from "@/widgets/disaster/schema";

// '전국'은 재난문자 위젯 한정 가상 옵션 — 지역 필터 없이 모든 메시지.
const NATIONWIDE = "전국";
const SIDOS = [NATIONWIDE, ...Object.keys(LAWD_BY_SIDO)];

export type DisasterLevel = "all" | EmergencyLevel;

export type DisasterFilterValues = {
  sido: string;
  sigungu: string;
  level: DisasterLevel;
  windowHours: number;
};

const LEVEL_OPTIONS: Array<{ value: DisasterLevel; label: string }> = [
  { value: "all", label: "전체" },
  { value: "critical", label: "위급" },
  { value: "emergency", label: "긴급" },
  { value: "info", label: "안내" },
];

const WINDOW_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 24, label: "24시간" },
  { value: 72, label: "3일" },
  { value: 168, label: "7일" },
];

export function DisasterFilters({ current }: { current: DisasterFilterValues }) {
  const router = useRouter();
  const [sido, setSido] = useState(current.sido);
  const [sigungu, setSigungu] = useState(current.sigungu);

  const isNationwide = sido === NATIONWIDE;
  const sigunguOptions = useMemo(
    () => (isNationwide ? [] : getSigunguListWithCode(sido)),
    [sido, isNationwide],
  );

  const buildHref = (overrides: Partial<DisasterFilterValues>) => {
    const nextSido = overrides.sido ?? current.sido;
    const nextSigungu =
      nextSido === NATIONWIDE ? "" : overrides.sigungu ?? current.sigungu;
    const params = new URLSearchParams({ sido: nextSido });
    if (nextSigungu) params.set("sigungu", nextSigungu);
    const level = overrides.level ?? current.level;
    if (level !== "all") params.set("level", level);
    const w = overrides.windowHours ?? current.windowHours;
    if (w !== 72) params.set("window", String(w));
    return `/w/disaster?${params.toString()}`;
  };

  // 시·도 변경 시 시·군·구는 '전체'(빈 값)로 리셋 — 광역시 전체 등 자연스러운 기본.
  const onSidoChange = (next: string) => {
    setSido(next);
    setSigungu("");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isNationwide) {
      router.push(buildHref({ sido: NATIONWIDE, sigungu: "" }));
      return;
    }
    // 빈 값('전체')은 그대로 통과, 값이 있으면 옵션 매칭 확인.
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
          <span className="text-xs text-zinc-400">
            시·군·구{isNationwide ? " (전국 선택 시 비활성)" : ""}
          </span>
          <select
            value={isNationwide ? "" : sigungu}
            onChange={(e) => setSigungu(e.target.value)}
            disabled={isNationwide}
            className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isNationwide ? (
              <option value="" className="bg-zinc-900">
                —
              </option>
            ) : (
              <>
                <option value="" className="bg-zinc-900">
                  전체
                </option>
                {sigunguOptions.map((sg) => (
                  <option key={sg.code} value={sg.name} className="bg-zinc-900">
                    {sg.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          검색
        </button>
      </form>

      <div className="mt-4 space-y-3">
        <ChipGroup
          label="긴급단계"
          options={LEVEL_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
            active: o.value === current.level,
            href: buildHref({ level: o.value }),
          }))}
        />
        <ChipGroup
          label="기간"
          options={WINDOW_OPTIONS.map((o) => ({
            value: String(o.value),
            label: o.label,
            active: o.value === current.windowHours,
            href: buildHref({ windowHours: o.value }),
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
