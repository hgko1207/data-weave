import { z } from "zod";

export const rentConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  sido: z.string().default("대전광역시"),
  sigungu: z.string().default("유성구"),
  lawdCd: z.string().default("30200"),
  dealYm: z.string().default(""), // 비우면 fetch에서 현재 KST 기준 최근 월
});

export type RentConfig = z.infer<typeof rentConfigSchema>;

export const rentTradeSchema = z
  .object({
    id: z.string(),
    aptName: z.string(),
    dong: z.string(),
    jibun: z.string().nullable(),
    dealDate: z.string(),
    type: z.enum(["jeonse", "monthly"]), // 전세 / 월세
    deposit: z.number(), // 보증금 (만원)
    monthlyRent: z.number(), // 월세 (만원) — 전세면 0
    area: z.number(), // 전용면적 ㎡
    floor: z.number().nullable(),
    buildYear: z.number().nullable(),
  })
  .strict();

export type RentTrade = z.infer<typeof rentTradeSchema>;

export const rentDataSchema = z
  .object({
    region: z.string(),
    dealYm: z.string(),
    trades: z.array(rentTradeSchema).max(200),
    totalCount: z.number(),
    jeonseCount: z.number(),
    monthlyCount: z.number(),
    avgJeonseDeposit: z.number().nullable(),
    avgMonthlyDeposit: z.number().nullable(),
    avgMonthlyRent: z.number().nullable(),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type RentData = z.infer<typeof rentDataSchema>;
