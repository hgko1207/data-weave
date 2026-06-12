"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

type Props = {
  message?: string;
  onRetry?: () => void;
};

// 페이지 단위 에러 fallback — layout WidgetErrorBoundary가 사용.
export function PageError({ message, onRetry }: Props) {
  return (
    <section className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <span
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400"
      >
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-zinc-100">
        이 페이지에서 문제가 발생했어요
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        잠시 뒤 다시 시도해보세요. 사이드바 다른 위젯은 정상 동작합니다.
      </p>
      {message ? (
        <p className="mt-3 max-w-md font-mono text-xs text-zinc-500">{message}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            다시 시도
          </button>
        ) : null}
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <Home className="h-3.5 w-3.5" aria-hidden />
          대시보드로
        </Link>
      </div>
    </section>
  );
}
