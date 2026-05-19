import { z } from "zod";

export const tourConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  sido: z.string().default("대전광역시"),
  sigungu: z.string().default("유성구"),
  category: z.enum(["all", "nature", "culture", "festival", "leisure", "shopping"]).default("all"),
});

export type TourConfig = z.infer<typeof tourConfigSchema>;
export type TourCategory = TourConfig["category"];

export const tourItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    category: z.enum(["nature", "culture", "festival", "leisure", "shopping"]),
    address: z.string(),
    sigungu: z.string(),
    imageUrl: z.string().nullable(),
    tel: z.string().nullable(),
    homepage: z.string().nullable(),
    overview: z.string().nullable(), // 짧은 설명
    startDate: z.string().nullable(), // 축제·공연 한정
    endDate: z.string().nullable(),
  })
  .strict();

export type TourItem = z.infer<typeof tourItemSchema>;

export const tourDataSchema = z
  .object({
    region: z.string(),
    category: z.enum(["all", "nature", "culture", "festival", "leisure", "shopping"]),
    items: z.array(tourItemSchema).max(50),
    total: z.number(),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type TourData = z.infer<typeof tourDataSchema>;
