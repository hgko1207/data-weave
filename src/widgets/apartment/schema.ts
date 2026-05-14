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
    dong: z.string(),
    jibun: z.string().nullable(),
    dealDate: z.string(), // ISO date YYYY-MM-DD
    dealAmount: z.number(), // 만원
    area: z.number(), // 전용면적 ㎡
    pricePerPyeong: z.number().nullable(),
    floor: z.number().nullable(),
    buildYear: z.number().nullable(),
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
