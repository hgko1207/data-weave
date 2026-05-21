"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type Props = {
  onRefresh: () => Promise<void> | void;
  spinning?: boolean;
};

const DEBOUNCE_MS = 500;

export function WidgetRefresh({ onRefresh, spinning }: Props) {
  const [busy, setBusy] = useState(false);
  const lastClickRef = useRef(0);

  const handle = useCallback(async () => {
    const now = Date.now();
    if (now - lastClickRef.current < DEBOUNCE_MS) return;
    lastClickRef.current = now;
    setBusy(true);
    try {
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }, [onRefresh]);

  const isSpinning = spinning || busy;

  return (
    <button
      type="button"
      onClick={handle}
      disabled={isSpinning}
      aria-label="새로고침"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300 active:scale-95 disabled:cursor-not-allowed disabled:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    >
      <RefreshCw
        className={`h-4 w-4 ${isSpinning ? "animate-spin text-emerald-400" : ""}`}
      />
    </button>
  );
}
