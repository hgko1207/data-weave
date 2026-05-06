"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { BaseWidget } from "./BaseWidget";
import type { WidgetStatus } from "@/widgets/_types";

type Props = {
  icon: React.ReactNode;
  title: string;
  status: WidgetStatus;
  errorMessage?: string;
  children: React.ReactNode;
};

export function DashboardWidget({
  icon,
  title,
  status,
  errorMessage,
  children,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <BaseWidget
      icon={icon}
      title={title}
      status={pending ? "loading" : status}
      errorMessage={errorMessage}
      onRefresh={() => startTransition(() => router.refresh())}
    >
      {children}
    </BaseWidget>
  );
}
