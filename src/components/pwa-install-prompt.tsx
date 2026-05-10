"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const VISIT_KEY = "dataweave.visits";
const DISMISS_KEY = "dataweave.pwa.dismissedAt";
const DISMISS_DAYS = 7;
const MIN_VISITS = 3;

export function PwaInstallPrompt({ activeWidgetCount }: { activeWidgetCount: number }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const visits = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
    const cooldown = Date.now() - dismissedAt < DISMISS_DAYS * 86400_000;

    const installed =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone);

    if (installed) return;
    if (visits < MIN_VISITS) return;
    if (activeWidgetCount < 1) return;
    if (cooldown) return;

    const ua = window.navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    setIsIos(ios);

    if (ios) {
      setShow(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [activeWidgetCount]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      localStorage.removeItem(DISMISS_KEY);
    } else {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setDeferred(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      role="dialog"
      aria-label="DataWeave 설치"
      className="fixed bottom-4 left-4 right-4 z-40 rounded-xl border border-emerald-500/20 bg-zinc-900/95 p-4 shadow-2xl shadow-black/40 backdrop-blur md:left-auto md:right-4 md:w-96"
    >
      <div className="flex items-start gap-3">
        <Download className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-100">DataWeave를 홈 화면에 추가할까요?</p>
          <p className="mt-1 text-xs text-zinc-400">
            {isIos
              ? "공유 버튼 → '홈 화면에 추가'를 눌러 앱처럼 사용하세요."
              : "한 번 클릭으로 앱처럼 열립니다."}
          </p>
          <div className="mt-3 flex gap-2">
            {!isIos ? (
              <button
                type="button"
                onClick={install}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                설치
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              나중에
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="닫기"
          className="text-zinc-500 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
