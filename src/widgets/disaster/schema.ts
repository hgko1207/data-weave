import { z } from "zod";

export const EMERGENCY_LEVELS = ["critical", "emergency", "info"] as const;
export type EmergencyLevel = (typeof EMERGENCY_LEVELS)[number];

export const disasterConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  sido: z.string().default("대전광역시"),
  sigungu: z.string().default("유성구"),
  level: z.enum(["all", ...EMERGENCY_LEVELS]).default("all"),
  windowHours: z.number().min(1).max(720).default(72),
});

export type DisasterConfig = z.infer<typeof disasterConfigSchema>;

export const disasterMessageSchema = z
  .object({
    id: z.string(),
    sentAt: z.string(), // ISO datetime
    region: z.string(), // 수신지역 (RCPTN_RGN_NM)
    disasterType: z.string(), // 재난 유형 (호우/태풍/지진/실종/안전안내 등)
    level: z.enum(EMERGENCY_LEVELS), // 긴급단계 (위급/긴급/안내)
    message: z.string(),
  })
  .strict();

export type DisasterMessage = z.infer<typeof disasterMessageSchema>;

export const disasterDataSchema = z
  .object({
    region: z.string(),
    windowHours: z.number(),
    level: z.enum(["all", ...EMERGENCY_LEVELS]),
    messages: z.array(disasterMessageSchema).max(100),
    total: z.number(),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type DisasterData = z.infer<typeof disasterDataSchema>;
