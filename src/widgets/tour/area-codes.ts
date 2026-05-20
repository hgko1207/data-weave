import type { TourCategory } from "./schema";

// 우리 시·도명 → 한국관광공사 TourAPI areaCode.
export const SIDO_AREA_CODE: Record<string, string> = {
  서울특별시: "1",
  인천광역시: "2",
  대전광역시: "3",
  대구광역시: "4",
  광주광역시: "5",
  부산광역시: "6",
  울산광역시: "7",
  세종특별자치시: "8",
  경기도: "31",
  강원특별자치도: "32",
  충청북도: "33",
  충청남도: "34",
  경상북도: "35",
  경상남도: "36",
  전북특별자치도: "37",
  전라남도: "38",
  제주특별자치도: "39",
};

// 우리 카테고리 → TourAPI contentTypeId. all은 전체(미지정).
//  12 관광지 / 14 문화시설 / 15 축제공연행사 / 28 레포츠 / 38 쇼핑 / 39 음식점
export const CATEGORY_CONTENT_TYPE: Record<TourCategory, string | null> = {
  all: null,
  nature: "12",
  culture: "14",
  festival: "15",
  leisure: "28",
  shopping: "38",
};

// contentTypeId → 우리 카테고리 (역매핑, 응답 정규화용).
export const CONTENT_TYPE_TO_CATEGORY: Record<string, Exclude<TourCategory, "all">> = {
  "12": "nature",
  "14": "culture",
  "15": "festival",
  "25": "leisure", // 여행코스
  "28": "leisure",
  "32": "shopping", // 숙박 → 임시
  "38": "shopping",
  "39": "shopping", // 음식 → 임시
};
