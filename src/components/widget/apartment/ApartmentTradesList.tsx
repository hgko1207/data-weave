"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  ExternalLink,
  Info,
  MapPin,
  CalendarClock,
  Handshake,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { formatAmount, pyeongLabel } from "@/widgets/apartment/format";
import type { ApartmentTrade } from "@/widgets/apartment/schema";

type Context = {
  sido: string;
  sigungu: string;
  lawdCd: string;
};

type Props = {
  trades: ApartmentTrade[];
  totalAvailable: number;
  query?: string | null;
  sortLabel?: string | null;
  context: Context;
};

export function ApartmentTradesList({
  trades,
  totalAvailable,
  query,
  sortLabel,
  context,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <article
      id="apartment-trades"
      className="scroll-mt-20 rounded-xl border border-zinc-800/80 bg-zinc-900"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-base font-semibold text-zinc-100">거래 내역</h2>
          {query ? (
            <p className="font-mono text-xs tabular-nums text-zinc-400">
              <span className="text-emerald-300">{trades.length}</span>건 매칭 · 전체 {totalAvailable}건
            </p>
          ) : (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
              {Math.min(trades.length, 200)}건
            </p>
          )}
          {sortLabel ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-xs text-emerald-300">
              정렬 · {sortLabel}
            </span>
          ) : null}
        </div>
        <p className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400">
          <Info className="h-3 w-3" aria-hidden />
          호수는 개인정보 보호로 비공개
        </p>
      </header>

      {/* 컬럼 헤더 */}
      <div className="hidden grid-cols-[40px_1fr_120px_100px_120px_24px] items-center gap-4 border-b border-zinc-800/80 px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-400 md:grid">
        <span className="text-right">#</span>
        <span>단지·주소</span>
        <span>면적</span>
        <span className="text-right">가격</span>
        <span className="text-right">날짜</span>
        <span />
      </div>

      <ul className="divide-y divide-zinc-800/60">
        {trades.map((trade, idx) => (
          <TradeRow
            key={trade.id}
            index={idx + 1}
            trade={trade}
            expanded={expandedId === trade.id}
            onToggle={() =>
              setExpandedId((cur) => (cur === trade.id ? null : trade.id))
            }
            context={context}
          />
        ))}
      </ul>

      {trades.length < totalAvailable ? (
        <p className="border-t border-zinc-800/80 px-6 py-3 text-center font-mono text-xs text-zinc-400">
          전체 {totalAvailable}건 중 {trades.length}건 표시
        </p>
      ) : null}
    </article>
  );
}

