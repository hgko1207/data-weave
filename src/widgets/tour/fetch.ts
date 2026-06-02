import type { WidgetContext } from "../_types";
import {
  tourConfigSchema,
  tourDataSchema,
  type TourData,
  type TourItem,
  type TourCategory,
} from "./schema";
import { buildMockTour } from "./mock";
import {
  SIDO_AREA_CODE,
  CATEGORY_CONTENT_TYPE,
  CONTENT_TYPE_TO_CATEGORY,
} from "./area-codes";
import { logger } from "@/lib/logger";

// 한국관광공사 TourAPI 4.0 — 지역 기반 관광 정보 (KorService2).
//   areaBasedList2?serviceKey&areaCode&contentTypeId&numOfRows&MobileOS&MobileApp&_type=json
// 응답: response.body.items.item[] = { contentid, contenttypeid, title, addr1,
//        addr2, firstimage, mapx, mapy, tel, areacode, sigungucode, cat1.. }
// 결과 없으면 items가 "" (빈 문자열)로 옴 — 방어.
const TOUR_BASE = "https://apis.data.go.kr/B551011/KorService2/areaBasedList2";

type RawItem = {
  contentid?: string | number;
  contenttypeid?: string | number;
  title?: string;
  addr1?: string;
  addr2?: string;
  firstimage?: string;
  firstimage2?: string;
  tel?: string;
  mapx?: string | number;
  mapy?: string | number;
};

export async function fetchTour(ctx: WidgetContext): Promise<TourData> {
  const cfg = tourConfigSchema.parse(ctx.config);
  const key = process.env.TOUR_API_KEY || process.env.DATA_GO_KR_KEY;
  const areaCode = SIDO_AREA_CODE[cfg.sido];
  // sigungu가 빈 값이면 시·도 전체. region 라벨에 trailing space 없게.
  const region = cfg.sigungu ? `${cfg.sido} ${cfg.sigungu}` : `${cfg.sido} 전체`;

  if (!key || !areaCode) {
    logger.info("tour.fetch fallback to mock", {
      reason: !key ? "no TOUR/DATA_GO_KR key" : "no areaCode",
    });
    return tourDataSchema.parse(buildMockTour(cfg.sido, cfg.sigungu, cfg.category));
  }

  try {
    const params = new URLSearchParams({
      serviceKey: normalizeServiceKey(key),
      numOfRows: "30",
      pageNo: "1",
      MobileOS: "ETC",
      MobileApp: "DataWeave",
      _type: "json",
      arrange: "Q", // 수정일순 + 대표이미지 있는 것 우선
      areaCode,
    });
    const contentType = CATEGORY_CONTENT_TYPE[cfg.category];
    if (contentType) params.set("contentTypeId", contentType);

    const res = await fetch(`${TOUR_BASE}?${params.toString()}`, { signal: ctx.abort });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const parsed = JSON.parse(text) as {
      response?: {
        header?: { resultCode?: string; resultMsg?: string };
        body?: { items?: { item?: RawItem | RawItem[] } | "" };
      };
    };

    const resultCode = parsed.response?.header?.resultCode;
    if (resultCode && resultCode !== "0000" && resultCode !== "00") {
      throw new Error(`TourAPI ${resultCode}: ${parsed.response?.header?.resultMsg ?? ""}`);
    }

    const itemsNode = parsed.response?.body?.items;
    const rawItems =
      itemsNode && typeof itemsNode === "object" ? itemsNode.item : undefined;
    const list = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    let items = list
      .map((r) => normalize(r, cfg.category))
      .filter((it): it is TourItem => it !== null);

    // 시·군·구는 sigungucode 매핑이 없어 addr1 문자열로 좁힘.
    if (cfg.sigungu) {
      const matched = items.filter((it) => it.address.includes(cfg.sigungu));
      if (matched.length > 0) items = matched;
    }

    return tourDataSchema.parse({
      region,
      category: cfg.category,
      items: items.slice(0, 50),
      total: items.length,
      source: "live",
    });
  } catch (err) {
    logger.warn("tour.fetch failed, using mock", {
      sido: cfg.sido,
      error: err instanceof Error ? err.message : String(err),
    });
    return tourDataSchema.parse(buildMockTour(cfg.sido, cfg.sigungu, cfg.category));
  }
}

function normalize(raw: RawItem, requested: TourCategory): TourItem | null {
  const title = raw.title?.trim();
  if (!title) return null;
  const contentType = String(raw.contenttypeid ?? "");
  const category =
    CONTENT_TYPE_TO_CATEGORY[contentType] ??
    (requested !== "all" ? requested : "culture");
  const addr = [raw.addr1?.trim(), raw.addr2?.trim()].filter(Boolean).join(" ");
  return {
    id: String(raw.contentid ?? title),
    title,
    category,
    address: addr,
    sigungu: addr.split(/\s+/)[1] ?? "",
    imageUrl: raw.firstimage?.trim() || raw.firstimage2?.trim() || null,
    tel: raw.tel?.trim() || null,
    homepage: null, // areaBasedList2엔 없음 (detailCommon 필요)
    overview: null,
    startDate: null,
    endDate: null,
  };
}

function normalizeServiceKey(k: string): string {
  // data.go.kr 키가 URL 인코딩된 형태면 디코딩 (URLSearchParams가 다시 인코딩).
  return k.includes("%") ? decodeURIComponent(k) : k;
}
