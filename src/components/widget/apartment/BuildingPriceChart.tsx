import { LineChart } from "lucide-react";
import { formatAmount } from "@/widgets/apartment/format";
import type { ApartmentTrade } from "@/widgets/apartment/schema";

type Props = {
  trades: ApartmentTrade[];
};

// 단지의 시간순 거래가 산점도(점) + 추세 라인.
// fetchBuilding에서 받은 trades는 최신순 정렬되어 있어 차트 그릴 때 역순으로 뒤집어 시간 흐름순으로.
export function BuildingPriceChart({ trades }: Props) {
  if (trades.length < 2) {
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
            <p className="text-sm font-medium text-zinc-100">단지 시간순 거래</p>
          </div>
        </header>
        <p className="mt-6 text-sm text-zinc-500">
          거래가 2건 이상이어야 추이를 그릴 수 있어요.
        </p>
      </article>
    );
  }

  const ordered = [...trades].sort((a, b) => a.dealDate.localeCompare(b.dealDate));
  const xs = ordered.map((t) => Date.parse(t.dealDate));
  const ys = ordered.map((t) => t.dealAmount);
  const xMin = xs[0];
  const xMax = xs[xs.length - 1];
  const xRange = Math.max(xMax - xMin, 1);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yRange = Math.max(yMax - yMin, 1);

  const W = 600;
  const H = 200;
  const PAD_L = 56;
  const PAD_R = 24;
  const PAD_TOP = 28;
  const PAD_BOTTOM = 36;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const pts = ordered.map((t, i) => {
    const x = PAD_L + (chartW * (xs[i] - xMin)) / xRange;
    const y = PAD_TOP + chartH * (1 - (ys[i] - yMin) / yRange);
    return { x, y, t };
  });

  const linePath = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");

  // 추세선 — 선형 회귀
  const n = pts.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / Math.max(n * sumX2 - sumX * sumX, 1);
  const intercept = (sumY - slope * sumX) / n;
  const trendY1 = slope * xMin + intercept;
  const trendY2 = slope * xMax + intercept;
  const ty1 = PAD_TOP + chartH * (1 - (trendY1 - yMin) / yRange);
  const ty2 = PAD_TOP + chartH * (1 - (trendY2 - yMin) / yRange);

  const trend = trendY2 - trendY1;
  const trendPct = trendY1 > 0 ? (trend / trendY1) * 100 : 0;
  const trendColor =
    Math.abs(trendPct) < 0.5 ? "text-zinc-400" : trend > 0 ? "text-rose-300" : "text-cyan-300";
  const trendLabel =
    Math.abs(trendPct) < 0.5 ? "보합" : `${trend > 0 ? "▲" : "▼"} ${Math.abs(trendPct).toFixed(1)}%`;

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <LineChart className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              가격 추이
            </p>
            <p className="text-sm font-medium text-zinc-100">
              단지 시간순 거래 · {trades.length}건
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-baseline gap-1 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs ${trendColor}`}
        >
          {trendLabel}
        </span>
      </header>

      <div className="mt-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label="단지 시간순 거래가 추이"
        >
          {/* y축 가로 그리드 — min / mid / max */}
          {[0, 0.5, 1].map((r) => {
            const y = PAD_TOP + chartH * r;
            const v = yMax - yRange * r;
            return (
              <g key={r}>
                <line
                  x1={PAD_L}
                  y1={y}
                  x2={W - PAD_R}
                  y2={y}
                  stroke="rgb(39, 39, 42)"
                  strokeDasharray="2 4"
                />
                <text
                  x={PAD_L - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-500 font-mono"
                  fontSize="10"
                >
                  {formatAmount(Math.round(v))}
                </text>
              </g>
            );
          })}

          {/* 추세선 */}
          <line
            x1={pts[0].x}
            y1={ty1}
            x2={pts[pts.length - 1].x}
            y2={ty2}
            stroke="rgb(82, 82, 91)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* 거래 점 잇는 얇은 선 */}
          <path
            d={linePath}
            fill="none"
            stroke="rgb(52, 211, 153)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />

          {/* 거래 점 */}
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="rgb(20, 20, 23)"
              stroke="rgb(52, 211, 153)"
              strokeWidth="2"
            >
              <title>
                {formatShortDate(p.t.dealDate)} · {formatAmount(p.t.dealAmount)}
                {p.t.area ? ` · ${p.t.area.toFixed(1)}㎡` : ""}
              </title>
            </circle>
          ))}

          {/* x축 양끝 날짜 라벨 */}
          <text
            x={PAD_L}
            y={H - 12}
            textAnchor="start"
            className="fill-zinc-500 font-mono"
            fontSize="10"
          >
            {formatShortDate(ordered[0].dealDate)}
          </text>
          <text
            x={W - PAD_R}
            y={H - 12}
            textAnchor="end"
            className="fill-zinc-500 font-mono"
            fontSize="10"
          >
            {formatShortDate(ordered[ordered.length - 1].dealDate)}
          </text>
        </svg>
      </div>
    </article>
  );
}

function formatShortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[1].slice(2)}.${m[2]}.${m[3]}`;
}
