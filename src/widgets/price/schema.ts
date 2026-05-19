import { z } from "zod";

export const PRICE_CATEGORIES = ["vegetable", "fruit", "meat", "seafood", "grain"] as const;
export type PriceCategory = (typeof PRICE_CATEGORIES)[number];

export const priceConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  category: z.enum(PRICE_CATEGORIES).default("vegetable"),
  item: z.string().default(""),
});

export type PriceConfig = z.infer<typeof priceConfigSchema>;

export const priceItemSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    category: z.enum(PRICE_CATEGORIES),
    unit: z.string(), // kg, 개, L
  })
  .strict();

export type PriceItem = z.infer<typeof priceItemSchema>;

export const regionPriceSchema = z
  .object({
    sido: z.string(),
    price: z.number(), // 현재가 (원)
    prevMonth: z.number().nullable(), // 전월
    prevYear: z.number().nullable(), // 전년 동월
  })
  .strict();

export type RegionPrice = z.infer<typeof regionPriceSchema>;

export const trendPointSchema = z
  .object({
    ym: z.string(), // YYYYMM
    label: z.string(), // '1월'
    avg: z.number(),
  })
  .strict();

export type TrendPoint = z.infer<typeof trendPointSchema>;

export const priceDataSchema = z
  .object({
    item: priceItemSchema,
    nationwideAvg: z.number(),
    nationwidePrevMonth: z.number().nullable(),
    nationwidePrevYear: z.number().nullable(),
    regionPrices: z.array(regionPriceSchema).max(20),
    trend: z.array(trendPointSchema).max(12),
    catalog: z.array(priceItemSchema).max(50), // 카테고리 내 다른 품목 선택용
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type PriceData = z.infer<typeof priceDataSchema>;
