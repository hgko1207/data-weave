import { WidgetHealthDot } from "./WidgetHealthDot";

type Props = {
  icon: React.ReactNode;
  title: string;
  health: "healthy" | "warning" | "error";
  actions?: React.ReactNode;
};

export function WidgetHeader({ icon, title, health, actions }: Props) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-emerald-400" aria-hidden>
          {icon}
        </span>
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <WidgetHealthDot status={health} />
        {actions}
      </div>
    </header>
  );
}
