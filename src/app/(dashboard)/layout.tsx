"use client";

import { useState } from "react";
import { Command as CommandIcon } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="flex min-h-full">
      <Sidebar />

      <div className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-20 h-14 bg-transparent">
          <div className="flex h-full items-center justify-end gap-3 px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-400 backdrop-blur hover:bg-white/10 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="명령 팔레트 열기"
            >
              <CommandIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">빠른 이동</span>
              <kbd className="font-mono text-[10px] text-zinc-500">⌘K</kbd>
            </button>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 pb-12 pt-2 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <PwaInstallPrompt activeWidgetCount={1} />
    </div>
  );
}
