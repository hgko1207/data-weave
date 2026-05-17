import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { formatAmount } from "@/widgets/apartment/format";
import { formatYm } from "@/widgets/apartment/fetch";
import type { ApartmentData, ApartmentTrade } from "@/widgets/apartment/schema";
import type { ApartmentSort } from "./ApartmentFilters";
import { ApartmentTradesList } from "./ApartmentTradesList";

export function ApartmentDetail({
  data,
  sort = "date-desc",
}: {
  data: ApartmentData;
  sort?: ApartmentSort;
}) {
  const sorted = sortTrades(data.trades, sort);
  return (
    <div className="space-y-5">
      <StatsRow data={data} />
      {sorted.length === 0 ? (
        <EmptyState dealYm={data.dealYm} />
      ) : (
        <ApartmentTradesList trades={sorted} totalAvailable={data.totalCount} />
      )}

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
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

function EmptyState({ dealYm }: { dealYm: string }) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
      <Building2 className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
      <p className="mt-3 text-base font-medium text-zinc-100">
        {formatYm(dealYm)}에 등록된 거래가 없어요
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        이전 달을 보거나 다른 시·군·구를 검색해보세요.
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
