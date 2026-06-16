"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MobileSidebar } from "@/components/sidebar/MobileSidebar";
import { ContentBackdrop } from "@/components/content-backdrop";
import { LocationDefaulter } from "@/components/location-defaulter";
import { WidgetErrorBoundary } from "@/components/error-boundary";
import { PageError } from "@/components/page-error";
import { getPageTitle } from "@/lib/page-titles";
import { WIDGET_META } from "@/widgets/_metadata";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const { eyebrow, title } = getPageTitle(pathname);

  // 위젯 상세 페이지면 그룹별 배경 틴트. 날씨는 자체 우주 배경을 쓰므로 제외.
  const widgetId = pathname.startsWith("/w/") ? pathname.split("/")[2] : null;
  const widget = widgetId ? WIDGET_META.find((w) => w.id === widgetId) : null;
  const group = widget && widget.id !== "weather" ? widget.group : null;

  return (
    <div className="flex min-h-full bg-zinc-950">
      <Sidebar />

      <div className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-zinc-800/80 bg-zinc-900">
          <div className="flex h-full w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
            <MobileSidebar />
            <Breadcrumb eyebrow={eyebrow} title={title} />
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900/80 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 sm:min-w-[200px]"
              aria-label="검색 — 명령 팔레트 열기"
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden flex-1 text-left sm:inline">검색…</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-xs text-zinc-400 sm:inline-flex">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        <main className="relative flex-1 bg-zinc-950">
          {group ? <ContentBackdrop group={group} /> : null}
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {/* 페이지 단위 에러 격리 — 한 위젯의 client 렌더 오류가 사이드바·헤더에 번지지 않게.
                pathname을 key로 사용해 페이지 이동 시 boundary state 자동 리셋. */}
            <WidgetErrorBoundary
              key={pathname}
              fallback={(err, reset) => (
                <PageError message={err.message} onRetry={reset} />
              )}
            >
              {children}
            </WidgetErrorBoundary>
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <PwaInstallPrompt activeWidgetCount={1} />
      <LocationDefaulter />
    </div>
  );
}

function Breadcrumb({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <nav aria-label="현재 위치" className="flex min-w-0 flex-1 items-center gap-2">
      {eyebrow ? (
        <>
          <span className="hidden font-mono text-xs uppercase tracking-[0.14em] text-zinc-400 md:inline">
            {eyebrow.split(" · ").join(" / ")}
          </span>
          <span aria-hidden className="hidden text-zinc-700 md:inline">/</span>
        </>
      ) : null}
      <p className="truncate text-base font-semibold text-zinc-100">{title}</p>
    </nav>
  );
}
