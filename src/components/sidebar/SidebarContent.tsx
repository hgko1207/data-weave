"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings } from "lucide-react";
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
        className="group flex h-14 items-center gap-2 px-5 transition"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/70 transition group-hover:shadow-emerald-400/90" />
        <span className="text-sm font-semibold tracking-tight text-zinc-100">
          DataWeave
        </span>
      </Link>

      <div aria-hidden className="mx-4 h-px bg-white/[0.08]" />

      <nav className="flex flex-1 flex-col px-3 py-4">
        <NavSection items={PRIMARY} onNavigate={onNavigate} />
        <SectionLabel title="공공데이터" />
        <NavSection items={widgetItems} onNavigate={onNavigate} />
        <div className="mt-auto">
          <NavSection items={SECONDARY} onNavigate={onNavigate} />
        </div>
      </nav>
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
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                active
                  ? "bg-emerald-500/10 text-emerald-200"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/70"
                />
              ) : null}
              <Icon
                className={`h-4 w-4 shrink-0 transition ${
                  active
                    ? "text-emerald-400"
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`}
                aria-hidden
              />
              <span className="truncate">{it.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="mb-1.5 mt-5 flex items-center gap-2 px-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}
