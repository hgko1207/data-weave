"use client";

import { formatAmount } from "@/widgets/apartment/format";
import { formatYm } from "@/widgets/apartment/fetch";
import type { RentData } from "./schema";

export function RentRender({ data }: { data: RentData }) {
  if (data.trades.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-semibold text-zinc-200">0</span>
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
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          {data.region} · {formatYm(data.dealYm)}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-zinc-100">
            {data.totalCount}
          </span>
          <span className="text-sm text-zinc-400">건</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Stat
          label="전세 평균"
          value={formatAmount(data.avgJeonseDeposit)}
          count={data.jeonseCount}
          accent="text-cyan-300"
        />
        <Stat
          label="월세 평균"
          value={
            data.avgMonthlyRent != null
              ? `${formatAmount(data.avgMonthlyDeposit)} / ${data.avgMonthlyRent}만`
              : "—"
          }
          count={data.monthlyCount}
          accent="text-amber-300"
        />
      </dl>

      {data.source === "mock" ? <MockBadge /> : null}
    </div>
  );
}

function Stat({
  label,
  value,
  count,
  accent,
}: {
  label: string;
  value: string;
  count: number;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-zinc-500">
        {label} <span className="font-mono text-zinc-500">({count})</span>
      </dt>
      <dd className={`font-mono text-base font-medium ${accent}`}>{value}</dd>
    </div>
  );
}

function MockBadge() {
  return (
    <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
      mock · API 키 등록 시 실 데이터로 전환
    </p>
  );
}
