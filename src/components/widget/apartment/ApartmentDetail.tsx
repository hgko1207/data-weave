import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { formatAmount } from "@/widgets/apartment/format";
import { formatYm } from "@/widgets/apartment/fetch";
import type { ApartmentData, ApartmentTrade } from "@/widgets/apartment/schema";

export function ApartmentDetail({ data }: { data: ApartmentData }) {
  return (
    <div className="space-y-5">
      <StatsRow data={data} />
      <TradesList data={data} />

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

function TradesList({ data }: { data: ApartmentData }) {
  if (data.trades.length === 0) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
        <Building2 className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
        <p className="mt-3 text-base font-medium text-zinc-100">
          {formatYm(data.dealYm)}에 등록된 거래가 없어요
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          이전 달을 보거나 다른 시·군·구를 검색해보세요.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-100">거래 내역</h2>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          최근 등록 순 · {Math.min(data.trades.length, 200)}건
        </p>
      </header>
      <ul className="divide-y divide-zinc-800/60">
        {data.trades.map((t) => (
          <TradeRow key={t.id} trade={t} />
        ))}
      </ul>
    </article>
  );
}

function TradeRow({ trade }: { trade: ApartmentTrade }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-start gap-4 px-6 py-4 md:grid-cols-[1.4fr_1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-base font-medium text-zinc-100">{trade.aptName}</h3>
          {trade.floor != null ? (
            <span className="font-mono text-xs text-zinc-500">{trade.floor}층</span>
          ) : null}
          {trade.buildYear != null ? (
            <span className="font-mono text-xs text-zinc-600">{trade.buildYear}년식</span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-sm text-zinc-400">
          {trade.dong}
          {trade.jibun ? ` ${trade.jibun}` : ""}
        </p>
      </div>

      <div className="hidden flex-col items-start gap-0.5 md:flex">
        <span className="font-mono text-sm font-medium tabular-nums text-zinc-200">
          {trade.area.toFixed(1)}㎡
        </span>
        <span className="font-mono text-xs text-zinc-500 tabular-nums">
          {(trade.area / 3.3058).toFixed(1)}평
        </span>
      </div>

      <div className="text-right">
        <p className="font-mono text-base font-semibold tabular-nums text-zinc-100">
          {formatAmount(trade.dealAmount)}
        </p>
        <p className="mt-0.5 font-mono text-xs text-zinc-500 tabular-nums">
          {formatDealDate(trade.dealDate)}
        </p>
        {trade.pricePerPyeong != null ? (
          <p className="mt-0.5 font-mono text-[11px] text-zinc-600 tabular-nums">
            평당 {formatAmount(Math.round(trade.pricePerPyeong))}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function formatDealDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[2]}.${m[3]}`;
}
