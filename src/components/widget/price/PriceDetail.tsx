import { ShoppingCart } from "lucide-react";
import { CATEGORY_LABEL } from "@/widgets/price/catalog";
import type { PriceData, PriceItem } from "@/widgets/price/schema";

export function PriceDetail({ data }: { data: PriceData }) {
  return (
    <div className="space-y-5">
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-base font-semibold text-zinc-100">
              {CATEGORY_LABEL[data.category]} {data.cls === "wholesale" ? "도매" : "소매"}가
            </h2>
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
              {data.regday} 기준
            </span>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
            {data.items.length}품목
          </p>
        </header>

        {data.items.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
            <p className="mt-3 text-base font-medium text-zinc-100">가격 정보가 없어요</p>
            <p className="mt-1 text-xs text-zinc-500">
              주말·공휴일은 데이터가 없을 수 있어요. 다른 부류를 선택해보세요.
            </p>
          </div>
        ) : (
          <>
            {/* 컬럼 헤더 — 데스크탑 */}
            <div className="hidden grid-cols-[1fr_90px_110px_90px_90px] items-center gap-4 border-b border-zinc-800/80 px-6 py-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500 md:grid">
              <span>품목·품종</span>
              <span className="text-right">단위</span>
              <span className="text-right">당일가</span>
              <span className="text-right">전일比</span>
              <span className="text-right">1주前比</span>
            </div>
            <ul className="divide-y divide-zinc-800/60">
              {data.items.map((it) => (
                <PriceRow key={it.id} item={it} />
              ))}
            </ul>
          </>
        )}
      </article>

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · 한국에서 접속 시 KAMIS 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function PriceRow({ item }: { item: PriceItem }) {
  const vsDay = changePct(item.today, item.prevDay);
  const vsWeek = changePct(item.today, item.prevWeek);
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 px-6 py-3.5 transition hover:bg-zinc-800/40 md:grid-cols-[1fr_90px_110px_90px_90px] md:gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="text-base font-medium text-zinc-100">{item.itemName}</h3>
          <span className="font-mono text-xs text-zinc-500">{item.kindName}</span>
          {item.rank !== "상품" ? (
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
              {item.rank}
            </span>
          ) : null}
        </div>
        {/* 모바일: 단위 + 변동 인라인 */}
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] tabular-nums text-zinc-500 md:hidden">
          <span>/{item.unit}</span>
          {vsDay ? (
            <>
              <span className="text-zinc-700">·</span>
              <span className={vsDay.tone}>전일 {vsDay.label}</span>
            </>
          ) : null}
        </p>
      </div>

      <span className="hidden text-right font-mono text-xs text-zinc-500 md:block">
        {item.unit}
      </span>

      <p className="text-right font-mono text-base font-semibold tabular-nums text-zinc-100">
        {item.today != null ? `${item.today.toLocaleString()}` : "—"}
        <span className="ml-0.5 text-[11px] font-normal text-zinc-500">
          {item.today != null ? "원" : ""}
        </span>
      </p>

      <p className={`hidden text-right font-mono text-xs tabular-nums md:block ${vsDay?.tone ?? "text-zinc-600"}`}>
        {vsDay ? vsDay.label : "—"}
      </p>
      <p className={`hidden text-right font-mono text-xs tabular-nums md:block ${vsWeek?.tone ?? "text-zinc-600"}`}>
        {vsWeek ? vsWeek.label : "—"}
      </p>
    </li>
  );
}

function changePct(
  current: number | null,
  prev: number | null,
): { label: string; tone: string } | null {
  if (current == null || prev == null || prev <= 0) return null;
  const pct = ((current - prev) / prev) * 100;
  if (Math.abs(pct) < 0.05) return { label: "0.0%", tone: "text-zinc-400" };
  return pct > 0
    ? { label: `▲${pct.toFixed(1)}%`, tone: "text-rose-300" }
    : { label: `▼${Math.abs(pct).toFixed(1)}%`, tone: "text-cyan-300" };
}
