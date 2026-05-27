import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  CloudSun,
  Key,
  MapPinned,
  Pill,
  ShieldAlert,
  ShoppingCart,
  Siren,
  Ticket,
} from "lucide-react";

export type WidgetGroup = "living" | "realestate" | "culture";

export type WidgetMeta = {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  group: WidgetGroup;
};

// 사이드바 그룹 순서 + 라벨.
export const GROUP_ORDER: WidgetGroup[] = ["living", "realestate", "culture"];
export const GROUP_LABEL: Record<WidgetGroup, string> = {
  living: "생활·안전",
  realestate: "부동산",
  culture: "문화·여가",
};

export const WIDGET_META: WidgetMeta[] = [
  {
    id: "weather",
    title: "날씨",
    icon: CloudSun,
    description: "기상청 단기예보 + 에어코리아 미세먼지",
    group: "living",
  },
  {
    id: "pharmacy",
    title: "SOS 병원·약국",
    icon: Pill,
    description: "야간·공휴일 운영 약국 + 응급실",
    group: "living",
  },
  {
    id: "food-recall",
    title: "식품 리콜",
    icon: ShieldAlert,
    description: "식약처 회수·판매중지 알림",
    group: "living",
  },
  {
    id: "disaster",
    title: "재난문자",
    icon: Siren,
    description: "행정안전부 긴급재난문자 — 지역·긴급단계별 타임라인",
    group: "living",
  },
  {
    id: "price",
    title: "농수산물 시세",
    icon: ShoppingCart,
    description: "KAMIS 농산물유통정보 — 부류별 도소매 가격",
    group: "living",
  },
  {
    id: "apartment",
    title: "아파트 실거래가",
    icon: Building2,
    description: "국토교통부 시·군·구별 아파트 매매 실거래가",
    group: "realestate",
  },
  {
    id: "rent",
    title: "전월세 실거래가",
    icon: Key,
    description: "국토교통부 시·군·구별 아파트 전세·월세 실거래가",
    group: "realestate",
  },
  {
    id: "library",
    title: "공공도서관",
    icon: BookOpen,
    description: "전국 공공도서관 위치·운영시간 + 도서 보유 검색",
    group: "culture",
  },
  {
    id: "tour",
    title: "관광·전시",
    icon: MapPinned,
    description: "한국관광공사 TourAPI 기반 지역 명소·축제·문화시설",
    group: "culture",
  },
  {
    id: "lotto",
    title: "로또",
    icon: Ticket,
    description: "동행복권 회차별 당첨번호 + 1등 배출점",
    group: "culture",
  },
];
