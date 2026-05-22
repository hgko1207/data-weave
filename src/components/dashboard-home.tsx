"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Settings, Star } from "lucide-react";
import { WIDGET_META, GROUP_ORDER, GROUP_LABEL, type WidgetMeta } from "@/widgets/_metadata";
import { readPinned } from "@/lib/pinned-widgets";

export function DashboardHome() {
  const [pinned, setPinned] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setPinned(readPinned());
    sync();
    // 설정 페이지 핀 변경 시 다른 탭/같은 탭 동기화
    window.addEventListener("storage", sync);
    window.addEventListener("dataweave-pinned-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("dataweave-pinned-changed", sync);
    };
  }, []);

  const pinnedSet = new Set(pinned ?? []);
  const pinnedWidgets = pinned ? WIDGET_META.filter((w) => pinnedSet.has(w.id)) : [];

  const groups = GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABEL[group],
    items: WIDGET_META.filter((w) => w.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      {/* 즐겨찾는 위젯 (핀) */}
      <section>
        <SectionHeader title="즐겨찾는 위젯">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            <Settings className="h-3 w-3" aria-hidden />
            관리
          </Link>
        </SectionHeader>
        {pinned === null ? (
          <CardSkeleton />
        ) : pinnedWidgets.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pinnedWidgets.map((w) => (
              <WidgetCard key={w.id} widget={w} pinned />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <Star className="mx-auto h-6 w-6 text-zinc-600" aria-hidden />
            <p className="mt-3 text-sm text-zinc-300">즐겨찾는 위젯이 없어요</p>
            <p className="mt-1 text-xs text-zinc-500">
              아래 위젯의 별을 누르거나 설정에서 자주 보는 위젯을 핀하세요.
            </p>
          </div>
        )}
      </section>

      {/* 전체 위젯 그룹별 */}
      {groups.map((g) => (
        <section key={g.group}>
          <SectionHeader title={g.label} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {g.items.map((w) => (
              <WidgetCard key={w.id} widget={w} pinned={pinnedSet.has(w.id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

function WidgetCard({ widget, pinned }: { widget: WidgetMeta; pinned: boolean }) {
  const Icon = widget.icon;
  return (
    <Link
      href={`/w/${widget.id}`}
      className="group flex items-center gap-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    >
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition group-hover:bg-emerald-500/15"
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-zinc-100">{widget.title}</span>
          {pinned ? (
            <>
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden />
              <span className="sr-only">즐겨찾기됨</span>
            </>
          ) : null}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-zinc-500">
          {widget.description}
        </span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-400"
        aria-hidden
      />
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Fragment key={i}>
          <div className="h-[74px] animate-pulse rounded-xl border border-zinc-800/80 bg-zinc-900" />
        </Fragment>
      ))}
    </div>
  );
}
