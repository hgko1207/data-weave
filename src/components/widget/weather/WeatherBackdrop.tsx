import type { WeatherData } from "@/widgets/weather/schema";

// 날씨 페이지 content 영역 전용 하늘 배경.
// 레이아웃 상수에 맞춤: 사이드바 w-64(좌) · 헤더 h-14(상) 안쪽(=content)만 덮는다.
// fixed라 스크롤해도 하늘은 고정되고 카드만 그 위로 흐름. 카드는 솔리드라 가독성 유지.
export function WeatherBackdrop({
  observedAt,
  skyText,
}: {
  observedAt: WeatherData["observedAt"];
  skyText: WeatherData["skyText"];
}) {
  const night = isNight(observedAt);
  const overcast =
    skyText.includes("흐") ||
    skyText.includes("비") ||
    skyText.includes("눈") ||
    skyText.includes("소나기");
  const starry = night && !overcast;
  const base = night
    ? "from-indigo-950/50 via-zinc-950 to-zinc-950"
    : "from-sky-950/40 via-zinc-950 to-zinc-950";
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed bottom-0 left-64 right-0 top-14 z-0 bg-gradient-to-b ${base}`}
    >
      {starry ? <Stars /> : null}
    </div>
  );
}

// 정적 별 — 220px 타일로 content 영역 전체에 반복. 반짝임(animation)은 모션 정책상 제외.
function Stars() {
  return (
    <div
      className="absolute inset-0 opacity-50"
      style={{
        backgroundImage: [
          "radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.6), transparent)",
          "radial-gradient(1px 1px at 90px 50px, rgba(255,255,255,0.4), transparent)",
          "radial-gradient(1.5px 1.5px at 150px 100px, rgba(255,255,255,0.55), transparent)",
          "radial-gradient(1px 1px at 50px 140px, rgba(255,255,255,0.4), transparent)",
          "radial-gradient(1px 1px at 195px 170px, rgba(255,255,255,0.3), transparent)",
          "radial-gradient(1px 1px at 120px 205px, rgba(255,255,255,0.45), transparent)",
        ].join(","),
        backgroundRepeat: "repeat",
        backgroundSize: "230px 230px",
      }}
    />
  );
}

function isNight(iso: string): boolean {
  const h = Number(
    new Date(iso).toLocaleString("en-US", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      hour12: false,
    }),
  );
  return !Number.isFinite(h) || h < 6 || h >= 19;
}
