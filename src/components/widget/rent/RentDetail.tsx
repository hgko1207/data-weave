import Link from "next/link";
import { Key, Coins, Building2, ExternalLink } from "lucide-react";
import { formatAmount, pyeongLabel } from "@/widgets/apartment/format";
import { formatYm } from "@/widgets/apartment/fetch";
import type { RentData, RentTrade } from "@/widgets/rent/schema";
import type { RentSort, RentTypeFilter } from "./RentFilters";

const SORT_LABELS: Record<RentSort, string> = {
  "date-desc": "최신순",
  "deposit-desc": "보증금↓",
  "deposit-asc": "보증금↑",
  "rent-desc": "월세↓",
  "area-desc": "면적↓",
};

type Context = {
  sido: string;
  sigungu: string;
  lawdCd: string;
};

export function RentDetail({
  data,
  typeFilter = "all",
  sort = "date-desc",
  context,
}: {
  data: RentData;
  typeFilter?: RentTypeFilter;
  sort?: RentSort;
  context: Context;
}) {
  const filtered =
    typeFilter === "all" ? data.trades : data.trades.filter((t) => t.type === typeFilter);
  const sorted = sortTrades(filtered, sort);
  const sortLabel = sort !== "date-desc" ? SORT_LABELS[sort] : null;

  return (
    <div className="space-y-5">
      <StatsRow data={data} />
      <TradesList
        data={data}
        trades={sorted}
        typeFilter={typeFilter}
        sortLabel={sortLabel}
        context={context}
      />

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function StatsRow({ data }: { data: RentData }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        icon={<Building2 className="h-4 w-4" aria-hidden />}
        label="총 거래"
        value={`${data.totalCount}건`}
        accent="bg-zinc-800 text-zinc-300"
      />
      <StatCard
        icon={<Key className="h-4 w-4" aria-hidden />}
        label={`전세 (${data.jeonseCount})`}
        value={formatAmount(data.avgJeonseDeposit)}
        accent="bg-cyan-500/15 text-cyan-400"
        valueClass="text-cyan-200"
      />
      <StatCard
        icon={<Coins className="h-4 w-4" aria-hidden />}
        label={`월세 보증금 (${data.monthlyCount})`}
        value={formatAmount(data.avgMonthlyDeposit)}
        accent="bg-amber-500/15 text-amber-400"
        valueClass="text-amber-200"
      />
      <StatCard
        icon={<Coins className="h-4 w-4" aria-hidden />}
        label="월세 평균"
        value={data.avgMonthlyRent != null ? `${data.avgMonthlyRent}만` : "—"}
        accent="bg-rose-500/15 text-rose-400"
        valueClass="text-rose-200"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  valueClass?: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={`flex h-9 w-9 items-center justify-center rounded-md ${accent}`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-zinc-300">{label}</span>
      </div>
      <p
        className={`mt-3 font-mono text-2xl font-semibold tracking-tight ${
          valueClass ?? "text-zinc-100"
        }`}
      >
        {value}
      </p>
    </article>
  );
}

function TradesList({
  data,
  trades,
  typeFilter,
  sortLabel,
  context,
}: {
  data: RentData;
  trades: RentTrade[];
  typeFilter: RentTypeFilter;
  sortLabel: string | null;
  context: Context;
}) {
  if (trades.length === 0) {
    const label =
      typeFilter === "all" ? "거래" : typeFilter === "jeonse" ? "전세 거래" : "월세 거래";
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
        <Key className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
        <p className="mt-3 text-base font-medium text-zinc-100">
          {formatYm(data.dealYm)}에 {label}가 없어요
        </p>
        <p className="mt-1 text-xs text-zinc-500">이전 달을 보거나 종류 필터를 풀어보세요.</p>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-base font-semibold text-zinc-100">거래 내역</h2>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
            {Math.min(trades.length, 200)}건
          </p>
          {sortLabel ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
              정렬 · {sortLabel}
            </span>
          ) : null}
        </div>
      </header>

      {/* 컬럼 헤더 — 데스크탑만 */}
      <div className="hidden grid-cols-[40px_60px_1fr_120px_180px] items-center gap-4 border-b border-zinc-800/80 px-6 py-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500 md:grid">
        <span className="text-right">#</span>
        <span>종류</span>
        <span>단지·주소</span>
        <span>면적</span>
        <span className="text-right">금액·날짜</span>
      </div>

      <ul className="divide-y divide-zinc-800/60">
        {trades.map((t, idx) => (
          <TradeRow key={t.id} index={idx + 1} trade={t} context={context} />
        ))}
      </ul>
    </article>
  );
}

function TradeRow({
  index,
  trade,
  context,
}: {
  index: number;
  trade: RentTrade;
  context: Context;
}) {
  const isJeonse = trade.type === "jeonse";
  const typeColor = isJeonse
    ? "bg-cyan-500/15 text-cyan-300"
    : "bg-amber-500/15 text-amber-300";
  const buildingHref = buildBuildingHref(context, trade);

  return (
    <li className="grid grid-cols-[1fr_auto] items-start gap-3 px-6 py-3.5 transition hover:bg-zinc-800/40 md:grid-cols-[40px_60px_1fr_120px_180px] md:gap-4">
      <span className="hidden text-right font-mono text-xs tabular-nums text-zinc-600 md:block">
        {String(index).padStart(2, "0")}
      </span>
      <span
        className={`hidden md:inline-flex items-center justify-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${typeColor}`}
      >
        {isJeonse ? "전세" : "월세"}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className={`md:hidden inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${typeColor}`}
          >
            {isJeonse ? "전세" : "월세"}
          </span>
          <Link
            href={buildingHref}
            className="group inline-flex items-baseline gap-1 text-base font-medium text-zinc-100 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <span className="group-hover:underline">{trade.aptName}</span>
            <ExternalLink
              className="h-3 w-3 shrink-0 text-zinc-600 transition group-hover:text-emerald-400"
              aria-hidden
            />
          </Link>
          {trade.floor != null ? (
            <span className="font-mono text-xs text-zinc-500">{trade.floor}층</span>
          ) : null}
          {trade.buildYear != null ? (
            <span className="font-mono text-xs text-zinc-500">{trade.buildYear}년식</span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {trade.dong}
          {trade.jibun ? ` ${trade.jibun}` : ""}
        </p>
        {/* mobile: 면적 + 날짜 인라인 */}
        <p className="mt-1 flex items-baseline gap-2 font-mono text-xs tabular-nums text-zinc-500 md:hidden">
          <span>{trade.area.toFixed(1)}㎡ · {pyeongLabel(trade.area)}</span>
          <span className="text-zinc-700">·</span>
          <span>{formatDealDate(trade.dealDate)}</span>
        </p>
      </div>

      <div className="hidden flex-col items-start font-mono tabular-nums md:flex">
        <span className="text-sm text-zinc-200">{trade.area.toFixed(1)}㎡</span>
        <span className="text-xs text-zinc-500">{pyeongLabel(trade.area)}</span>
      </div>

      <div className="text-right font-mono tabular-nums">
        {isJeonse ? (
          <p className="text-base font-semibold text-cyan-200">{formatAmount(trade.deposit)}</p>
        ) : (
          <p className="text-base font-semibold">
            <span className="text-amber-200">{formatAmount(trade.deposit)}</span>
            <span className="text-zinc-700"> / </span>
            <span className="text-amber-300">{trade.monthlyRent}만</span>
          </p>
        )}
        <p className="mt-0.5 hidden text-xs text-zinc-500 md:block">
          {formatDealDate(trade.dealDate)}
        </p>
      </div>
    </li>
  );
}

function buildBuildingHref(ctx: Context, trade: RentTrade): string {
  const params = new URLSearchParams({
    sido: ctx.sido,
    sigungu: ctx.sigungu,
    lawdCd: ctx.lawdCd,
    apt: trade.aptName,
    dong: trade.dong,
  });
  return `/w/rent/building?${params.toString()}`;
}

function formatDealDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[2]}.${m[3]}`;
}

function sortTrades(trades: RentTrade[], sort: RentSort): RentTrade[] {
  const copy = [...trades];
  switch (sort) {
    case "deposit-desc":
      return copy.sort((a, b) => b.deposit - a.deposit);
    case "deposit-asc":
      return copy.sort((a, b) => a.deposit - b.deposit);
    case "rent-desc":
      return copy.sort((a, b) => b.monthlyRent - a.monthlyRent);
    case "area-desc":
      return copy.sort((a, b) => b.area - a.area);
    case "date-desc":
    default:
      return copy.sort((a, b) => b.dealDate.localeCompare(a.dealDate));
  }
}
