import { z } from "zod";

export const pharmacyConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  sido: z.string().default("대전광역시"),
  sigungu: z.string().default("유성구"),
  lat: z.number().default(36.3504),
  lng: z.number().default(127.3845),
  radiusKm: z.number().min(1).max(20).default(5),
});

export type PharmacyConfig = z.infer<typeof pharmacyConfigSchema>;

export const facilitySchema = z
  .object({
    kind: z.enum(["pharmacy", "er"]),
    name: z.string(),
    address: z.string(),
    phone: z.string().nullable(),
    lat: z.number(),
    lng: z.number(),
    distanceKm: z.number(),
    hoursToday: z.string().nullable(),
  })
  .strict();

export type Facility = z.infer<typeof facilitySchema>;

export const sosDataSchema = z
  .object({
    region: z.string(),
    queriedAt: z.string(),
    list: z.array(facilitySchema).max(20),
    radiusKm: z.number(),
    origin: z.object({ lat: z.number(), lng: z.number() }),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type SosData = z.infer<typeof sosDataSchema>;

const itemBase = z.object({
  dutyName: z.string().optional(),
  dutyAddr: z.string().optional(),
  dutyTel1: z.string().optional(),
  wgs84Lon: z.union([z.string(), z.number()]).optional(),
  wgs84Lat: z.union([z.string(), z.number()]).optional(),
  dutyTime1s: z.string().optional(),
  dutyTime1c: z.string().optional(),
  dutyTime2s: z.string().optional(),
  dutyTime2c: z.string().optional(),
  dutyTime3s: z.string().optional(),
  dutyTime3c: z.string().optional(),
  dutyTime4s: z.string().optional(),
  dutyTime4c: z.string().optional(),
  dutyTime5s: z.string().optional(),
  dutyTime5c: z.string().optional(),
  dutyTime6s: z.string().optional(),
  dutyTime6c: z.string().optional(),
  dutyTime7s: z.string().optional(),
  dutyTime7c: z.string().optional(),
  dutyTime8s: z.string().optional(),
  dutyTime8c: z.string().optional(),
});

export const egenResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string().optional(),
    }),
    body: z
      .object({
        items: z
          .union([
            z.literal(""),
            z.object({
              item: z.union([itemBase, z.array(itemBase)]),
            }),
          ])
          .optional(),
        totalCount: z.union([z.string(), z.number()]).optional(),
      })
      .optional(),
  }),
});

export type EgenItem = z.infer<typeof itemBase>;
