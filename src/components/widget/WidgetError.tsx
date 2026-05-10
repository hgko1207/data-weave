import { AlertTriangle } from "lucide-react";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function WidgetError({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-start gap-2 text-sm">
      <div className="flex items-center gap-2 text-amber-400">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        <span>위젯 점검 중</span>
      </div>
      {message ? (
        <p className="font-mono text-xs text-zinc-500">{message}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex h-9 items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          다시 시도
        </button>
      ) : null}
    </div>
  );
}
