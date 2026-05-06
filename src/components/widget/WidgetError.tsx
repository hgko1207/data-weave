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
          className="mt-1 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          다시 시도
        </button>
      ) : null}
    </div>
  );
}
