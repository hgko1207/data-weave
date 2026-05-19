import { LineChart } from "lucide-react";
import { formatAmount, supplyPyeong } from "@/widgets/apartment/format";
import type { ApartmentTrade } from "@/widgets/apartment/schema";

type Props = {
  trades: ApartmentTrade[];
};

// 같은 단지여도 평형이 다르면 가격이 1.5~2배 차이가 나기 때문에 단일 series로
// 그리면 들쭉날쭉해 가독성↓. 평형별로 series 분리.
export function BuildingPriceChart({ trades }: Props) {
  if (trades.length < 2) {
    return (
      <ChartCard subLabel="">
        <p className="mt-6 text-sm text-zinc-500">
          거래가 2건 이상이어야 추이를 그릴 수 있어요.
        </p>
      </ChartCard>
    );
  }

  const groups = buildPyeongGroups(trades);

  const W = 800;
  const H = 300;
  const PAD_L = 32;
  const PAD_R = 32;
  const PAD_TOP = 40;
  const PAD_BOTTOM = 62;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const allX = trades.map((t) => Date.parse(t.dealDate));
  const allY = trades.map((t) => t.dealAmount);
  const dataXMin = Math.min(...allX);
  const dataXMax = Math.max(...allX);
  // x range를 거래 첫 월의 1일부터 마지막 월의 다음 달 1일까지로 확장 →
  // 월 grid를 자연스럽게 그릴 수 있고, 점이 좌우 가장자리에 닿지 않음.
  const xMin = startOfMonth(dataXMin);
  const xMax = startOfNextMonth(dataXMax);
  const xRange = Math.max(xMax - xMin, 1);

  const dataYMin = Math.min(...allY);
  const dataYMax = Math.max(...allY);
  const dataYRange = Math.max(dataYMax - dataYMin, 1);
  // 위·아래 12% 패딩 — 점이 plot edge에서 더 떨어져 가격/날짜 라벨 공간 확보.
  const yPad = dataYRange * 0.12;
  const yMin = dataYMin - yPad;
  const yMax = dataYMax + yPad;
  const yRange = yMax - yMin;

  const xOf = (ts: number) => PAD_L + (chartW * (ts - xMin)) / xRange;
  const yOf = (v: number) => PAD_TOP + chartH * (1 - (v - yMin) / yRange);

  // 월별 vertical tick (각 월의 1일)
  const monthTicks = collectMonthTicks(xMin, xMax);

  // 헤더 trend — 거래 가장 많은 평형(=groups[0])의 첫·마지막 가격 변화율
  const trend = computeTrend(groups[0].trades);

  return (
    <ChartCard
      subLabel={`최근 거래 ${trades.length}건 · 평형별 가격`}
      trend={trend}
    >
      {groups.length > 1 ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {groups.map((g) => (
            <Legend
              key={g.pyeong}
              color={g.palette.dot}
              label={`${g.pyeong}평형 · ${g.trades.length}건`}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label="단지 시간순 거래가 추이"
        >
          {/* 월 단위 vertical grid + 월 라벨 */}
          {monthTicks.map((tick) => {
            const x = xOf(tick.ts);
            return (
              <g key={tick.ts}>
                <line
                  x1={x}
                  y1={PAD_TOP}
                  x2={x}
                  y2={PAD_TOP + chartH}
                  stroke="rgb(39, 39, 42)"
                  strokeDasharray="2 4"
                />
                <text
                  x={x}
                  y={PAD_TOP + chartH + 16}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono"
                  fontSize="10"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* 평형별 series. 정보 위계:
              - 점 = 데이터 (강조)
              - 선 = 트렌드 가이드 (약화, opacity 0.4)
              - 라벨 = 핵심 점에만 (첫·마지막·최저·최고). 나머지는 hover로.
              핵심만 라벨링해서 시각적 noise↓, 트렌드는 라인이 보여줌. */}
          {groups.map((g) => {
            const orderedTrades = sortedAsc(g.trades);
            const pts = orderedTrades.map((t) => ({
              x: xOf(Date.parse(t.dealDate)),
              y: yOf(t.dealAmount),
              t,
            }));
            const linePath =
              pts.length >= 2
                ? pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ")
                : null;

            // 라벨 대상 — 핵심 점만. 단, 핵심 점끼리도 너무 가까우면 안 그림.
            const minIdx = pts.reduce(
              (acc, p, i) => (p.t.dealAmount < pts[acc].t.dealAmount ? i : acc),
              0,
            );
            const maxIdx = pts.reduce(
              (acc, p, i) => (p.t.dealAmount > pts[acc].t.dealAmount ? i : acc),
              0,
            );
            const keySet = new Set([0, pts.length - 1, minIdx, maxIdx]);
            const keyIdxs = [...keySet].sort((a, b) => a - b);
            const showLabel = pts.map(() => false);
            let lastLabelX = -Infinity;
            for (const i of keyIdxs) {
              if (pts[i].x - lastLabelX > 56) {
                showLabel[i] = true;
                lastLabelX = pts[i].x;
              }
            }

            return (
              <g key={g.pyeong}>
                {linePath ? (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={g.palette.stroke}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.4"
                  />
                ) : null}
                {pts.map((p, i) => {
                  const isKey = showLabel[i];
                  return (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isKey ? 4 : 3}
                        fill={isKey ? g.palette.stroke : "rgb(20, 20, 23)"}
                        stroke={g.palette.stroke}
                        strokeWidth={isKey ? 2 : 1.5}
                        opacity={isKey ? 1 : 0.75}
                      >
                        <title>
                          {formatShortDate(p.t.dealDate)} · {formatAmount(p.t.dealAmount)} ·{" "}
                          {p.t.area.toFixed(1)}㎡ ({g.pyeong}평형)
                        </title>
                      </circle>
                      {isKey ? (
                        <>
                          <text
                            x={p.x}
                            y={p.y - 12}
                            textAnchor="middle"
                            className={`font-mono ${g.palette.text}`}
                            fontSize="11"
                          >
                            {formatAmount(p.t.dealAmount)}
                          </text>
                          <text
                            x={p.x}
                            y={p.y + 16}
                            textAnchor="middle"
                            className="fill-zinc-500 font-mono"
                            fontSize="9"
                          >
                            {formatMonthDay(p.t.dealDate)}
                          </text>
                        </>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </ChartCard>
  );
}

function ChartCard({
  subLabel,
  trend,
  children,
}: {
  subLabel: string;
  trend?: TrendResult;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <LineChart className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              거래 가격 흐름
            </p>
            {subLabel ? (
              <p className="text-sm font-medium text-zinc-100">{subLabel}</p>
            ) : null}
          </div>
        </div>
        {trend ? (
          <span
            className={`inline-flex items-baseline gap-1 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs ${trend.color}`}
          >
            {trend.label}
          </span>
        ) : null}
      </header>
      {children}
    </article>
  );
}

type TrendResult = { label: string; color: string };

function computeTrend(trades: ApartmentTrade[]): TrendResult | undefined {
  if (trades.length < 2) return undefined;
  const ordered = sortedAsc(trades);
  const first = ordered[0].dealAmount;
  const last = ordered[ordered.length - 1].dealAmount;
  if (first <= 0) return undefined;
  const pct = ((last - first) / first) * 100;
  if (Math.abs(pct) < 0.5) {
    return { label: "보합", color: "text-zinc-400" };
  }
  return {
    label: `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}%`,
    color: pct > 0 ? "text-rose-300" : "text-cyan-300",
  };
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="font-mono text-xs text-zinc-400">{label}</span>
    </div>
  );
}

// 거래량 많은 평형에 더 눈에 띄는 색을 줘서 dominant series가 emerald.
const PALETTE = [
  { stroke: "rgb(52, 211, 153)", text: "fill-emerald-200", dot: "bg-emerald-400" },
  { stroke: "rgb(34, 211, 238)", text: "fill-cyan-200", dot: "bg-cyan-400" },
  { stroke: "rgb(251, 191, 36)", text: "fill-amber-200", dot: "bg-amber-400" },
  { stroke: "rgb(244, 114, 182)", text: "fill-pink-200", dot: "bg-pink-400" },
  { stroke: "rgb(167, 139, 250)", text: "fill-violet-200", dot: "bg-violet-400" },
] as const;

type Palette = (typeof PALETTE)[number];

type PyeongGroup = {
  pyeong: number;
  trades: ApartmentTrade[];
  palette: Palette;
};

function buildPyeongGroups(trades: ApartmentTrade[]): PyeongGroup[] {
  const byPyeong = new Map<number, ApartmentTrade[]>();
  for (const t of trades) {
    if (!Number.isFinite(t.area) || t.area <= 0) continue;
    const p = Math.round(supplyPyeong(t.area));
    const cur = byPyeong.get(p);
    if (cur) cur.push(t);
    else byPyeong.set(p, [t]);
  }
  const sorted = [...byPyeong.entries()].sort(([, a], [, b]) => b.length - a.length);
  return sorted.map(([pyeong, ts], i) => ({
    pyeong,
    trades: ts,
    palette: PALETTE[i % PALETTE.length],
  }));
}

function sortedAsc(trades: ApartmentTrade[]): ApartmentTrade[] {
  return [...trades].sort((a, b) => a.dealDate.localeCompare(b.dealDate));
}

function startOfMonth(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function startOfNextMonth(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
}

function collectMonthTicks(xMin: number, xMax: number): Array<{ ts: number; label: string }> {
  const ticks: Array<{ ts: number; label: string }> = [];
  const start = new Date(xMin);
  const end = new Date(xMax);
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur.getTime() <= end.getTime()) {
    ticks.push({
      ts: cur.getTime(),
      label: `${cur.getMonth() + 1}월`,
    });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return ticks;
}

function formatShortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[1].slice(2)}.${m[2]}.${m[3]}`;
}

function formatMonthDay(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[2]}.${m[3]}`;
}
