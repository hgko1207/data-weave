"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { getPageTitle } from "@/lib/page-titles";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const { eyebrow, title } = getPageTitle(pathname);

  return (
    <div className="flex min-h-full bg-zinc-950">
      <Sidebar />

      <div className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-zinc-800/80 bg-zinc-900">
          <div className="flex h-full w-full items-center justify-between gap-3 px-6 lg:px-8">
            <Breadcrumb eyebrow={eyebrow} title={title} />
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex h-9 min-w-[200px] items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-500 transition hover:border-zinc-700 hover:bg-zinc-900/80 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="명령 팔레트 열기"
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
              <span className="flex-1 text-left">검색…</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-xs text-zinc-400 sm:inline-flex">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        <main className="flex-1 bg-zinc-950">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <PwaInstallPrompt activeWidgetCount={1} />
    </div>
  );
}

function Breadcrumb({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <nav aria-label="현재 위치" className="flex min-w-0 items-center gap-2">
      {eyebrow ? (
        <>
          <span className="hidden font-mono text-xs uppercase tracking-[0.14em] text-zinc-500 md:inline">
            {eyebrow.split(" · ").join(" / ")}
          </span>
          <span aria-hidden className="hidden text-zinc-700 md:inline">/</span>
        </>
      ) : null}
      <p className="truncate text-base font-semibold text-zinc-100">{title}</p>
    </nav>
  );
}
