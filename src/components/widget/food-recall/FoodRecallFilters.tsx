import Link from "next/link";
import { Search } from "lucide-react";

const WINDOW_OPTIONS = [
  { value: 24, label: "24시간" },
  { value: 72, label: "3일" },
  { value: 168, label: "1주" },
  { value: 720, label: "30일" },
] as const;

const GRADE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "1", label: "1등급" },
  { value: "2", label: "2등급" },
  { value: "3", label: "3등급" },
] as const;

const COMMON_KEYWORDS = ["우유", "계란", "땅콩", "견과", "메밀", "밀", "갑각류", "복숭아"];

export type FoodRecallFilterValues = {
  keywords: string[];
  windowHours: number;
  grade: "all" | "1" | "2" | "3";
};

export function FoodRecallFilters({ current }: { current: FoodRecallFilterValues }) {
  const buildHref = (overrides: Partial<FoodRecallFilterValues>) => {
    const params = new URLSearchParams();
    const keywords = overrides.keywords ?? current.keywords;
    if (keywords.length > 0) params.set("q", keywords.join(","));
    const windowHours = overrides.windowHours ?? current.windowHours;
    params.set("window", String(windowHours));
    const grade = overrides.grade ?? current.grade;
    if (grade !== "all") params.set("grade", grade);
    return `/w/food-recall?${params.toString()}`;
  };

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-5">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        검색 조건
      </p>

      <form
        action="/w/food-recall"
        method="GET"
        className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">키워드 (쉼표로 구분)</span>
          <input
            type="text"
            name="q"
            defaultValue={current.keywords.join(",")}
            placeholder="예: 우유, 계란, 땅콩"
            className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          />
        </label>

        <input type="hidden" name="window" value={current.windowHours} />
        {current.grade !== "all" ? (
          <input type="hidden" name="grade" value={current.grade} />
        ) : null}

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <Search className="h-4 w-4" aria-hidden />
          검색
        </button>
      </form>

      <div className="mt-4 space-y-3">
        <ChipGroup
          label="기간"
          options={WINDOW_OPTIONS.map((w) => ({
            value: String(w.value),
            label: w.label,
            active: w.value === current.windowHours,
            href: buildHref({ windowHours: w.value }),
          }))}
        />

        <ChipGroup
          label="등급"
          options={GRADE_OPTIONS.map((g) => ({
            value: g.value,
            label: g.label,
            active: g.value === current.grade,
            href: buildHref({ grade: g.value }),
            tone: gradeToneFor(g.value),
          }))}
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">자주 쓰는 키워드</span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_KEYWORDS.map((kw) => {
              const active = current.keywords.includes(kw);
              const nextKeywords = active
                ? current.keywords.filter((k) => k !== kw)
                : [...current.keywords, kw];
              return (
                <Link
                  key={kw}
                  href={buildHref({ keywords: nextKeywords })}
                  aria-pressed={active}
                  className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                    active
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
                >
                  {active ? "− " : "+ "}
                  {kw}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

type ChipTone = "default" | "rose" | "amber" | "zinc";

function gradeToneFor(value: string): ChipTone {
  if (value === "1") return "rose";
  if (value === "2") return "amber";
  if (value === "3") return "zinc";
  return "default";
}

function ChipGroup({
  label,
  options,
}: {
  label: string;
  options: Array<{
    value: string;
    label: string;
    active: boolean;
    href: string;
    tone?: ChipTone;
  }>;
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
                ? toneActiveClasses(o.tone)
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

function toneActiveClasses(tone: ChipTone | undefined): string {
  switch (tone) {
    case "rose":
      return "border-rose-500/30 bg-rose-500/15 text-rose-200";
    case "amber":
      return "border-amber-500/30 bg-amber-500/15 text-amber-200";
    case "zinc":
      return "border-zinc-600 bg-zinc-700/40 text-zinc-100";
    default:
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-200";
  }
}
