import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";
import { bootstrapWidgets } from "@/widgets/_registry.bootstrap";
import { getWidget } from "@/widgets/_registry";
import { DashboardWidget } from "@/components/widget/DashboardWidget";
import { PageFrame } from "@/components/page-frame";
import { DashboardStats } from "@/components/dashboard-stats";
import type { WidgetConfig, WidgetInstance, WidgetStatus } from "@/widgets/_types";

export const dynamic = "force-dynamic";

bootstrapWidgets();

const DEMO_INSTANCES: WidgetInstance[] = [
  {
    id: "demo-weather",
    type: "weather",
    config: {
      v: 1,
      regionName: "대전",
      nx: 67,
      ny: 100,
      sidoName: "대전",
    } satisfies WidgetConfig,
    active: true,
  },
  {
    id: "demo-pharmacy",
    type: "pharmacy",
    config: {
      v: 1,
      sido: "대전광역시",
      sigungu: "유성구",
      lat: 36.3504,
      lng: 127.3845,
      radiusKm: 5,
    } satisfies WidgetConfig,
    active: true,
  },
  {
    id: "demo-food-recall",
    type: "food-recall",
    config: {
      v: 1,
      allergyKeywords: [],
      windowHours: 168,
    } satisfies WidgetConfig,
    active: true,
  },
];

type Loaded = {
  instance: WidgetInstance;
  status: WidgetStatus;
  data: unknown;
  error?: string;
};

async function loadInstance(instance: WidgetInstance): Promise<Loaded> {
  const widget = getWidget(instance.type);
  if (!widget) {
    return {
      instance,
      status: "error",
      data: null,
      error: `위젯을 찾을 수 없습니다: ${instance.type}`,
    };
  }
  const ctrl = new AbortController();
  try {
    const data = await widget.fetch({
      config: instance.config,
      abort: ctrl.signal,
      now: new Date(),
    });
    return { instance, status: "success", data };
  } catch (err) {
    return {
      instance,
      status: "error",
      data: null,
      error: err instanceof Error ? err.message : "알 수 없는 오류",
    };
  }
}

export default async function DashboardPage() {
  const instances = DEMO_INSTANCES.filter((i) => i.active);

  if (instances.length === 0) {
    return <EmptyState />;
  }

  const loaded = await Promise.all(instances.map(loadInstance));
  const liveCount = loaded.filter((l) => {
    if (l.status !== "success") return false;
    const data = l.data as { source?: string } | null;
    return data?.source === "live";
  }).length;

  return (
    <PageFrame
      eyebrow="dashboard"
      title="오늘의 한국 공공데이터"
      description="핀된 위젯의 현재 상태. 사이드바에서 카테고리별 상세 페이지로 이동할 수 있습니다."
      actions={
        <Link
          href="/settings"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <SettingsIcon className="h-3.5 w-3.5" />
          위젯 관리
        </Link>
      }
    >
      <DashboardStats
        widgetCount={loaded.length}
        liveCount={liveCount}
        sourceCount={4}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 lg:gap-5">
        {loaded.map((entry) => {
          const widget = getWidget(entry.instance.type);
          if (!widget) return null;
          const Render = widget.Render;
          const Icon = widget.icon;
          const title = entry.instance.config.nickname
            ? `${widget.title} · ${entry.instance.config.nickname}`
            : widget.title;
          return (
            <DashboardWidget
              key={entry.instance.id}
              icon={<Icon className="h-5 w-5" aria-hidden />}
              title={title}
              status={entry.status}
              errorMessage={entry.error}
            >
              {entry.status === "success" ? (
                <Render
                  data={entry.data}
                  status={entry.status}
                  config={entry.instance.config}
                />
              ) : null}
            </DashboardWidget>
          );
        })}
      </div>
    </PageFrame>
  );
}

function EmptyState() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
        DataWeave
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
        대시보드가 비어있어요
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        설정에서 표시할 위젯을 선택하거나 사이드바에서 카테고리를 둘러보세요.
      </p>
      <Link
        href="/settings"
        className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        <SettingsIcon className="h-4 w-4" />
        위젯 선택하기
      </Link>
    </section>
  );
}
