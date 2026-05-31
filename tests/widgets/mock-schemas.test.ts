// 각 위젯의 buildMock*() 결과가 그 위젯의 zod schema를 통과하는지 검증.
//
// 목적: schema drift 1차 안전망 — 응답 형태가 바뀌어 schema를 수정했을 때
// mock도 같이 갱신했는지 자동 확인. mock과 schema가 어긋나면 dev에서
// "잘 동작하는 것처럼" 보이지만 런타임에 mock 폴백이 throw로 깨지므로 중요.
import { describe, it, expect } from "vitest";

import { apartmentDataSchema } from "@/widgets/apartment/schema";
import { buildMockApartment } from "@/widgets/apartment/mock";

import { rentDataSchema } from "@/widgets/rent/schema";
import { buildMockRent } from "@/widgets/rent/mock";

import { libraryDataSchema } from "@/widgets/library/schema";
import { buildMockLibrary } from "@/widgets/library/mock";

import { tourDataSchema } from "@/widgets/tour/schema";
import { buildMockTour } from "@/widgets/tour/mock";

import { lottoDataSchema } from "@/widgets/lotto/schema";
import { buildMockLotto, currentLatestRound } from "@/widgets/lotto/mock";

import { priceDataSchema } from "@/widgets/price/schema";
import { buildMockPrice } from "@/widgets/price/mock";

import { disasterDataSchema } from "@/widgets/disaster/schema";
import { buildMockDisaster } from "@/widgets/disaster/mock";

describe("widget mock data passes its zod schema (drift guard)", () => {
  it("apartment", () => {
    const data = buildMockApartment("대전광역시 유성구", "202605");
    expect(() => apartmentDataSchema.parse(data)).not.toThrow();
  });

  it("rent", () => {
    const data = buildMockRent("대전광역시 유성구", "202605");
    expect(() => rentDataSchema.parse(data)).not.toThrow();
  });

  it("library — location mode", () => {
    const data = buildMockLibrary("대전광역시", "유성구", "location", "");
    expect(() => libraryDataSchema.parse(data)).not.toThrow();
  });

  it("library — book mode with query", () => {
    const data = buildMockLibrary("대전광역시", "유성구", "book", "사랑");
    expect(() => libraryDataSchema.parse(data)).not.toThrow();
  });

  it("tour — all category", () => {
    const data = buildMockTour("대전광역시", "유성구", "all");
    expect(() => tourDataSchema.parse(data)).not.toThrow();
  });

  it("tour — festival", () => {
    const data = buildMockTour("대전광역시", "유성구", "festival");
    expect(() => tourDataSchema.parse(data)).not.toThrow();
  });

  it("lotto", () => {
    const latest = currentLatestRound(new Date("2026-05-29T00:00:00+09:00"));
    const data = buildMockLotto(latest, latest);
    expect(() => lottoDataSchema.parse(data)).not.toThrow();
  });

  it("price — vegetable retail", () => {
    const data = buildMockPrice("vegetable", "retail", "2026-05-28");
    expect(() => priceDataSchema.parse(data)).not.toThrow();
  });

  it("price — meat wholesale", () => {
    const data = buildMockPrice("meat", "wholesale", "2026-05-28");
    expect(() => priceDataSchema.parse(data)).not.toThrow();
  });

  it("disaster — all level", () => {
    const data = buildMockDisaster("대전광역시 유성구", 72, "all");
    expect(() => disasterDataSchema.parse(data)).not.toThrow();
  });

  it("disaster — critical level filter", () => {
    const data = buildMockDisaster("대전광역시 유성구", 168, "critical");
    expect(() => disasterDataSchema.parse(data)).not.toThrow();
  });
});
