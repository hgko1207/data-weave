"use client";

import { CATEGORY_LABEL } from "./catalog";
import type { PriceData } from "./schema";

export function PriceRender({ data }: { data: PriceData }) {
  const top = data.items.slice(0, 4);
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-emerald-400">
          {data.items.length}
        </span>
        <span className="text-sm text-zinc-300">품목</span>
        <span className="text-xs text-zinc-500">
          {CATEGORY_LABEL[data.category]} · {data.cls === "wholesale" ? "도매" : "소매"}
        </span>
      </div>

      <ul className="divide-y divide-white/5">
        {top.map((it) => (
          <li key={it.id} className="flex items-baseline justify-between gap-2 py-2">
            <span className="truncate text-sm text-zinc-100">{it.itemName}</span>
            <span className="shrink-0 font-mono text-sm tabular-nums text-zinc-300">
              {it.today != null ? `${it.today.toLocaleString()}원` : "—"}
              <span className="ml-1 text-xs text-zinc-500">/{it.unit}</span>
            </span>
          </li>
        ))}
      </ul>

      {data.source === "mock" ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}
