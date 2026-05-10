"use client";

import { WidgetErrorBoundary } from "@/components/error-boundary";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetBody } from "./WidgetBody";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { WidgetError } from "./WidgetError";
import { WidgetRefresh } from "./WidgetRefresh";
import type { WidgetStatus } from "@/widgets/_types";

type Props = {
  icon: React.ReactNode;
  title: string;
  status: WidgetStatus;
  errorMessage?: string;
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
};

export function BaseWidget({
  icon,
  title,
  status,
  errorMessage,
  onRefresh,
  children,
}: Props) {
  const health =
    status === "error" ? "error" : status === "partial" ? "warning" : "healthy";

  return (
    <article
      aria-label={`${title} 위젯`}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/55 p-6 shadow-lg shadow-black/20 backdrop-blur transition hover:border-white/10 hover:shadow-xl hover:shadow-black/30"
    >
      <WidgetHeader
        icon={icon}
        title={title}
        health={health}
        actions={onRefresh ? <WidgetRefresh onRefresh={onRefresh} spinning={status === "loading"} /> : null}
      />
      <WidgetBody>
        <WidgetErrorBoundary>
          {status === "loading" ? (
            <WidgetSkeleton />
          ) : status === "error" ? (
            <WidgetError message={errorMessage} onRetry={onRefresh} />
          ) : (
            children
          )}
        </WidgetErrorBoundary>
      </WidgetBody>
    </article>
  );
}
