import Link from "next/link";
import {
  Building2,
  MapPin,
  CalendarClock,
  Key,
  Coins,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { pyeongLabel, supplyPyeong, formatAmount } from "@/widgets/apartment/format";
import type { RentTrade } from "@/widgets/rent/schema";
import { RentBuildingPriceChart } from "./RentBuildingPriceChart";
import { StatCard } from "@/components/widget/StatCard";

type Props = {
  aptName: string;
  dong: string;
  region: string;
  trades: RentTrade[];
  monthsScanned: number;
  source: "live" | "mock";
  backHref: string;
};

export function RentBuildingDetail({
  aptName,
  dong,
  region,
  trades,
  monthsScanned,
  source,
  backHref,
}: Props) {
  if (trades.length === 0) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
        <Key className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
        <p className="mt-3 text-base font-medium text-zinc-100">
          최근 {monthsScanned}개월 전월세 거래가 없어요
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          단지명·법정동이 변경되었거나 거래가 발생하지 않았을 수 있어요.
        </p>
        <Link
          href={backHref}
          className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          거래 목록으로
        </Link>
      </article>
    );
  }

  const sample = trades[0];
  const buildYear = trades.find((t) => t.buildYear != null)?.buildYear ?? null;
  const jibun = trades.find((t) => t.jibun)?.jibun ?? null;
  const mapQuery = `${region} ${sample.dong} ${aptName}${jibun ? ` ${jibun}` : ""}`;
  const mapHref = `https://map.kakao.com/?q=${encodeURIComponent(mapQuery)}`;

  return (
    <div className="space-y-6">
      <BuildingHeader
        aptName={aptName}
        dong={dong}
        region={region}
        jibun={jibun}
        buildYear={buildYear}
        tradeCount={trades.length}
        monthsScanned={monthsScanned}
        mapHref={mapHref}
      />

      <BuildingStats trades={trades} />

      <RentBuildingPriceChart trades={trades} />

      <BuildingAreaGroups trades={trades} />

      <BuildingTradeList trades={trades} />

      {source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function BuildingHeader({
  aptName,
  dong,
  region,
  jibun,
  buildYear,
  tradeCount,
  monthsScanned,
  mapHref,
}: {
  aptName: string;
  dong: string;
  region: string;
  jibun: string | null;
  buildYear: number | null;
  tradeCount: number;
  monthsScanned: number;
  mapHref: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">{aptName}</h2>
            {buildYear != null ? (
              <span className="font-mono text-xs text-zinc-400">{buildYear}년식</span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {region} {dong}
            {jibun ? ` ${jibun}` : ""}
          </p>
        </div>
        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          카카오맵
          <ExternalLink className="h-3 w-3 text-emerald-400" aria-hidden />
        </a>
      </div>
      <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <MetaItem
          icon={<CalendarClock className="h-3.5 w-3.5" aria-hidden />}
          label="집계 범위"
          value={`최근 ${monthsScanned}개월`}
        />
        <MetaItem
          icon={<Building2 className="h-3.5 w-3.5" aria-hidden />}
          label="거래 수"
          value={`${tradeCount}건`}
        />
      </dl>
    </article>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-zinc-500" aria-hidden>
        {icon}
      </span>
      <dt className="text-xs text-zinc-400">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-zinc-200">{value}</dd>
    </div>
  );
}

function BuildingStats({ trades }: { trades: RentTrade[] }) {
  const jeonse = trades.filter((t) => t.type === "jeonse");
  const monthly = trades.filter((t) => t.type === "monthly");
  const avgJeonse =
    jeonse.length > 0
      ? Math.round(jeonse.reduce((a, t) => a + t.deposit, 0) / jeonse.length)
      : null;
  const avgMonthlyDeposit =
    monthly.length > 0
      ? Math.round(monthly.reduce((a, t) => a + t.deposit, 0) / monthly.length)
      : null;
  const avgMonthlyRent =
    monthly.length > 0
      ? Math.round(monthly.reduce((a, t) => a + t.monthlyRent, 0) / monthly.length)
      : null;
  const latest = trades[0].dealDate;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        icon={<Building2 className="h-4 w-4" aria-hidden />}
        label="총 거래"
        value={`${trades.length}건`}
        accent="bg-zinc-800 text-zinc-300"
        sub={`최근 ${formatShortDate(latest)}`}
      />
      <StatCard
        icon={<Key className="h-4 w-4" aria-hidden />}
        label={`전세 (${jeonse.length})`}
        value={avgJeonse != null ? formatAmount(avgJeonse) : "—"}
        accent="bg-cyan-500/15 text-cyan-400"
        valueClass="text-cyan-200"
      />
      <StatCard
        icon={<Coins className="h-4 w-4" aria-hidden />}
        label={`월세 보증금 (${monthly.length})`}
        value={avgMonthlyDeposit != null ? formatAmount(avgMonthlyDeposit) : "—"}
        accent="bg-amber-500/15 text-amber-400"
        valueClass="text-amber-200"
      />
      <StatCard
        icon={<Coins className="h-4 w-4" aria-hidden />}
        label="월세 평균"
        value={avgMonthlyRent != null ? `${avgMonthlyRent}만` : "—"}
        accent="bg-rose-500/15 text-rose-400"
        valueClass="text-rose-200"
      />
    </div>
  );
}

type AreaGroup = {
  pyeong: number;
  areas: number[];
  jeonse: RentTrade[];
  monthly: RentTrade[];
};

function BuildingAreaGroups({ trades }: { trades: RentTrade[] }) {
  const groups = groupByPyeong(trades);
  if (groups.length === 0) return null;

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <h3 className="text-base font-semibold text-zinc-100">평형별 거래</h3>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
          {groups.length}개 평형
        </p>
      </header>
      <ul className="divide-y divide-zinc-800/60">
        {groups.map((g) => {
          const areaRange = formatAreaRange(g.areas);
          const jeonseAvg =
            g.jeonse.length > 0
              ? Math.round(g.jeonse.reduce((a, t) => a + t.deposit, 0) / g.jeonse.length)
              : null;
          const monthlyAvg =
            g.monthly.length > 0
              ? Math.round(g.monthly.reduce((a, t) => a + t.deposit, 0) / g.monthly.length)
              : null;
          const monthlyRentAvg =
            g.monthly.length > 0
              ? Math.round(g.monthly.reduce((a, t) => a + t.monthlyRent, 0) / g.monthly.length)
              : null;
          return (
            <li
              key={g.pyeong}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-3.5 md:grid-cols-[120px_1fr_auto]"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg font-semibold tabular-nums text-zinc-100">
                  {g.pyeong}
                </span>
                <span className="text-xs text-zinc-400">평형</span>
              </div>
              <p className="hidden font-mono text-xs text-zinc-400 tabular-nums md:block">
                전용 {areaRange}㎡ · {g.jeonse.length + g.monthly.length}건
              </p>
              <div className="text-right font-mono tabular-nums">
                {jeonseAvg != null ? (
                  <p className="text-sm">
                    <span className="text-cyan-300">전세 </span>
                    <span className="text-cyan-200">{formatAmount(jeonseAvg)}</span>
                  </p>
                ) : null}
                {monthlyAvg != null ? (
                  <p className="mt-0.5 text-sm">
                    <span className="text-amber-300">월세 </span>
                    <span className="text-amber-200">{formatAmount(monthlyAvg)}</span>
                    {monthlyRentAvg != null ? (
                      <>
                        <span className="text-zinc-600"> / </span>
                        <span className="text-amber-300">{monthlyRentAvg}만</span>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function BuildingTradeList({ trades }: { trades: RentTrade[] }) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <h3 className="text-base font-semibold text-zinc-100">거래 내역 · 최신순</h3>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
          {trades.length}건
        </p>
      </header>

      <div className="hidden grid-cols-[40px_60px_1fr_160px_100px] items-center gap-4 border-b border-zinc-800/80 px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-400 md:grid">
        <span className="text-right">#</span>
        <span>종류</span>
        <span>면적·평형</span>
        <span className="text-right">금액</span>
        <span className="text-right">날짜</span>
      </div>

      <ul className="divide-y divide-zinc-800/60">
        {trades.map((t, idx) => {
          const isJeonse = t.type === "jeonse";
          return (
            <li
              key={t.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 px-6 py-3 md:grid-cols-[40px_60px_1fr_160px_100px] md:gap-4"
            >
              <span className="hidden text-right font-mono text-xs tabular-nums text-zinc-400 md:block">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span
                className={`hidden md:inline-flex items-center justify-center rounded px-1.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider ${
                  isJeonse ? "bg-cyan-500/15 text-cyan-300" : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {isJeonse ? "전세" : "월세"}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span
                    className={`md:hidden inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider ${
                      isJeonse ? "bg-cyan-500/15 text-cyan-300" : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {isJeonse ? "전세" : "월세"}
                  </span>
                  <span className="font-mono text-sm font-medium tabular-nums text-zinc-100">
                    {t.area.toFixed(1)}㎡
                  </span>
                  <span className="font-mono text-xs text-zinc-400">{pyeongLabel(t.area)}</span>
                  {t.floor != null ? (
                    <span className="font-mono text-xs text-zinc-400">· {t.floor}층</span>
                  ) : null}
                </div>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-zinc-400 md:hidden">
                  {formatShortDate(t.dealDate)}
                </p>
              </div>
              <p className="text-right font-mono text-base font-semibold tabular-nums">
                {isJeonse ? (
                  <span className="text-cyan-200">{formatAmount(t.deposit)}</span>
                ) : (
                  <>
                    <span className="text-amber-200">{formatAmount(t.deposit)}</span>
                    <span className="text-zinc-600"> / </span>
                    <span className="text-amber-300">{t.monthlyRent}만</span>
                  </>
                )}
              </p>
              <p className="hidden text-right font-mono text-xs tabular-nums text-zinc-400 md:block">
                {formatShortDate(t.dealDate)}
              </p>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function groupByPyeong(trades: RentTrade[]): AreaGroup[] {
  const map = new Map<number, AreaGroup>();
  for (const t of trades) {
    if (!Number.isFinite(t.area) || t.area <= 0) continue;
    const pyeong = Math.round(supplyPyeong(t.area));
    const cur = map.get(pyeong);
    if (cur) {
      cur.areas.push(t.area);
      if (t.type === "jeonse") cur.jeonse.push(t);
      else cur.monthly.push(t);
    } else {
      map.set(pyeong, {
        pyeong,
        areas: [t.area],
        jeonse: t.type === "jeonse" ? [t] : [],
        monthly: t.type === "monthly" ? [t] : [],
      });
    }
  }
  return [...map.values()].sort((a, b) => a.pyeong - b.pyeong);
}

function formatAreaRange(areas: number[]): string {
  const sorted = [...areas].sort((a, b) => a - b);
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  if (Math.abs(hi - lo) < 0.1) return lo.toFixed(1);
  return `${lo.toFixed(1)}~${hi.toFixed(1)}`;
}

function formatShortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[1].slice(2)}.${m[2]}.${m[3]}`;
}
