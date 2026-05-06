import { z } from "zod";

export const weatherConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  regionName: z.string().default("대전"),
  nx: z.number().int().default(67),
  ny: z.number().int().default(100),
  sidoName: z.string().default("대전"),
});

export type WeatherConfig = z.infer<typeof weatherConfigSchema>;

export const hourlyPointSchema = z
  .object({
    time: z.string(),
    temp: z.number(),
    pop: z.number().min(0).max(100),
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
    hourly: z.array(hourlyPointSchema).max(12),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type WeatherData = z.infer<typeof weatherDataSchema>;

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
            stationName: z.string(),
            pm10Value: z.string().optional(),
            pm10Grade: z.string().optional(),
            pm25Value: z.string().optional(),
            pm25Grade: z.string().optional(),
            dataTime: z.string().optional(),
          }),
        ),
      })
      .optional(),
  }),
});
