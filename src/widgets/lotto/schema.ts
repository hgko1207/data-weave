import { z } from "zod";

export const lottoConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  round: z.number().int().positive().nullable().default(null), // null = 최신 회차
});

export type LottoConfig = z.infer<typeof lottoConfigSchema>;

export const topStoreSchema = z
  .object({
    name: z.string(),
    address: z.string(),
    sido: z.string(),
    method: z.enum(["auto", "manual", "mixed"]).nullable(), // 자동/수동/반자동
  })
  .strict();

export type TopStore = z.infer<typeof topStoreSchema>;

export const lottoDataSchema = z
  .object({
    round: z.number(), // 회차
    drawDate: z.string(), // 추첨일 ISO
    numbers: z.array(z.number().min(1).max(45)).length(6),
    bonus: z.number().min(1).max(45),
    firstPrizeAmount: z.number().nullable(), // 1등 당첨금
    firstPrizeWinners: z.number().nullable(), // 1등 당첨자 수
    topStores: z.array(topStoreSchema).max(50),
    latestRound: z.number(), // 현재 알려진 최신 회차 (stepper 한계)
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type LottoData = z.infer<typeof lottoDataSchema>;
