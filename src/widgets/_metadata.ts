import type { LucideIcon } from "lucide-react";
import { Building2, CloudSun, Key, Pill, ShieldAlert } from "lucide-react";

export type WidgetMeta = {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
};

export const WIDGET_META: WidgetMeta[] = [
  {
    id: "weather",
    title: "날씨",
    icon: CloudSun,
    description: "기상청 단기예보 + 에어코리아 미세먼지",
  },
  {
    id: "pharmacy",
    title: "SOS 병원·약국",
    icon: Pill,
    description: "야간·공휴일 운영 약국 + 응급실",
  },
  {
    id: "food-recall",
    title: "식품 리콜",
    icon: ShieldAlert,
    description: "식약처 회수·판매중지 알림",
  },
  {
    id: "apartment",
    title: "아파트 실거래가",
    icon: Building2,
    description: "국토교통부 시·군·구별 아파트 매매 실거래가",
  },
  {
    id: "rent",
    title: "전월세 실거래가",
    icon: Key,
    description: "국토교통부 시·군·구별 아파트 전세·월세 실거래가",
  },
];
