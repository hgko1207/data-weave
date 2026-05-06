"use client";

import type { LucideIcon } from "lucide-react";
import { WidgetErrorBoundary } from "@/components/error-boundary";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetBody } from "./WidgetBody";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { WidgetError } from "./WidgetError";
import { WidgetRefresh } from "./WidgetRefresh";
import type { WidgetStatus } from "@/widgets/_types";

type Props = {
  icon: LucideIcon;
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
      className="rounded-xl border border-white/5 bg-zinc-900/60 p-6 shadow-md shadow-black/30 backdrop-blur transition-shadow hover:shadow-xl hover:shadow-black/40"
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
