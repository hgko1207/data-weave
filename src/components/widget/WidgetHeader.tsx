import type { LucideIcon } from "lucide-react";
import { WidgetHealthDot } from "./WidgetHealthDot";

type Props = {
  icon: LucideIcon;
  title: string;
  health: "healthy" | "warning" | "error";
  actions?: React.ReactNode;
};

export function WidgetHeader({ icon: Icon, title, health, actions }: Props) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-emerald-400" aria-hidden />
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <WidgetHealthDot status={health} />
        {actions}
      </div>
    </header>
  );
}
