import Link from "next/link";
import { Plus } from "lucide-react";
import { bootstrapWidgets } from "@/widgets/_registry.bootstrap";
import { getWidget } from "@/widgets/_registry";
import { DashboardWidget } from "@/components/widget/DashboardWidget";
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
    return { instance, status: "error", data: null, error: `위젯을 찾을 수 없습니다: ${instance.type}` };
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

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
    </section>
  );
}

function EmptyState() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
        DataWeave
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
        어떤 데이터를 받아볼까요?
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        날씨, SOS 병원, 식품 리콜. 한국 공공데이터 위젯을 한 화면에 모아보세요.
      </p>
      <Link
        href="/catalog"
        className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        <Plus className="h-4 w-4" />첫 위젯 추가
      </Link>
    </section>
  );
}
