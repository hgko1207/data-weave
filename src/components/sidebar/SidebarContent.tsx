"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings, Activity } from "lucide-react";
import { WIDGET_META } from "@/widgets/_metadata";

type NavItem = { href: string; icon: LucideIcon; label: string };

const PRIMARY: NavItem[] = [
  { href: "/", icon: LayoutDashboard, label: "대시보드" },
];

const SECONDARY: NavItem[] = [
  { href: "/settings", icon: Settings, label: "설정" },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
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
        className="group flex items-center gap-2.5 border-b border-zinc-800/80 px-4 py-4 transition hover:bg-zinc-800/40"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_12px_-2px_rgba(16,185,129,0.45)]"
        >
          <span className="font-mono text-sm font-bold text-emerald-950">D</span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            DataWeave
          </span>
          <span className="text-xs text-zinc-400">한국 공공데이터</span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col overflow-y-auto px-2.5 py-4">
        <NavSection items={PRIMARY} onNavigate={onNavigate} />
        <SectionLabel title="공공데이터" />
        <NavSection items={widgetItems} onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-zinc-800/80 px-2.5 py-2.5">
        <NavSection items={SECONDARY} onNavigate={onNavigate} />
        <DataSourceStatus />
      </div>
    </div>
  );
}

function NavSection({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <ul className="space-y-px">
      {items.map((it) => {
        const active = pathname === it.href;
        const Icon = it.icon;
        return (
          <li key={it.href}>
            <Link
              href={it.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                active
                  ? "bg-emerald-500/10 text-emerald-200"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-transparent text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate font-medium">{it.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="mb-1.5 mt-5 px-2.5">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </span>
    </div>
  );
}

function DataSourceStatus() {
  const sources = [
    { name: "KMA", color: "bg-emerald-400" },
    { name: "AirKorea", color: "bg-emerald-400" },
    { name: "E-Gen", color: "bg-emerald-400" },
    { name: "MFDS", color: "bg-emerald-400" },
  ];
  return (
    <div className="mt-3 flex items-center gap-2 rounded-md bg-zinc-950/60 px-2.5 py-2">
      <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-xs font-medium text-zinc-300">데이터 소스</span>
        <span className="text-[11px] text-zinc-500">{sources.length}/4 연결됨</span>
      </div>
      <div className="flex items-center gap-1">
        {sources.map((s) => (
          <span
            key={s.name}
            aria-label={`${s.name} 정상`}
            className={`h-1.5 w-1.5 rounded-full ${s.color} shadow-[0_0_4px] shadow-emerald-400/60`}
          />
        ))}
      </div>
    </div>
  );
}
