import { NextResponse } from "next/server";
import { fetchDisaster } from "@/widgets/disaster/fetch";
import { fetchFoodRecall } from "@/widgets/food-recall/fetch";

export const dynamic = "force-dynamic";

// 사용자가 "마지막으로 본 시각" 이후 등록된 알림 개수를 카운트.
// disaster: 위급/긴급만 (안내 제외 — 너무 잦음)
// food-recall: 전 리콜 (전부 의미 있음)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const disasterSince = url.searchParams.get("disasterSince");
  const foodRecallSince = url.searchParams.get("foodRecallSince");

  const abort = new AbortController();
  const now = new Date();

  const [disaster, foodRecall] = await Promise.allSettled([
    fetchDisaster({
      config: {
        v: 1,
        sido: "전국",
        sigungu: "",
        windowHours: 24,
        level: "all",
      },
      abort: abort.signal,
      now,
    }),
    fetchFoodRecall({
      config: { v: 1, allergyKeywords: [], windowHours: 24 },
      abort: abort.signal,
      now,
    }),
  ]);

  const disasterCount =
    disaster.status === "fulfilled"
      ? countSince(
          disaster.value.messages.filter(
            (m) => m.level === "critical" || m.level === "emergency",
          ),
          (m) => m.sentAt,
          disasterSince,
        )
      : 0;

  const foodRecallCount =
    foodRecall.status === "fulfilled"
      ? countSince(
          foodRecall.value.items,
          (it) => it.recallDate,
          foodRecallSince,
        )
      : 0;

  return NextResponse.json(
    {
      counts: {
        disaster: disasterCount,
        "food-recall": foodRecallCount,
      },
    },
    {
      headers: {
        // 5분 폴링이라 1분 캐시 두면 동일 시점 다중 호출 절감
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    },
  );
}

function countSince<T>(
  items: T[],
  getTime: (item: T) => string,
  since: string | null,
): number {
  if (!since) return items.length; // 첫 방문(since 미지정) → 다 새 거 아님 → 0 반환이 자연스러우나
  // 실제로는 lastSeen 없으면 client가 "now"로 초기화 후 첫 호출 → 0건. 여기선 since 없으면 전체.
  const sinceMs = Date.parse(since);
  if (!Number.isFinite(sinceMs)) return items.length;
  return items.filter((it) => {
    const t = Date.parse(getTime(it));
    return Number.isFinite(t) && t > sinceMs;
  }).length;
}
