import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Ticket, Trophy } from "lucide-react";
import type { LottoData, TopStore } from "@/widgets/lotto/schema";

type Props = {
  data: LottoData;
};

const METHOD_LABEL: Record<NonNullable<TopStore["method"]>, string> = {
  auto: "자동",
  manual: "수동",
  mixed: "반자동",
};

const METHOD_TONE: Record<NonNullable<TopStore["method"]>, string> = {
  auto: "bg-emerald-500/15 text-emerald-300",
  manual: "bg-cyan-500/15 text-cyan-300",
  mixed: "bg-amber-500/15 text-amber-300",
};

export function LottoDetail({ data }: Props) {
  const prevRound = data.round > 1 ? data.round - 1 : null;
  const nextRound = data.round < data.latestRound ? data.round + 1 : null;

  return (
    <div className="space-y-5">
      <DrawCard data={data} prevRound={prevRound} nextRound={nextRound} />
      <PrizeCard data={data} />
      <TopStoresCard stores={data.topStores} />

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 연동 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function DrawCard({
  data,
  prevRound,
  nextRound,
}: {
  data: LottoData;
  prevRound: number | null;
  nextRound: number | null;
}) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <Ticket className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              당첨번호
            </p>
            <p className="text-sm font-medium text-zinc-100">
              제 <span className="font-mono">{data.round}</span> 회 · {data.drawDate}
            </p>
          </div>
        </div>

        {/* 회차 stepper */}
        <div className="flex items-center gap-1">
          {prevRound != null ? (
            <Link
              href={`/w/lotto?round=${prevRound}`}
              aria-label="이전 회차"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/60 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/60 text-zinc-700">
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </span>
          )}
          {nextRound != null ? (
            <Link
              href={`/w/lotto?round=${nextRound}`}
              aria-label="다음 회차"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/60 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/60 text-zinc-700">
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          )}
          <Link
            href="/w/lotto"
            className="ml-1 inline-flex h-8 items-center rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 font-mono text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            최신 {data.latestRound}회
          </Link>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        {data.numbers.map((n) => (
          <LottoBall key={n} num={n} />
        ))}
        <span className="mx-1 font-mono text-2xl text-zinc-600">+</span>
        <LottoBall num={data.bonus} />
        <span className="ml-1 inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
          보너스
        </span>
      </div>
    </article>
  );
}

function LottoBall({ num }: { num: number }) {
  const palette =
    num <= 10
      ? "bg-yellow-500 text-yellow-950"
      : num <= 20
        ? "bg-blue-500 text-white"
        : num <= 30
          ? "bg-red-500 text-white"
          : num <= 40
            ? "bg-zinc-500 text-white"
            : "bg-emerald-500 text-emerald-950";
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold tabular-nums shadow-sm ${palette}`}
    >
      {num}
    </span>
  );
}

function PrizeCard({ data }: { data: LottoData }) {
  if (data.firstPrizeAmount == null || data.firstPrizeWinners == null) return null;
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500/15 text-amber-400">
          <Trophy className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            1등 당첨
          </p>
          <p className="text-sm font-medium text-zinc-100">{data.firstPrizeWinners}명 배출</p>
        </div>
      </header>
      <p className="mt-4 font-mono text-3xl font-semibold tracking-tight text-amber-200">
        {formatKRW(data.firstPrizeAmount)}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-500">1인당 당첨금</p>
    </article>
  );
}

function TopStoresCard({ stores }: { stores: TopStore[] }) {
  if (stores.length === 0) return null;
  // 시·도별 그룹화
  const grouped = new Map<string, TopStore[]>();
  for (const s of stores) {
    const cur = grouped.get(s.sido);
    if (cur) cur.push(s);
    else grouped.set(s.sido, [s]);
  }
  const groups = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-100">1등 배출점</h2>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          {stores.length}곳
        </p>
      </header>
      <div className="divide-y divide-zinc-800/60">
        {groups.map(([sido, list]) => (
          <section key={sido} className="px-6 py-4">
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-zinc-500">
              {sido} · {list.length}곳
            </p>
            <ul className="space-y-2">
              {list.map((s, i) => {
                const mapHref = `https://map.kakao.com/?q=${encodeURIComponent(`${s.name} ${s.address}`)}`;
                return (
                  <li key={`${s.name}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-sm font-medium text-zinc-100">{s.name}</span>
                    {s.method ? (
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${METHOD_TONE[s.method]}`}
                      >
                        {METHOD_LABEL[s.method]}
                      </span>
                    ) : null}
                    <span className="truncate text-xs text-zinc-500">{s.address}</span>
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-emerald-300 hover:text-emerald-200"
                    >
                      <MapPin className="h-3 w-3" aria-hidden />
                      지도
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

function formatKRW(amount: number): string {
  if (amount >= 100_000_000) {
    const eok = amount / 100_000_000;
    return `${eok.toFixed(2)}억원`;
  }
  if (amount >= 10_000) {
    const man = Math.round(amount / 10_000);
    return `${man.toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}
