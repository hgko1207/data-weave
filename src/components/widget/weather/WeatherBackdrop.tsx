import type { WeatherData } from "@/widgets/weather/schema";
import { CONTENT_BACKDROP_INSET } from "@/lib/layout-dims";

// 날씨 페이지 content 영역 전용 하늘 배경.
// fixed라 스크롤해도 하늘은 고정되고 카드만 그 위로 흐름. 카드는 솔리드라 가독성 유지.
// 별은 항상 표시(우주 배경) — 밤은 밝게/짙은 인디고, 낮은 옅게/푸른 틴트.
export function WeatherBackdrop({
  observedAt,
}: {
  observedAt: WeatherData["observedAt"];
}) {
  const night = isNight(observedAt);
  const base = night
    ? "from-indigo-950/70 via-zinc-950 to-zinc-950"
    : "from-sky-950/40 via-zinc-950 to-zinc-950";
  return (
    <div
      aria-hidden
      className={`${CONTENT_BACKDROP_INSET} bg-gradient-to-b ${base}`}
    >
      <Stars opacity={night ? 0.9 : 0.45} />
    </div>
  );
}

// 정적 별 — 200px 타일로 content 영역 전체에 반복. 크기·밝기를 섞어 "박힌 별" 느낌.
// 반짝임(animation)은 모션 정책상 제외.
function Stars({ opacity }: { opacity: number }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        backgroundImage: [
          "radial-gradient(2px 2px at 24px 36px, rgba(255,255,255,0.95), transparent)",
          "radial-gradient(1.5px 1.5px at 96px 64px, rgba(255,255,255,0.8), transparent)",
          "radial-gradient(1px 1px at 150px 30px, rgba(255,255,255,0.7), transparent)",
          "radial-gradient(2px 2px at 60px 140px, rgba(255,255,255,0.9), transparent)",
          "radial-gradient(1px 1px at 180px 120px, rgba(255,255,255,0.6), transparent)",
          "radial-gradient(1.5px 1.5px at 30px 180px, rgba(255,255,255,0.8), transparent)",
          "radial-gradient(1px 1px at 120px 190px, rgba(255,255,255,0.65), transparent)",
          "radial-gradient(2px 2px at 195px 175px, rgba(255,255,255,0.85), transparent)",
          "radial-gradient(1px 1px at 80px 100px, rgba(255,255,255,0.55), transparent)",
        ].join(","),
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
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
