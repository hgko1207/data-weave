import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Snowflake,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type SkyVisual = {
  Icon: LucideIcon;
  color: string;
};

export function getSkyVisual(skyText: string | null | undefined): SkyVisual {
  const t = (skyText ?? "").trim();
  if (!t || t === "정보 없음") return { Icon: Cloud, color: "text-zinc-500" };
  if (t.includes("소나기") || t.includes("이슬비")) return { Icon: CloudDrizzle, color: "text-cyan-300" };
  if (t.includes("비/눈") || t.includes("진눈")) return { Icon: CloudSnow, color: "text-cyan-200" };
  if (t.includes("눈")) return { Icon: Snowflake, color: "text-cyan-100" };
  if (t.includes("비")) return { Icon: CloudRain, color: "text-cyan-400" };
  if (t.includes("안개")) return { Icon: CloudFog, color: "text-zinc-400" };
  if (t.includes("구름많")) return { Icon: CloudSun, color: "text-zinc-300" };
  if (t.includes("흐리") || t.includes("흐림")) return { Icon: Cloud, color: "text-zinc-400" };
  if (t.includes("맑")) return { Icon: Sun, color: "text-amber-300" };
  return { Icon: Cloud, color: "text-zinc-400" };
}
