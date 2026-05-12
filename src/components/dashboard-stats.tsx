import { Activity, Boxes, Clock4, Database } from "lucide-react";

type Props = {
  widgetCount: number;
  liveCount: number;
  sourceCount: number;
};

export function DashboardStats({ widgetCount, liveCount, sourceCount }: Props) {
  const items = [
    {
      icon: Boxes,
      label: "표시 중인 위젯",
      value: widgetCount,
      hint: "사이드바에서 카테고리별 상세 보기",
    },
    {
      icon: Activity,
      label: "실시간 동기화",
      value: `${liveCount}/${widgetCount}`,
      hint: liveCount === widgetCount ? "전부 정상" : "일부 mock 폴백",
      highlight: liveCount === widgetCount,
    },
    {
      icon: Database,
      label: "연결된 데이터 소스",
      value: sourceCount,
      hint: "KMA · AirKorea · E-Gen · MFDS",
    },
    {
      icon: Clock4,
      label: "마지막 갱신",
      value: "지금",
      hint: "새로고침 클릭 시 즉시 갱신",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {items.map((it) => (
        <article
          key={it.label}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-4"
        >
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className={`flex h-9 w-9 items-center justify-center rounded-md ${
                it.highlight ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              <it.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-zinc-300">{it.label}</span>
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-zinc-100">
            {it.value}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{it.hint}</p>
        </article>
      ))}
    </div>
  );
}
