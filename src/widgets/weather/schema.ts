import { z } from "zod";

export const weatherConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  regionName: z.string().default("대전"),
  nx: z.number().int().default(67),
  ny: z.number().int().default(100),
  sidoName: z.string().default("대전"),
  midTermLandId: z.string().optional(),
  midTermTaId: z.string().optional(),
});

export type WeatherConfig = z.infer<typeof weatherConfigSchema>;

export const hourlyPointSchema = z
  .object({
    time: z.string(),
    temp: z.number(),
    pop: z.number().min(0).max(100),
    skyText: z.string(),
  })
  .strict();

export const dailyPointSchema = z
  .object({
    dayOffset: z.number().int(),
    label: z.string(),
    date: z.string(),
    high: z.number().nullable(),
    low: z.number().nullable(),
    skyText: z.string(),
    pop: z.number().min(0).max(100).nullable(),
  })
  .strict();

export const weatherDataSchema = z
  .object({
    region: z.string(),
    observedAt: z.string(),
    temp: z.number(),
    feelsLike: z.number().nullable(),
    pop: z.number().min(0).max(100),
    skyText: z.string(),
    pm10Value: z.number().nullable(),
    pm10Grade: z.enum(["좋음", "보통", "나쁨", "매우 나쁨", "정보 없음"]),
    pm25Value: z.number().nullable(),
    pm25Grade: z.enum(["좋음", "보통", "나쁨", "매우 나쁨", "정보 없음"]),
    humidity: z.number().nullable(),
    windSpeed: z.number().nullable(),
    windDirection: z.number().nullable(),
    windDirectionLabel: z.string().nullable(),
    precipitation: z.number().nullable(),
    todayHigh: z.number().nullable(),
    todayLow: z.number().nullable(),
    hourly: z.array(hourlyPointSchema).max(24),
    daily: z.array(dailyPointSchema).max(10),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type WeatherData = z.infer<typeof weatherDataSchema>;
export type DailyPoint = z.infer<typeof dailyPointSchema>;

export const kmaResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z
      .object({
        items: z
          .object({
            item: z.array(
              z.object({
                category: z.string(),
                fcstDate: z.string(),
                fcstTime: z.string(),
                fcstValue: z.string(),
              }),
            ),
          })
          .optional(),
      })
      .optional(),
  }),
});

export const airkoreaResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z
      .object({
        items: z.array(
          z.object({
            stationName: z.string().nullable().optional(),
            pm10Value: z.string().nullable().optional(),
            pm10Grade: z.string().nullable().optional(),
            pm25Value: z.string().nullable().optional(),
            pm25Grade: z.string().nullable().optional(),
            dataTime: z.string().nullable().optional(),
          }),
        ),
      })
      .optional(),
  }),
});

// 중기예보 — 응답 구조가 가변적이라 raw record로 받음
const midItemRecord = z.record(
  z.string(),
  z.union([z.string(), z.number()]).nullable(),
);

export const midResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string().optional(),
    }),
    body: z
      .object({
        items: z
          .object({
            item: z.union([midItemRecord, z.array(midItemRecord)]),
          })
          .optional(),
      })
      .optional(),
  }),
});
