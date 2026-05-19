import { LineChart, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import type { PriceData, RegionPrice, TrendPoint } from "@/widgets/price/schema";

export function PriceDetail({ data }: { data: PriceData }) {
  return (
    <div className="space-y-5">
      <StatsRow data={data} />
      <PriceTrendChart points={data.trend} item={data.item.name} unit={data.item.unit} />
      <RegionPriceGrid prices={data.regionPrices} unit={data.item.unit} />

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function StatsRow({ data }: { data: PriceData }) {
  const yoy = computeChangePct(data.nationwideAvg, data.nationwidePrevYear);
  const mom = computeChangePct(data.nationwideAvg, data.nationwidePrevMonth);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <StatCard
        icon={<ShoppingCart className="h-4 w-4" aria-hidden />}
        label={`전국 평균 / ${data.item.unit}`}
        value={`${data.nationwideAvg.toLocaleString()}원`}
        accent="bg-emerald-500/15 text-emerald-400"
        valueClass="text-emerald-200"
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4" aria-hidden />}
        label="전월 대비"
        value={mom.label}
        accent={mom.accent}
        valueClass={mom.valueClass}
      />
      <StatCard
        icon={<TrendingDown className="h-4 w-4" aria-hidden />}
        label="전년 동월 대비"
        value={yoy.label}
        accent={yoy.accent}
        valueClass={yoy.valueClass}
      />
    </div>
  );
}

function computeChangePct(current: number, prev: number | null): {
  label: string;
  accent: string;
  valueClass: string;
} {
  if (prev == null || prev <= 0) {
    return { label: "—", accent: "bg-zinc-800 text-zinc-300", valueClass: "text-zinc-300" };
  }
  const pct = ((current - prev) / prev) * 100;
  if (Math.abs(pct) < 0.5) {
    return {
      label: "보합",
      accent: "bg-zinc-800 text-zinc-300",
      valueClass: "text-zinc-300",
    };
  }
  return pct > 0
    ? {
        label: `▲ ${pct.toFixed(1)}%`,
        accent: "bg-rose-500/15 text-rose-400",
        valueClass: "text-rose-200",
      }
    : {
        label: `▼ ${Math.abs(pct).toFixed(1)}%`,
        accent: "bg-cyan-500/15 text-cyan-400",
        valueClass: "text-cyan-200",
      };
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

function PriceTrendChart({
  points,
  item,
  unit,
}: {
  points: TrendPoint[];
  item: string;
  unit: string;
}) {
  if (points.length < 2) return null;

  const dataMin = Math.min(...points.map((p) => p.avg));
  const dataMax = Math.max(...points.map((p) => p.avg));
  const dataRange = Math.max(dataMax - dataMin, 1);
  const yPad = dataRange * 0.12;
  const yMin = dataMin - yPad;
  const yMax = dataMax + yPad;
  const yRange = yMax - yMin;

  const W = 800;
  const H = 260;
  const PAD_X = 52;
  const PAD_TOP = 44;
  const PAD_BOTTOM = 48;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  const stepX = chartW / (points.length - 1);

  const xy = points.map((p, i) => ({
    x: PAD_X + stepX * i,
    y: PAD_TOP + chartH * (1 - (p.avg - yMin) / yRange),
    p,
  }));
  const path = xy.map((q, i) => (i === 0 ? `M ${q.x} ${q.y}` : `L ${q.x} ${q.y}`)).join(" ");

  const first = points[0].avg;
  const last = points[points.length - 1].avg;
  const trendPct = first > 0 ? ((last - first) / first) * 100 : 0;
  const trendColor =
    Math.abs(trendPct) < 0.5 ? "text-zinc-400" : trendPct > 0 ? "text-rose-300" : "text-cyan-300";
  const trendLabel =
    Math.abs(trendPct) < 0.5
      ? "보합"
      : `${trendPct > 0 ? "▲" : "▼"} ${Math.abs(trendPct).toFixed(1)}%`;

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <LineChart className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              월별 가격 추이
            </p>
            <p className="text-sm font-medium text-zinc-100">
              {item} · 최근 {points.length}개월 · /{unit}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-baseline gap-1 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs ${trendColor}`}
        >
          {trendLabel}
        </span>
      </header>

      <div className="mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="가격 추이">
          <path
            d={path}
            fill="none"
            stroke="rgb(52, 211, 153)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {xy.map((q, i) => (
            <g key={i}>
              <circle
                cx={q.x}
                cy={q.y}
                r="3.5"
                fill="rgb(20, 20, 23)"
                stroke="rgb(52, 211, 153)"
                strokeWidth="2"
              />
              <text
                x={q.x}
                y={q.y - 10}
                textAnchor="middle"
                className="fill-zinc-300 font-mono"
                fontSize="11"
              >
                {q.p.avg.toLocaleString()}
              </text>
              <text
                x={q.x}
                y={H - 12}
                textAnchor="middle"
                className="fill-zinc-500 font-mono"
                fontSize="11"
              >
                {q.p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </article>
  );
}

function RegionPriceGrid({ prices, unit }: { prices: RegionPrice[]; unit: string }) {
  if (prices.length === 0) return null;
  const overallAvg = prices.reduce((a, r) => a + r.price, 0) / prices.length;

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-100">시·도별 가격</h2>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          {prices.length}개 지역
        </p>
      </header>
      <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {prices.map((r) => {
          const vsAvgPct = ((r.price - overallAvg) / overallAvg) * 100;
          const isAbove = vsAvgPct > 0.5;
          const isBelow = vsAvgPct < -0.5;
          const tone = isAbove
            ? "text-rose-300"
            : isBelow
              ? "text-cyan-300"
              : "text-zinc-400";
          return (
            <li
              key={r.sido}
              className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3"
            >
              <p className="truncate text-xs font-medium text-zinc-400">{r.sido}</p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-zinc-100">
                {r.price.toLocaleString()}
                <span className="ml-1 text-xs text-zinc-500">원</span>
              </p>
              <p className={`mt-0.5 font-mono text-[11px] tabular-nums ${tone}`}>
                전국 평균 대비 {isAbove ? "▲" : isBelow ? "▼" : "·"} {Math.abs(vsAvgPct).toFixed(1)}%
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                / {unit}
              </p>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
