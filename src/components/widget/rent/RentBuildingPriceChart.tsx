import { LineChart } from "lucide-react";
import { formatAmount } from "@/widgets/apartment/format";
import type { RentTrade } from "@/widgets/rent/schema";

type Props = {
  trades: RentTrade[];
};

// 단지의 시간순 보증금 추이. 전세/월세는 보증금 단위 폭이 크게 달라
// (전세 2~5억 vs 월세 1~5천만) 같은 y축에 두면 월세가 짜부됨 → 두 sub-chart로 분리.
export function RentBuildingPriceChart({ trades }: Props) {
  const jeonse = trades.filter((t) => t.type === "jeonse");
  const monthly = trades.filter((t) => t.type === "monthly");

  if (jeonse.length < 2 && monthly.length < 2) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
        <header className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <LineChart className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              보증금 추이
            </p>
            <p className="text-sm font-medium text-zinc-100">단지 시간순 거래</p>
          </div>
        </header>
        <p className="mt-6 text-sm text-zinc-500">
          종류별 거래가 2건 이상이어야 추이를 그릴 수 있어요.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
          <LineChart className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            보증금 추이
          </p>
          <p className="text-sm font-medium text-zinc-100">단지 시간순 거래</p>
        </div>
      </header>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <SubChart
          label="전세"
          tone="cyan"
          trades={jeonse}
          yValue={(t) => t.deposit}
          tooltip={(t) => `${formatShortDate(t.dealDate)} · ${formatAmount(t.deposit)}`}
        />
        <SubChart
          label="월세 보증금"
          tone="amber"
          trades={monthly}
          yValue={(t) => t.deposit}
          tooltip={(t) =>
            `${formatShortDate(t.dealDate)} · ${formatAmount(t.deposit)} / ${t.monthlyRent}만`
          }
        />
      </div>
    </article>
  );
}

const TONES = {
  cyan: {
    stroke: "rgb(34, 211, 238)",
    accent: "text-cyan-200",
    bg: "bg-cyan-500/15",
  },
  amber: {
    stroke: "rgb(251, 191, 36)",
    accent: "text-amber-200",
    bg: "bg-amber-500/15",
  },
} as const;

function SubChart({
  label,
  tone,
  trades,
  yValue,
  tooltip,
}: {
  label: string;
  tone: "cyan" | "amber";
  trades: RentTrade[];
  yValue: (t: RentTrade) => number;
  tooltip: (t: RentTrade) => string;
}) {
  const palette = TONES[tone];

  if (trades.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">{label}</p>
        <p className="mt-3 text-xs text-zinc-400">거래 없음</p>
      </div>
    );
  }
  if (trades.length === 1) {
    const t = trades[0];
    return (
      <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
          {label} · 1건
        </p>
        <p className={`mt-3 font-mono text-base font-semibold ${palette.accent}`}>
          {formatAmount(yValue(t))}
        </p>
        <p className="mt-1 font-mono text-xs text-zinc-400">
          {formatShortDate(t.dealDate)}
        </p>
      </div>
    );
  }

  const ordered = [...trades].sort((a, b) => a.dealDate.localeCompare(b.dealDate));
  const xs = ordered.map((t) => Date.parse(t.dealDate));
  const ys = ordered.map(yValue);
  const xMin = xs[0];
  const xMax = xs[xs.length - 1];
  const xRange = Math.max(xMax - xMin, 1);
  const dataYMin = Math.min(...ys);
  const dataYMax = Math.max(...ys);
  const dataYRange = Math.max(dataYMax - dataYMin, 1);
  // 점이 plot edge에 닿지 않게 위·아래 10% 패딩 (sub-chart는 작아서 살짝 더 여유).
  const yPad = dataYRange * 0.1;
  const yMin = dataYMin - yPad;
  const yMax = dataYMax + yPad;
  const yRange = yMax - yMin;

  const W = 280;
  const H = 140;
  const PAD_L = 44;
  const PAD_R = 12;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const pts = ordered.map((t, i) => {
    const x = PAD_L + (chartW * (xs[i] - xMin)) / xRange;
    const y = PAD_TOP + chartH * (1 - (ys[i] - yMin) / yRange);
    return { x, y, t };
  });
  const linePath = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");

  // y축 그리드는 실제 데이터값(dataYMin/Max) 위치에 그려서 라벨이 의미 있게.
  const gridYTop = PAD_TOP + chartH * (1 - (dataYMax - yMin) / yRange);
  const gridYBot = PAD_TOP + chartH * (1 - (dataYMin - yMin) / yRange);

  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
          {label} · {trades.length}건
        </p>
        <p className={`font-mono text-xs ${palette.accent}`}>
          {formatAmount(dataYMin)} ~ {formatAmount(dataYMax)}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block w-full" role="img" aria-label={`${label} 추이`}>
        {[
          { y: gridYTop, v: dataYMax },
          { y: gridYBot, v: dataYMin },
        ].map((g, idx) => (
          <g key={idx}>
            <line
              x1={PAD_L}
              y1={g.y}
              x2={W - PAD_R}
              y2={g.y}
              stroke="rgb(39, 39, 42)"
              strokeDasharray="2 4"
            />
            <text
              x={PAD_L - 6}
              y={g.y + 3}
              textAnchor="end"
              className="fill-zinc-500 font-mono"
              fontSize="9"
            >
              {formatAmount(Math.round(g.v))}
            </text>
          </g>
        ))}
        <path
          d={linePath}
          fill="none"
          stroke={palette.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="rgb(20, 20, 23)"
            stroke={palette.stroke}
            strokeWidth="1.5"
          >
            <title>{tooltip(p.t)}</title>
          </circle>
        ))}
        <text x={PAD_L} y={H - 8} textAnchor="start" className="fill-zinc-500 font-mono" fontSize="9">
          {formatShortDate(ordered[0].dealDate)}
        </text>
        <text x={W - PAD_R} y={H - 8} textAnchor="end" className="fill-zinc-500 font-mono" fontSize="9">
          {formatShortDate(ordered[ordered.length - 1].dealDate)}
        </text>
      </svg>
    </div>
  );
}

function formatShortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[1].slice(2)}.${m[2]}.${m[3]}`;
}
