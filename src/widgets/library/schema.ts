import { z } from "zod";

export const libraryConfigSchema = z.object({
  v: z.literal(1),
  nickname: z.string().optional(),
  sido: z.string().default("대전광역시"),
  sigungu: z.string().default("유성구"),
  mode: z.enum(["location", "book"]).default("location"),
  q: z.string().default(""),
});

export type LibraryConfig = z.infer<typeof libraryConfigSchema>;

export const librarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    sigungu: z.string(),
    tel: z.string().nullable(),
    homepage: z.string().nullable(),
    openHours: z.string().nullable(), // 평일 09:00~22:00
    closedDays: z.string().nullable(), // 매주 월요일 등
    bookCount: z.number().nullable(), // 장서 수
    latitude: z.number().nullable(), // 카카오맵 핀용
    longitude: z.number().nullable(),
    // book mode일 때만 채워짐
    holdsBook: z.boolean().nullable(),
    bookAvailable: z.boolean().nullable(),
  })
  .strict();

export type Library = z.infer<typeof librarySchema>;

export const matchedBookSchema = z
  .object({
    title: z.string(),
    author: z.string().nullable(),
    publisher: z.string().nullable(),
    isbn: z.string().nullable(),
  })
  .strict();

export type MatchedBook = z.infer<typeof matchedBookSchema>;

export const libraryDataSchema = z
  .object({
    region: z.string(),
    mode: z.enum(["location", "book"]),
    query: z.string(),
    libraries: z.array(librarySchema).max(50),
    total: z.number(),
    matchedBook: matchedBookSchema.nullable(),
    source: z.enum(["live", "mock"]),
  })
  .strict();

export type LibraryData = z.infer<typeof libraryDataSchema>;
