import { Flame, Snowflake, BarChart3 } from "lucide-react";
import type { LottoStats as Stats } from "@/widgets/lotto/fetch";
import { LottoBall } from "./LottoBall";

export function LottoStats({ stats }: { stats: Stats }) {
  const maxFreq = Math.max(...stats.frequency.slice(1), 1);

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <BarChart3 className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              번호 통계
            </p>
            <p className="text-sm font-medium text-zinc-100">
              {stats.fromRound}~{stats.toRound}회 · {stats.count}회 집계
            </p>
          </div>
        </div>
      </header>

      {/* 핫/콜드 */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] p-4">
          <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-rose-300">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            자주 나온 번호
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats.hot.map((n) => (
              <LottoBall key={n} num={n} size="sm" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] p-4">
          <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-cyan-300">
            <Snowflake className="h-3.5 w-3.5" aria-hidden />
            안 나온 번호
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats.cold.map((n) => (
              <LottoBall key={n} num={n} size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* 번호별 출현 빈도 막대 (1~45) */}
      <div className="mt-5">
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          번호별 출현 빈도
        </p>
        <div className="mt-3 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
            const freq = stats.frequency[n] ?? 0;
            const heightPct = Math.round((freq / maxFreq) * 100);
            const tone =
              stats.hot.includes(n)
                ? "bg-rose-400"
                : stats.cold.includes(n)
                  ? "bg-cyan-400"
                  : "bg-zinc-600";
            return (
              <div key={n} className="flex flex-col items-center gap-1" title={`${n}번 · ${freq}회`}>
                <div className="flex h-16 w-full items-end">
                  <div
                    className={`w-full rounded-sm ${tone}`}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] tabular-nums text-zinc-600">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        로또는 매 회 완전 무작위라 과거 빈도가 다음 회차 확률에 영향을 주지 않습니다. 통계는 재미로만
        참고하세요.
        {stats.source === "mock" ? " (현재 mock — 한국에서 접속 시 실 데이터)" : ""}
      </p>
    </article>
  );
}
