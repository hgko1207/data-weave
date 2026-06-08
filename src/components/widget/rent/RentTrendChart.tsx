import { TrendingUp } from "lucide-react";
import { formatAmount } from "@/widgets/apartment/format";
import type { RentMonthlyTrendPoint } from "@/widgets/rent/fetch";

type Props = {
  points: RentMonthlyTrendPoint[];
  region: string;
};

// 전월세 시·군·구 평균 보증금 월별 추이.
// 전세(cyan) / 월세(amber) 두 시리즈를 한 차트에 겹쳐서. 단위가 비슷한 만원 기반이라
// 같은 y축이지만 보통 전세가 5~10배 커서 월세는 아래쪽에 깔리는데, 매매 차트와 달리 두
// 시리즈가 비교 정보로 가치 있어 단일 차트로 유지.
export function RentTrendChart({ points, region }: Props) {
  const validJ = points
    .map((p, i) => ({ i, avg: p.avgJeonse, label: p.label }))
    .filter((p): p is { i: number; avg: number; label: string } => p.avg != null);
  const validM = points
    .map((p, i) => ({ i, avg: p.avgMonthly, label: p.label }))
    .filter((p): p is { i: number; avg: number; label: string } => p.avg != null);

  if (validJ.length === 0 && validM.length === 0) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
        <header className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              월별 평균 보증금 추이
            </p>
            <p className="text-sm font-medium text-zinc-100">{region}</p>
          </div>
        </header>
        <p className="mt-6 text-sm text-zinc-500">최근 거래 데이터가 부족해요.</p>
      </article>
    );
  }

  const allValues = [...validJ.map((p) => p.avg), ...validM.map((p) => p.avg)];
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const dataRange = Math.max(dataMax - dataMin, 1);
  // 점이 chart 위/아래 가장자리에 닿으면 y축 그리드 라벨·점 위 값 라벨이 같은 영역에서
  // 겹쳐 가독성↓. yRange에 위·아래 8% 패딩을 줘서 점이 plot area 안쪽에만 위치.
  const yPad = dataRange * 0.08;
  const yMin = dataMin - yPad;
  const yMax = dataMax + yPad;
  const yRange = yMax - yMin;

  // y축 그리드 라벨을 제거(아파트 트렌드 차트 톤과 통일) — 좌측 padding 축소.
  const W = 800;
  const H = 300;
  const PAD_L = 32;
  const PAD_R = 32;
  const PAD_TOP = 44;
  const PAD_BOTTOM = 64;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  const stepX = points.length > 1 ? chartW / (points.length - 1) : chartW / 2;

  const xOf = (i: number) => PAD_L + stepX * i;
  const yOf = (v: number) => PAD_TOP + chartH * (1 - (v - yMin) / yRange);

  const jPath = buildPath(validJ.map((p) => ({ x: xOf(p.i), y: yOf(p.avg) })));
  const mPath = buildPath(validM.map((p) => ({ x: xOf(p.i), y: yOf(p.avg) })));

  // 추세 — 양 끝 평균값 변화 (전세 우선, 없으면 월세)
  const primary = validJ.length >= 2 ? validJ : validM.length >= 2 ? validM : null;
  let trendLabel = "—";
  let trendColor = "text-zinc-400";
  if (primary) {
    const first = primary[0].avg;
    const last = primary[primary.length - 1].avg;
    const pct = first > 0 ? ((last - first) / first) * 100 : 0;
    const tone = primary === validJ ? "전세" : "월세";
    if (Math.abs(pct) < 0.5) {
      trendLabel = `${tone} 보합`;
    } else {
      trendColor = last > first ? "text-rose-300" : "text-cyan-300";
      trendLabel = `${tone} ${last > first ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}%`;
    }
  }

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              월별 평균 보증금 추이
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

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Legend tone="cyan" label="전세 평균" />
        <Legend tone="amber" label="월세 보증금 평균" />
      </div>

      <div className="mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label={`${region} 전월세 월별 평균 보증금 추이`}
        >
          {/* 전세 선 + 점 */}
          {jPath ? (
            <path
              d={jPath}
              fill="none"
              stroke="rgb(34, 211, 238)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {validJ.map((p) => (
            <g key={`j-${p.i}`}>
              <circle
                cx={xOf(p.i)}
                cy={yOf(p.avg)}
                r="3.5"
                fill="rgb(20, 20, 23)"
                stroke="rgb(34, 211, 238)"
                strokeWidth="2"
              />
              <text
                x={xOf(p.i)}
                y={yOf(p.avg) - 10}
                textAnchor="middle"
                className="fill-cyan-200 font-mono"
                fontSize="11"
              >
                {formatAmount(p.avg)}
              </text>
            </g>
          ))}

          {/* 월세 보증금 선 + 점 */}
          {mPath ? (
            <path
              d={mPath}
              fill="none"
              stroke="rgb(251, 191, 36)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {validM.map((p) => (
            <g key={`m-${p.i}`}>
              <circle
                cx={xOf(p.i)}
                cy={yOf(p.avg)}
                r="3.5"
                fill="rgb(20, 20, 23)"
                stroke="rgb(251, 191, 36)"
                strokeWidth="2"
              />
              <text
                x={xOf(p.i)}
                y={yOf(p.avg) + 16}
                textAnchor="middle"
                className="fill-amber-200 font-mono"
                fontSize="11"
              >
                {formatAmount(p.avg)}
              </text>
            </g>
          ))}

          {/* x축 월 라벨 */}
          {points.map((p, i) => (
            <text
              key={`label-${i}`}
              x={xOf(i)}
              y={H - 12}
              textAnchor="middle"
              className="fill-zinc-500 font-mono"
              fontSize="11"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </article>
  );
}

function buildPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return "";
  return pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
}

function Legend({ tone, label }: { tone: "cyan" | "amber"; label: string }) {
  const color = tone === "cyan" ? "bg-cyan-400" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="font-mono text-xs text-zinc-400">{label}</span>
    </div>
  );
}
