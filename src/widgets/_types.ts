import type { LucideIcon } from "lucide-react";
import type { FC } from "react";

export type WidgetStatus = "loading" | "success" | "error" | "partial";

export type WidgetConfig = {
  v: 1;
  nickname?: string;
  [key: string]: unknown;
};

export type WidgetContext = {
  config: WidgetConfig;
  abort: AbortSignal;
  now: Date;
};

export type WidgetCategory = "view";

export interface Widget<TData = unknown> {
  readonly id: string;
  readonly title: string;
  readonly icon: LucideIcon;
  readonly category: WidgetCategory;

  fetch(ctx: WidgetContext): Promise<TData>;

  Render: FC<{
    data: TData;
    status: WidgetStatus;
    config: WidgetConfig;
  }>;

  ConfigForm?: FC<{
    value: WidgetConfig;
    onChange: (v: WidgetConfig) => void;
  }>;
}

export type WidgetInstance = {
  id: string;
  type: string;
  config: WidgetConfig;
  active: boolean;
};
