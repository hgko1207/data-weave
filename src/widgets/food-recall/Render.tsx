"use client";

import type { FoodRecallData, RecallItem } from "./schema";

export function FoodRecallRender({ data }: { data: FoodRecallData }) {
  const hasFilter = data.filteredTotal !== data.total;

  if (data.filteredTotal === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-emerald-400">0</span>
          <span className="text-sm text-zinc-300">건</span>
        </div>
        <p className="text-sm text-zinc-400">
          최근 <span className="font-mono text-zinc-300">{data.windowHours}시간</span>{" "}
          {hasFilter ? "내 키워드 매칭 리콜이 없어요." : "내 새 리콜이 없어요. 안심 ✅"}
        </p>
        {data.source === "mock" ? <MockBadge /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-amber-400">
          {data.filteredTotal}
        </span>
        <span className="text-sm text-zinc-300">건</span>
        <span className="text-xs text-zinc-400">
          / 전체 <span className="font-mono">{data.total}</span> · 최근{" "}
          <span className="font-mono">{data.windowHours}시간</span>
        </span>
      </div>

      {data.matchedKeywords.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {data.matchedKeywords.map((kw) => (
            <span
              key={kw}
              className="rounded bg-amber-950/30 px-1.5 py-0.5 font-mono text-xs text-amber-300"
            >
              {kw}
            </span>
          ))}
        </div>
      ) : null}

      <ul className="divide-y divide-white/5">
        {data.items.slice(0, 5).map((it) => (
          <RecallRow key={it.id} item={it} />
        ))}
      </ul>

      {data.source === "mock" ? <MockBadge /> : null}
    </div>
  );
}

function RecallRow({ item }: { item: RecallItem }) {
  return (
    <li className="py-2.5">
      <p className="text-sm font-medium text-zinc-100">{item.productName}</p>
      <p className="text-xs text-zinc-400">
        {item.company} · <span className="font-mono">{formatDate(item.recallDate)}</span>
      </p>
      <p className="mt-1 text-xs text-amber-300/90">{item.reason}</p>
    </li>
  );
}

function formatDate(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function MockBadge() {
  return (
    <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
      mock · API 키 등록 시 실 데이터로 전환
    </p>
  );
}
