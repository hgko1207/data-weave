"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type AlertCounts = Partial<Record<string, number>>;

type Ctx = {
  counts: AlertCounts;
  markSeen: (widgetId: string) => void;
};

const AlertCountsContext = createContext<Ctx>({
  counts: {},
  markSeen: () => {},
});

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5분
const LS_PREFIX = "dataweave.lastSeen.";
// 인앱 뱃지 대상 위젯 — 이벤트 성격이 명확한 것만.
const ALERT_WIDGETS = ["disaster", "food-recall"] as const;

export function AlertCountsProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<AlertCounts>({});

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;

    const sinceMap: Record<string, string> = {};
    let firstVisit = false;
    const now = new Date().toISOString();
    for (const id of ALERT_WIDGETS) {
      const stored = window.localStorage.getItem(LS_PREFIX + id);
      if (!stored) {
        // 첫 방문: 지금을 baseline으로 잡고 카운트 0. "옛날 알림" 폭주 방지.
        window.localStorage.setItem(LS_PREFIX + id, now);
        sinceMap[id] = now;
        firstVisit = true;
      } else {
        sinceMap[id] = stored;
      }
    }

    if (firstVisit) {
      setCounts(Object.fromEntries(ALERT_WIDGETS.map((id) => [id, 0])));
      return;
    }

    try {
      const url = `/api/alerts?disasterSince=${encodeURIComponent(sinceMap["disaster"] ?? "")}&foodRecallSince=${encodeURIComponent(sinceMap["food-recall"] ?? "")}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { counts: AlertCounts };
      setCounts(data.counts);
    } catch {
      // 실패는 조용히 — 뱃지 없어도 앱 동작에 영향 X
    }
  }, []);

  // 즉시 1회 + 5분마다 폴링 + 탭 visible 될 때 추가 호출
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // 사용자가 위젯 페이지 진입 시 호출 — localStorage 갱신 + 즉시 client count 0
  const markSeen = useCallback((widgetId: string) => {
    if (typeof window === "undefined") return;
    if (!ALERT_WIDGETS.includes(widgetId as (typeof ALERT_WIDGETS)[number])) {
      return;
    }
    window.localStorage.setItem(LS_PREFIX + widgetId, new Date().toISOString());
    setCounts((cur) => ({ ...cur, [widgetId]: 0 }));
  }, []);

  return (
    <AlertCountsContext.Provider value={{ counts, markSeen }}>
      {children}
    </AlertCountsContext.Provider>
  );
}

export function useAlertCounts(): Ctx {
  return useContext(AlertCountsContext);
}