function TradeRow({
  index,
  trade,
  expanded,
  onToggle,
  context,
}: {
  index: number;
  trade: ApartmentTrade;
  expanded: boolean;
  onToggle: () => void;
  context: Context;
}) {
  const isCancelled = trade.cancelDealDay != null;
  const buildingHref = buildBuildingHref(context, trade);

  return (
    <li className={isCancelled ? "opacity-60" : ""}>
      {/* Row container: div(role=button)으로 변경 — aptName 링크를 안에 nest하기 위해 */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={expanded}
        className={`grid w-full cursor-pointer grid-cols-[40px_1fr_100px_24px] items-center gap-3 px-6 py-3.5 text-left transition hover:bg-zinc-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50 md:grid-cols-[40px_1fr_120px_100px_120px_24px] md:gap-4 ${
          expanded ? "bg-zinc-800/30" : ""
        }`}
      >
        <span className="text-right font-mono text-xs tabular-nums text-zinc-400">
          {String(index).padStart(2, "0")}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={buildingHref}
              onClick={(e) => e.stopPropagation()}
              className="group inline-flex items-baseline gap-1 text-base font-medium text-zinc-100 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <span className="group-hover:underline">{trade.aptName}</span>
              <ExternalLink
                className="h-3 w-3 shrink-0 text-zinc-500 transition group-hover:text-emerald-400"
                aria-hidden
              />
            </Link>
            {trade.aptDong ? (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                {trade.aptDong}
              </span>
            ) : null}
            {trade.floor != null ? (
              <span className="font-mono text-xs text-zinc-400">{trade.floor}층</span>
            ) : null}
            {trade.buildYear != null ? (
              <span className="font-mono text-xs text-zinc-400">{trade.buildYear}년식</span>
            ) : null}
            {isCancelled ? (
              <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.5 font-mono text-xs text-rose-300">
                <XCircle className="h-3 w-3" aria-hidden />
                해제
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-400">
            {trade.dong}
            {trade.jibun ? ` ${trade.jibun}` : ""}
            {trade.roadName ? ` · ${trade.roadName}` : ""}
          </p>
          {/* mobile: 면적 + 날짜 인라인 */}
          <p className="mt-1 flex items-baseline gap-3 font-mono text-xs tabular-nums text-zinc-400 md:hidden">
            <span>{trade.area.toFixed(1)}㎡ ({pyeongLabel(trade.area)})</span>
            <span>·</span>
            <span>{formatDealDate(trade.dealDate)}</span>
          </p>
        </div>

        <div className="hidden flex-col items-start font-mono tabular-nums md:flex">
          <span className="text-sm text-zinc-200">{trade.area.toFixed(1)}㎡</span>
          <span className="text-xs text-zinc-400">{pyeongLabel(trade.area)}</span>
        </div>

        <div className="text-right font-mono tabular-nums">
          <p className="text-base font-semibold text-zinc-100">
            {formatAmount(trade.dealAmount)}
          </p>
          {trade.pricePerPyeong != null ? (
            <p className="mt-0.5 hidden text-xs text-zinc-400 md:block">
              평당 {formatAmount(Math.round(trade.pricePerPyeong))}
            </p>
          ) : null}
        </div>

        <p className="hidden text-right font-mono text-xs tabular-nums text-zinc-400 md:block">
          {formatDealDate(trade.dealDate)}
        </p>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
            expanded ? "rotate-180 text-emerald-400" : ""
          }`}
          aria-hidden
        />
      </div>

      {expanded ? <ExpandedDetails trade={trade} buildingHref={buildingHref} /> : null}
    </li>
  );
}

function buildBuildingHref(ctx: Context, trade: ApartmentTrade): string {
  const params = new URLSearchParams({
    sido: ctx.sido,
    sigungu: ctx.sigungu,
    lawdCd: ctx.lawdCd,
    apt: trade.aptName,
    dong: trade.dong,
  });
  return `/w/apartment/building?${params.toString()}`;
}

function ExpandedDetails({
  trade,
  buildingHref,
}: {
  trade: ApartmentTrade;
  buildingHref: string;
}) {
  return (
    <div className="space-y-4 border-t border-zinc-800/60 bg-zinc-950/40 px-6 py-4">
      <Link
        href={buildingHref}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        <Building2 className="h-3.5 w-3.5" aria-hidden />
        단지 종합 정보 보기
        <ExternalLink className="h-3 w-3 text-emerald-400" aria-hidden />
      </Link>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <DetailRow
          icon={<MapPin className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="도로명"
          value={trade.roadName ?? "—"}
        />
        <DetailRow
          icon={<Handshake className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="계약 형태"
          value={trade.dealType ?? "—"}
        />
        <DetailRow
          icon={<MapPin className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="중개업소"
          value={trade.agentSido ?? "—"}
        />
        <DetailRow
          icon={<UserCircle2 className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="매도자"
          value={trade.sellerType ?? "—"}
        />
        <DetailRow
          icon={<UserCircle2 className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="매수자"
          value={trade.buyerType ?? "—"}
        />
        <DetailRow
          icon={<CalendarClock className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="등기일"
          value={trade.rgstDate ?? "—"}
        />
        <DetailRow
          icon={<Building2 className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="건축년도"
          value={trade.buildYear != null ? `${trade.buildYear}년` : "—"}
        />
        <DetailRow
          icon={<Building2 className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="전용면적"
          value={`${trade.area.toFixed(2)}㎡ · ${pyeongLabel(trade.area)} (전용 ${(trade.area / 3.3058).toFixed(1)}평)`}
        />
        <DetailRow
          icon={<CalendarClock className="h-3.5 w-3.5 text-zinc-500" aria-hidden />}
          label="평당가"
          value={
            trade.pricePerPyeong != null
              ? formatAmount(Math.round(trade.pricePerPyeong))
              : "—"
          }
        />
        {trade.cancelDealDay ? (
          <DetailRow
            icon={<XCircle className="h-3.5 w-3.5 text-rose-400" aria-hidden />}
            label="해제일"
            value={trade.cancelDealDay}
            tone="text-rose-300"
          />
        ) : null}
      </dl>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <dt className="text-xs text-zinc-400">{label}</dt>
      <dd className={`ml-auto truncate font-mono text-sm ${tone ?? "text-zinc-200"}`}>
        {value}
      </dd>
    </div>
  );
}

function formatDealDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[2]}.${m[3]}`;
}
