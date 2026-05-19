"use client";

import type { PriceData } from "./schema";

export function PriceRender({ data }: { data: PriceData }) {
  const yoyPct =
    data.nationwidePrevYear && data.nationwidePrevYear > 0
      ? ((data.nationwideAvg - data.nationwidePrevYear) / data.nationwidePrevYear) * 100
      : null;
  const yoyTone =
    yoyPct == null
      ? "text-zinc-400"
      : Math.abs(yoyPct) < 0.5
        ? "text-zinc-400"
        : yoyPct > 0
          ? "text-rose-300"
          : "text-cyan-300";

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-emerald-400">
          {data.nationwideAvg.toLocaleString()}
        </span>
        <span className="text-sm text-zinc-300">원</span>
        <span className="text-xs text-zinc-500">/ {data.item.unit}</span>
      </div>
      <p className="text-sm text-zinc-300">
        {data.item.name}
        {yoyPct != null ? (
          <span className={`ml-2 font-mono text-xs ${yoyTone}`}>
            전년 동월 대비 {yoyPct > 0 ? "▲" : yoyPct < 0 ? "▼" : "·"} {Math.abs(yoyPct).toFixed(1)}%
          </span>
        ) : null}
      </p>
      {data.source === "mock" ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}
