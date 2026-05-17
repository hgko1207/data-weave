import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { formatAmount } from "@/widgets/apartment/format";
import { formatYm } from "@/widgets/apartment/fetch";
import type { ApartmentData, ApartmentTrade } from "@/widgets/apartment/schema";
import type { ApartmentSort } from "./ApartmentFilters";
import { ApartmentTradesList } from "./ApartmentTradesList";

const SORT_LABELS: Record<ApartmentSort, string> = {
  "date-desc": "최신순",
  "amount-desc": "가격↓",
  "amount-asc": "가격↑",
  "area-desc": "면적↓",
  "pyeong-desc": "평당가↓",
};

export function ApartmentDetail({
  data,
  sort = "date-desc",
  query = "",
  context,
}: {
  data: ApartmentData;
  sort?: ApartmentSort;
  query?: string;
  context: { sido: string; sigungu: string; lawdCd: string };
}) {
  const filtered = filterByQuery(data.trades, query);
  const sorted = sortTrades(filtered, sort);
  const hasQuery = query.trim().length > 0;
  const sortLabel = sort !== "date-desc" ? SORT_LABELS[sort] : null;

  return (
    <div className="space-y-5">
      <StatsRow data={data} />
      {sorted.length === 0 ? (
        <EmptyState dealYm={data.dealYm} query={query} />
      ) : (
        <ApartmentTradesList
          trades={sorted}
          totalAvailable={data.totalCount}
          query={hasQuery ? query : null}
          sortLabel={sortLabel}
          context={context}
        />
      )}

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function filterByQuery(trades: ApartmentTrade[], query: string): ApartmentTrade[] {
  const q = query.trim().toLowerCase();
  if (!q) return trades;
  return trades.filter((t) => {
    const hay = [t.aptName, t.aptDong, t.dong, t.roadName].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });
}

function StatsRow({ data }: { data: ApartmentData }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        icon={<Building2 className="h-4 w-4" aria-hidden />}
        label="총 거래"
        value={`${data.totalCount}건`}
        accent="bg-zinc-800 text-zinc-300"
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4" aria-hidden />}
        label="평균"
        value={formatAmount(data.avgAmount)}
        accent="bg-emerald-500/15 text-emerald-400"
        valueClass="text-zinc-100"
      />
      <StatCard
        icon={<TrendingDown className="h-4 w-4" aria-hidden />}
        label="최저"
        value={formatAmount(data.minAmount)}
        accent="bg-cyan-500/15 text-cyan-400"
        valueClass="text-cyan-300"
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4" aria-hidden />}
        label="최고"
        value={formatAmount(data.maxAmount)}
        accent="bg-rose-500/15 text-rose-400"
        valueClass="text-rose-300"
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

function EmptyState({ dealYm, query }: { dealYm: string; query: string }) {
  const hasQuery = query.trim().length > 0;
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
      <Building2 className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
      <p className="mt-3 text-base font-medium text-zinc-100">
        {hasQuery
          ? `"${query}" 일치 거래가 없어요`
          : `${formatYm(dealYm)}에 등록된 거래가 없어요`}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {hasQuery
          ? "단지명·동을 다르게 입력하거나 검색을 비워보세요."
          : "이전 달을 보거나 다른 시·군·구를 검색해보세요."}
      </p>
    </article>
  );
}

function sortTrades(trades: ApartmentTrade[], sort: ApartmentSort): ApartmentTrade[] {
  const copy = [...trades];
  switch (sort) {
    case "amount-desc":
      return copy.sort((a, b) => b.dealAmount - a.dealAmount);
    case "amount-asc":
      return copy.sort((a, b) => a.dealAmount - b.dealAmount);
    case "area-desc":
      return copy.sort((a, b) => b.area - a.area);
    case "pyeong-desc":
      return copy.sort((a, b) => (b.pricePerPyeong ?? 0) - (a.pricePerPyeong ?? 0));
    case "date-desc":
    default:
      return copy.sort((a, b) => b.dealDate.localeCompare(a.dealDate));
  }
}
