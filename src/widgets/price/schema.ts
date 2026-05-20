import { z } from "zod";

export const PRICE_CATEGORIES = ["grain", "vegetable", "fruit", "meat", "seafood"] as const;
export type PriceCategory = (typeof PRICE_CATEGORIES)[number];

export const PRICE_CLS = ["retail", "wholesale"] as const;
export type PriceCls = (typeof PRICE_CLS)[number];

export const priceConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  category: z.enum(PRICE_CATEGORIES).default("vegetable"),
  cls: z.enum(PRICE_CLS).default("retail"),
});

export type PriceConfig = z.infer<typeof priceConfigSchema>;

// KAMIS dailyPriceByCategoryList의 item 한 행 = 품목·품종·등급 조합.
export const priceItemSchema = z
  .object({
    id: z.string(), // itemCode-kindCode-rankCode (React key)
    itemName: z.string(),
    kindName: z.string(),
    rank: z.string(), // 상품/중품
    unit: z.string(), // 1포기 / 100g / 1kg / 10개
    today: z.number().nullable(), // dpr1 당일
    prevDay: z.number().nullable(), // dpr2 1일전
    prevWeek: z.number().nullable(), // dpr3 1주일전
  })
  .strict();

export type PriceItem = z.infer<typeof priceItemSchema>;

export const priceDataSchema = z
  .object({
    category: z.enum(PRICE_CATEGORIES),
    cls: z.enum(PRICE_CLS),
    regday: z.string(), // 조회 기준일 YYYY-MM-DD
    items: z.array(priceItemSchema).max(200),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type PriceData = z.infer<typeof priceDataSchema>;
