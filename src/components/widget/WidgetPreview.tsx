import { bootstrapWidgets } from "@/widgets/_registry.bootstrap";
import { getWidget } from "@/widgets/_registry";
import { DashboardWidget } from "@/components/widget/DashboardWidget";
import type { WidgetConfig } from "@/widgets/_types";

bootstrapWidgets();

type Props = {
  widgetId: string;
  config: WidgetConfig;
};

export async function WidgetPreview({ widgetId, config }: Props) {
  const widget = getWidget(widgetId);
  if (!widget) {
    return (
      <p className="text-sm text-rose-400">위젯을 찾을 수 없습니다: {widgetId}</p>
    );
  }
  const ctrl = new AbortController();
  let data: unknown = null;
  let status: "success" | "error" = "success";
  let errorMessage: string | undefined;
  try {
    data = await widget.fetch({ config, abort: ctrl.signal, now: new Date() });
  } catch (err) {
    status = "error";
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
  }

  const Icon = widget.icon;
  const Render = widget.Render;

  return (
    <DashboardWidget
      icon={<Icon className="h-5 w-5" aria-hidden />}
      title={widget.title}
      status={status}
      errorMessage={errorMessage}
    >
      {status === "success" ? (
        <Render data={data} status={status} config={config} />
      ) : null}
    </DashboardWidget>
  );
}
