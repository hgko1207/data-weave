import { z } from "zod";

export const foodRecallConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  allergyKeywords: z.array(z.string()).default([]),
  windowHours: z.number().min(1).max(168).default(24),
});

export type FoodRecallConfig = z.infer<typeof foodRecallConfigSchema>;

export const recallItemSchema = z
  .object({
    id: z.string(),
    productName: z.string(),
    company: z.string(),
    recallDate: z.string(),
    reason: z.string(),
    imageUrl: z.string().nullable(),
  })
  .strict();

export type RecallItem = z.infer<typeof recallItemSchema>;

export const foodRecallDataSchema = z
  .object({
    total: z.number(),
    filteredTotal: z.number(),
    items: z.array(recallItemSchema).max(20),
    windowHours: z.number(),
    matchedKeywords: z.array(z.string()),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type FoodRecallData = z.infer<typeof foodRecallDataSchema>;
