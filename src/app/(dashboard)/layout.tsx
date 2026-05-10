"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Command as CommandIcon } from "lucide-react";
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
    <div className="flex min-h-full">
      <Sidebar />

      <div className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-20 h-14 border-b border-white/5 bg-zinc-950/85 backdrop-blur">
          <div className="flex h-full items-center justify-between gap-3 px-6 lg:px-8">
            <div className="flex min-w-0 items-baseline gap-2">
              {eyebrow ? (
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:inline">
                  {eyebrow}
                </span>
              ) : null}
              <span aria-hidden className="hidden text-zinc-700 sm:inline">/</span>
              <h2 className="truncate text-sm font-medium text-zinc-200">{title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="명령 팔레트 열기"
            >
              <CommandIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">빠른 이동</span>
              <kbd className="font-mono text-[10px] text-zinc-500">⌘K</kbd>
            </button>
          </div>
        </header>

        <main className="flex-1">
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
