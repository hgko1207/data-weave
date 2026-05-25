import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Snowflake,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type SkyVisual = {
  Icon: LucideIcon;
  color: string;
};

// night=true면 맑음/구름많음을 달 아이콘으로 (시간대별 예보의 밤 표현).
export function getSkyVisual(
  skyText: string | null | undefined,
  night = false,
): SkyVisual {
  const t = (skyText ?? "").trim();
  if (!t || t === "정보 없음") return { Icon: Cloud, color: "text-zinc-500" };
  if (t.includes("소나기") || t.includes("이슬비")) return { Icon: CloudDrizzle, color: "text-cyan-300" };
  if (t.includes("비/눈") || t.includes("진눈")) return { Icon: CloudSnow, color: "text-cyan-200" };
  if (t.includes("눈")) return { Icon: Snowflake, color: "text-cyan-100" };
  if (t.includes("비")) return { Icon: CloudRain, color: "text-cyan-400" };
  if (t.includes("안개")) return { Icon: CloudFog, color: "text-zinc-400" };
  if (t.includes("구름많"))
    return night
      ? { Icon: CloudMoon, color: "text-zinc-300" }
      : { Icon: CloudSun, color: "text-zinc-300" };
  if (t.includes("흐리") || t.includes("흐림")) return { Icon: Cloud, color: "text-zinc-400" };
  if (t.includes("맑"))
    return night
      ? { Icon: Moon, color: "text-zinc-300" }
      : { Icon: Sun, color: "text-amber-300" };
  return { Icon: Cloud, color: "text-zinc-400" };
}
