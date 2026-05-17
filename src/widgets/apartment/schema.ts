import { z } from "zod";

export const apartmentConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  sido: z.string().default("대전광역시"),
  sigungu: z.string().default("유성구"),
  lawdCd: z.string().default("30200"),
  dealYm: z.string().default(""), // 비우면 fetch에서 현재 KST 기준 최근 월로 채움
});

export type ApartmentConfig = z.infer<typeof apartmentConfigSchema>;

export const apartmentTradeSchema = z
  .object({
    id: z.string(),
    aptName: z.string(),
    aptDong: z.string().nullable(), // 아파트 동 (101동 등). API에서 가끔 공개. 호수는 개인정보로 비공개.
    dong: z.string(), // 법정동명 (봉명동, 도룡동 등)
    jibun: z.string().nullable(),
    roadName: z.string().nullable(), // 도로명 주소
    dealDate: z.string(),
    dealAmount: z.number(),
    area: z.number(),
    pricePerPyeong: z.number().nullable(),
    floor: z.number().nullable(),
    buildYear: z.number().nullable(),
    dealType: z.string().nullable(), // '중개거래' | '직거래'
    agentSido: z.string().nullable(), // 중개업소 시·도
    sellerType: z.string().nullable(), // 매도자 구분 (개인/법인/기타)
    buyerType: z.string().nullable(), // 매수자 구분
    rgstDate: z.string().nullable(), // 등기일자 YYYY.MM.DD
    cancelDealDay: z.string().nullable(), // 해제일자 — null이면 정상 거래
  })
  .strict();

export type ApartmentTrade = z.infer<typeof apartmentTradeSchema>;

export const apartmentDataSchema = z
  .object({
    region: z.string(),
    dealYm: z.string(), // YYYYMM
    trades: z.array(apartmentTradeSchema).max(200),
    totalCount: z.number(),
    avgAmount: z.number().nullable(),
    medianAmount: z.number().nullable(),
    minAmount: z.number().nullable(),
    maxAmount: z.number().nullable(),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type ApartmentData = z.infer<typeof apartmentDataSchema>;
