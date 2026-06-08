import { TrendingUp } from "lucide-react";
import { formatAmount } from "@/widgets/apartment/format";
import type { MonthlyTrendPoint } from "@/widgets/apartment/fetch";

export function ApartmentTrendChart({
  points,
  region,
}: {
  points: MonthlyTrendPoint[];
  region: string;
}) {
  const valid = points.filter((p) => p.avg != null) as Array<MonthlyTrendPoint & { avg: number }>;

  if (valid.length === 0) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
        <header className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              월별 평균가 추이
            </p>
            <p className="text-sm font-medium text-zinc-100">{region}</p>
          </div>
        </header>
        <p className="mt-6 text-sm text-zinc-500">최근 거래 데이터가 부족해요.</p>
      </article>
    );
  }

  const dataMin = Math.min(...valid.map((p) => p.avg));
  const dataMax = Math.max(...valid.map((p) => p.avg));
  const dataRange = Math.max(dataMax - dataMin, 1);
  // 점이 chart 가장자리에 닿으면 점 위 값 라벨이 y축 그리드 라벨과 같은 영역에서 겹쳐
  // 가독성↓. 위·아래 8% 패딩으로 점을 plot area 안쪽에만 두기.
  const yPad = dataRange * 0.08;
  const min = dataMin - yPad;
  const max = dataMax + yPad;
  const range = max - min;

  const W = 800;
  const H = 260;
  const PAD_X = 52;
  const PAD_TOP = 40;
  const PAD_BOTTOM = 48;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  const stepX = points.length > 1 ? chartW / (points.length - 1) : chartW / 2;

  const pointsXY = points.map((p, i) => {
    const x = PAD_X + stepX * i;
    if (p.avg == null) return { x, y: null, p };
    const y = PAD_TOP + chartH * (1 - (p.avg - min) / range);
    return { x, y, p };
  });

  // line path skipping null gaps
  const lineSegments: string[] = [];
  let current = "";
  for (const pt of pointsXY) {
    if (pt.y == null) {
      if (current) {
        lineSegments.push(current);
        current = "";
      }
      continue;
    }
    current += current === "" ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`;
  }
  if (current) lineSegments.push(current);

  // area path (only first contiguous segment for simplicity)
  let areaPath = "";
  const firstSegmentPoints = pointsXY.filter(
    (pt, idx, arr) =>
      pt.y != null &&
      (idx === 0 || arr[idx - 1].y != null) &&
      lineSegments[0]?.includes(`${pt.x} ${pt.y}`),
  );
  if (firstSegmentPoints.length >= 2) {
    const first = firstSegmentPoints[0];
    const last = firstSegmentPoints[firstSegmentPoints.length - 1];
    areaPath = `${lineSegments[0]} L ${last.x} ${PAD_TOP + chartH} L ${first.x} ${PAD_TOP + chartH} Z`;
  }

  const trend = valid.length >= 2 ? valid[valid.length - 1].avg - valid[0].avg : 0;
  const trendPct = valid[0].avg > 0 ? (trend / valid[0].avg) * 100 : 0;
  const trendColor =
    Math.abs(trendPct) < 0.5
      ? "text-zinc-400"
      : trend > 0
      ? "text-rose-300"
      : "text-cyan-300";
  const trendLabel =
    Math.abs(trendPct) < 0.5
      ? "보합"
      : `${trend > 0 ? "▲" : "▼"} ${Math.abs(trendPct).toFixed(1)}%`;

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              월별 평균가 추이
            </p>
            <p className="text-sm font-medium text-zinc-100">
              {region} · 최근 {points.length}개월
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-baseline gap-1 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs ${trendColor}`}
        >
          {trendLabel}
        </span>
      </header>

      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block min-w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${region} 월별 평균가 추이`}
        >
          <defs>
            <linearGradient id="apt-trend-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {areaPath ? <path d={areaPath} fill="url(#apt-trend-area)" /> : null}
          {lineSegments.map((seg, i) => (
            <path
              key={i}
              d={seg}
              fill="none"
              stroke="rgb(52, 211, 153)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {pointsXY.map((pt, i) =>
            pt.y != null ? (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="3.5" fill="rgb(20, 20, 23)" stroke="rgb(52, 211, 153)" strokeWidth="2" />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  className="fill-zinc-300 font-mono"
                  fontSize="11"
                >
                  {formatAmount(pt.p.avg)}
                </text>
              </g>
            ) : null,
          )}
          {pointsXY.map((pt, i) => (
            <text
              key={`label-${i}`}
              x={pt.x}
              y={H - 8}
              textAnchor="middle"
              className={pt.y == null ? "fill-zinc-700" : "fill-zinc-500"}
              fontSize="11"
            >
              {pt.p.label}
              {pt.y == null ? " (—)" : ""}
            </text>
          ))}
        </svg>
      </div>
    </article>
  );
}
