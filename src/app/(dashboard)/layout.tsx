"use client";

import Link from "next/link";
import { useState } from "react";
import { Settings, Plus, Command as CommandIcon } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" aria-label="DataWeave 홈" className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/60" />
            <span className="text-base font-semibold tracking-tight text-zinc-100">
              DataWeave
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden md:inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="명령 팔레트 열기"
            >
              <CommandIcon className="h-3.5 w-3.5" />
              <span>빠른 이동</span>
              <kbd className="font-mono text-[10px] text-zinc-500">⌘K</kbd>
            </button>

            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <Plus className="h-4 w-4" />
              위젯 추가
            </Link>

            <Link
              href="/settings"
              aria-label="설정"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">{children}</div>
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <PwaInstallPrompt activeWidgetCount={1} />
    </div>
  );
}
