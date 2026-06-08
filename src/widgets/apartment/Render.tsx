"use client";

import type { ApartmentData } from "./schema";
import { formatYm } from "./fetch";
import { formatAmount } from "./format";

export function ApartmentRender({ data }: { data: ApartmentData }) {
  if (data.trades.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-semibold text-zinc-200">
            0
          </span>
          <span className="text-sm text-zinc-400">건 / {formatYm(data.dealYm)}</span>
        </div>
        <p className="text-sm text-zinc-500">{data.region} 거래 없음</p>
        {data.source === "mock" ? <MockBadge /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
          {data.region} · {formatYm(data.dealYm)}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-zinc-100">
            {formatAmount(data.avgAmount)}
          </span>
          <span className="text-sm text-zinc-400">평균</span>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-x-4 text-sm">
        <Stat label="중간" value={formatAmount(data.medianAmount)} />
        <Stat label="최저" value={formatAmount(data.minAmount)} accent="text-cyan-300" />
        <Stat label="최고" value={formatAmount(data.maxAmount)} accent="text-rose-300" />
      </dl>

      <p className="font-mono text-xs text-zinc-400">
        총 거래 <span className="text-zinc-200">{data.totalCount}</span>건
      </p>

      {data.source === "mock" ? <MockBadge /> : null}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-zinc-400">{label}</dt>
      <dd className={`font-mono text-base font-medium ${accent ?? "text-zinc-100"}`}>
        {value}
      </dd>
    </div>
  );
}

function MockBadge() {
  return (
    <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
      mock · API 키 등록 시 실 데이터로 전환
    </p>
  );
}
