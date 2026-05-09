import { fetchWidget } from "../_fetch-wrapper";
import type { WidgetContext } from "../_types";
import {
  airkoreaResponseSchema,
  kmaResponseSchema,
  weatherConfigSchema,
  weatherDataSchema,
  type WeatherData,
} from "./schema";
import { buildMockWeather } from "./mock";
import { logger } from "@/lib/logger";

const KMA_BASE = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const AIRKOREA_BASE = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty";

const SKY_TEXT: Record<string, string> = {
  "1": "맑음",
  "3": "구름많음",
  "4": "흐림",
};

const PTY_TEXT: Record<string, string> = {
  "0": "",
  "1": "비",
  "2": "비/눈",
  "3": "눈",
  "4": "소나기",
};

const GRADE_MAP: Record<string, "좋음" | "보통" | "나쁨" | "매우 나쁨"> = {
  "1": "좋음",
  "2": "보통",
  "3": "나쁨",
  "4": "매우 나쁨",
};

export async function fetchWeather(ctx: WidgetContext): Promise<WeatherData> {
  const cfg = weatherConfigSchema.parse(ctx.config);
  const sharedKey = process.env.DATA_GO_KR_KEY;
  const kmaKey = process.env.KMA_API_KEY || sharedKey;
  const airKey = process.env.AIRKOREA_API_KEY || sharedKey;

  if (!kmaKey || !airKey) {
    logger.info("weather.fetch fallback to mock", {
      reason: !kmaKey ? "no KMA_API_KEY" : "no AIRKOREA_API_KEY",
      region: cfg.regionName,
    });
    return weatherDataSchema.parse(buildMockWeather(cfg.regionName));
  }

  try {
    const [kma, air] = await Promise.all([
      fetchKma(kmaKey, cfg.nx, cfg.ny, ctx.now, ctx.abort),
      fetchAirKorea(airKey, cfg.sidoName, ctx.abort),
    ]);
    const data = mergeWeather(cfg.regionName, kma, air);
    return weatherDataSchema.parse(data);
  } catch (err) {
    logger.warn("weather.fetch live failed, using mock", {
      region: cfg.regionName,
      error: err instanceof Error ? err.message : String(err),
    });
    return weatherDataSchema.parse(buildMockWeather(cfg.regionName));
  }
}

async function fetchKma(
  serviceKey: string,
  nx: number,
  ny: number,
  now: Date,
  abort: AbortSignal,
) {
  const { base_date, base_time } = kmaBaseDateTime(now);
  const params = new URLSearchParams({
    serviceKey,
    pageNo: "1",
    numOfRows: "300",
    dataType: "JSON",
    base_date,
    base_time,
    nx: String(nx),
    ny: String(ny),
  });
  return fetchWidget({
    url: `${KMA_BASE}?${params.toString()}`,
    schema: kmaResponseSchema,
    abort,
  });
}

async function fetchAirKorea(
  serviceKey: string,
  sidoName: string,
  abort: AbortSignal,
) {
  const params = new URLSearchParams({
    serviceKey,
    returnType: "json",
    numOfRows: "100",
    pageNo: "1",
    sidoName,
    ver: "1.0",
  });
  return fetchWidget({
    url: `${AIRKOREA_BASE}?${params.toString()}`,
    schema: airkoreaResponseSchema,
    abort,
  });
}

type KmaResp = ReturnType<typeof kmaResponseSchema.parse>;
type AirResp = ReturnType<typeof airkoreaResponseSchema.parse>;

function mergeWeather(region: string, kma: KmaResp, air: AirResp): WeatherData {
  const items = kma.response.body?.items?.item ?? [];
  const byKey = (cat: string) =>
    items
      .filter((it) => it.category === cat)
      .sort((a, b) =>
        (a.fcstDate + a.fcstTime).localeCompare(b.fcstDate + b.fcstTime),
      );

  const tmp = byKey("TMP")[0]?.fcstValue;
  const pop = byKey("POP")[0]?.fcstValue;
  const sky = byKey("SKY")[0]?.fcstValue;
  const pty = byKey("PTY")[0]?.fcstValue;
  const wsd = byKey("WSD")[0]?.fcstValue;

  const skyText = pty && pty !== "0" ? PTY_TEXT[pty] || "강수" : SKY_TEXT[sky ?? "1"] || "맑음";

  const hourly = byKey("TMP")
    .slice(0, 6)
    .map((it) => {
      const popMatch = items.find(
        (p) => p.category === "POP" && p.fcstDate === it.fcstDate && p.fcstTime === it.fcstTime,
      );
      return {
        time: `${it.fcstTime.slice(0, 2)}:00`,
        temp: Number(it.fcstValue),
        pop: Number(popMatch?.fcstValue ?? 0),
      };
    });

  const tempNum = Number(tmp ?? "0");
  const wsdNum = wsd ? Number(wsd) : 0;
  const feelsLike =
    Number.isFinite(tempNum) && Number.isFinite(wsdNum)
      ? Math.round((tempNum - wsdNum * 0.5) * 10) / 10
      : null;

  const airItems = air.response.body?.items ?? [];
  const first = airItems[0];
  const pm10Value = first?.pm10Value && first.pm10Value !== "-" ? Number(first.pm10Value) : null;
  const pm25Value = first?.pm25Value && first.pm25Value !== "-" ? Number(first.pm25Value) : null;
  const pm10Grade: WeatherData["pm10Grade"] =
    GRADE_MAP[first?.pm10Grade ?? ""] ?? "정보 없음";
  const pm25Grade: WeatherData["pm25Grade"] =
    GRADE_MAP[first?.pm25Grade ?? ""] ?? "정보 없음";

  return {
    region,
    observedAt: new Date().toISOString(),
    temp: tempNum,
    feelsLike,
    pop: Number(pop ?? 0),
    skyText,
    pm10Value,
    pm10Grade,
    pm25Value,
    pm25Grade,
    hourly,
    source: "live",
  };
}

export function kmaBaseDateTime(now: Date): { base_date: string; base_time: string } {
  const tzNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  const hour = tzNow.getHours();
  const min = tzNow.getMinutes();

  let base = -1;
  for (let i = baseTimes.length - 1; i >= 0; i--) {
    const t = baseTimes[i];
    if (hour > t || (hour === t && min >= 10)) {
      base = t;
      break;
    }
  }

  const day = new Date(tzNow);
  if (base === -1) {
    base = 23;
    day.setDate(day.getDate() - 1);
  }

  const yyyy = day.getFullYear();
  const mm = String(day.getMonth() + 1).padStart(2, "0");
  const dd = String(day.getDate()).padStart(2, "0");
  const tt = String(base).padStart(2, "0") + "00";
  return { base_date: `${yyyy}${mm}${dd}`, base_time: tt };
}
