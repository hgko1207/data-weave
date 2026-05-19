import { LineChart } from "lucide-react";
import { formatAmount, supplyPyeong } from "@/widgets/apartment/format";
import type { ApartmentTrade } from "@/widgets/apartment/schema";

type Props = {
  trades: ApartmentTrade[];
};

// 같은 단지여도 평형이 다르면 가격이 1.5~2배 차이가 나기 때문에 단일 series로
// 그리면 들쭉날쭉해 가독성↓. 평형별로 series 분리 → 각 평형의 시간 흐름 가격 변화가 명확.
export function BuildingPriceChart({ trades }: Props) {
  if (trades.length < 2) {
    return (
      <ChartCard>
        <p className="mt-6 text-sm text-zinc-500">
          거래가 2건 이상이어야 추이를 그릴 수 있어요.
        </p>
      </ChartCard>
    );
  }

  const groups = buildPyeongGroups(trades);

  // y축 그리드 라벨 제거 → 좌측 padding 축소. 점 위 가격 라벨이 정보 전달.
  const W = 800;
  const H = 280;
  const PAD_L = 32;
  const PAD_R = 32;
  const PAD_TOP = 40;
  const PAD_BOTTOM = 48;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  // 전체 거래 기준 x/y 범위. y는 위·아래 8% 패딩 — 점이 plot edge에 닿아
  // 점 위 가격 라벨이 grid 라벨과 겹치는 것 방지.
  const allX = trades.map((t) => Date.parse(t.dealDate));
  const allY = trades.map((t) => t.dealAmount);
  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);
  const xRange = Math.max(xMax - xMin, 1);
  const dataYMin = Math.min(...allY);
  const dataYMax = Math.max(...allY);
  const dataYRange = Math.max(dataYMax - dataYMin, 1);
  const yPad = dataYRange * 0.08;
  const yMin = dataYMin - yPad;
  const yMax = dataYMax + yPad;
  const yRange = yMax - yMin;

  const xOf = (ts: number) => PAD_L + (chartW * (ts - xMin)) / xRange;
  const yOf = (v: number) => PAD_TOP + chartH * (1 - (v - yMin) / yRange);

  const trade0 = sortedAsc(trades)[0];
  const tradeN = sortedAsc(trades)[trades.length - 1];

  return (
    <ChartCard>
      {groups.length > 1 ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {groups.map((g) => (
            <Legend key={g.pyeong} color={g.palette.dot} label={`${g.pyeong}평형 · ${g.trades.length}건`} />
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
          {/* 평형별 series — 선 + 점. 가격 라벨은 인접 점이 가까우면 생략(thinning). */}
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
            // 라벨 thinning — 마지막으로 그린 라벨의 x와 60 미만이면 생략.
            // 단, 시리즈의 첫 점, 마지막 점, 최저/최고 점은 우선 표시.
            const minIdx = pts.reduce(
              (acc, p, i) => (p.t.dealAmount < pts[acc].t.dealAmount ? i : acc),
              0,
            );
            const maxIdx = pts.reduce(
              (acc, p, i) => (p.t.dealAmount > pts[acc].t.dealAmount ? i : acc),
              0,
            );
            const mustShow = new Set([0, pts.length - 1, minIdx, maxIdx]);
            const MIN_GAP = 60;
            let lastLabelX = -Infinity;
            const labels = pts.map((p, i) => {
              const show = mustShow.has(i) || p.x - lastLabelX > MIN_GAP;
              if (show) lastLabelX = p.x;
              return show;
            });
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
                    opacity="0.65"
                  />
                ) : null}
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill="rgb(20, 20, 23)"
                      stroke={g.palette.stroke}
                      strokeWidth="2"
                    >
                      <title>
                        {formatShortDate(p.t.dealDate)} · {formatAmount(p.t.dealAmount)} ·{" "}
                        {p.t.area.toFixed(1)}㎡ ({g.pyeong}평형)
                      </title>
                    </circle>
                    {labels[i] ? (
                      <text
                        x={p.x}
                        y={p.y - 11}
                        textAnchor="middle"
                        className={`font-mono ${g.palette.text}`}
                        fontSize="11"
                      >
                        {formatAmount(p.t.dealAmount)}
                      </text>
                    ) : null}
                  </g>
                ))}
              </g>
            );
          })}

          {/* x축 양끝 날짜 */}
          <text
            x={PAD_L}
            y={H - 12}
            textAnchor="start"
            className="fill-zinc-500 font-mono"
            fontSize="10"
          >
            {formatShortDate(trade0.dealDate)}
          </text>
          <text
            x={W - PAD_R}
            y={H - 12}
            textAnchor="end"
            className="fill-zinc-500 font-mono"
            fontSize="10"
          >
            {formatShortDate(tradeN.dealDate)}
          </text>
        </svg>
      </div>
    </ChartCard>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
          <LineChart className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            가격 추이
          </p>
          <p className="text-sm font-medium text-zinc-100">단지 시간순 · 평형별</p>
        </div>
      </header>
      {children}
    </article>
  );
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
  // 거래 많은 평형부터 색상 우선 부여
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

function formatShortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[1].slice(2)}.${m[2]}.${m[3]}`;
}
