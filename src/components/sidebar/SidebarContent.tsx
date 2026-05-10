"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings } from "lucide-react";
import { WIDGET_META } from "@/widgets/_metadata";

type Props = { onNavigate?: () => void };

type NavItem = { href: string; icon: LucideIcon; label: string };

const PRIMARY: NavItem[] = [
  { href: "/", icon: LayoutDashboard, label: "대시보드" },
];

const SECONDARY: NavItem[] = [
  { href: "/settings", icon: Settings, label: "설정" },
];

export function SidebarContent({ onNavigate }: Props) {
  const widgetItems: NavItem[] = WIDGET_META.map((w) => ({
    href: `/w/${w.id}`,
    icon: w.icon,
    label: w.title,
  }));

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="DataWeave 홈"
        className="flex h-16 items-center gap-1.5 border-b border-white/5 px-5"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/60" />
        <span className="text-base font-semibold tracking-tight text-zinc-100">
          DataWeave
        </span>
      </Link>

      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <NavSection items={PRIMARY} onNavigate={onNavigate} />
        <NavSection title="공공데이터" items={widgetItems} onNavigate={onNavigate} />
        <div className="mt-auto">
          <NavSection items={SECONDARY} onNavigate={onNavigate} />
        </div>
      </nav>
    </div>
  );
}

function NavSection({
  title,
  items,
  onNavigate,
}: {
  title?: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="mb-4">
      {title ? (
        <p className="mb-1.5 px-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {title}
        </p>
      ) : null}
      <ul className="space-y-0.5">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
