import { fetchWidget } from "../_fetch-wrapper";
import type { WidgetContext } from "../_types";
import {
  airkoreaResponseSchema,
  kmaResponseSchema,
  midResponseSchema,
  weatherConfigSchema,
  weatherDataSchema,
  type DailyPoint,
  type WeatherData,
} from "./schema";
import { buildMockWeather } from "./mock";
import { logger } from "@/lib/logger";

const KMA_BASE = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const AIRKOREA_BASE = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty";
const MID_LAND_BASE = "https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst";
const MID_TA_BASE = "https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa";

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

const WIND_COMPASS = [
  "북",
  "북북동",
  "북동",
  "동북동",
  "동",
  "동남동",
  "남동",
  "남남동",
  "남",
  "남남서",
  "남서",
  "서남서",
  "서",
  "서북서",
  "북서",
  "북북서",
];

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

    const base = mergeWeather(cfg.regionName, kma, air, ctx.now);

    // 중기예보는 best-effort. 실패해도 단기 결과 살림.
    let midDaily: DailyPoint[] = [];
    if (cfg.midTermLandId && cfg.midTermTaId) {
      const tmFc = midTermBaseTime(ctx.now);
      try {
        const [land, ta] = await Promise.all([
          fetchMid(MID_LAND_BASE, kmaKey, cfg.midTermLandId, tmFc, ctx.abort),
          fetchMid(MID_TA_BASE, kmaKey, cfg.midTermTaId, tmFc, ctx.abort),
        ]);
        midDaily = parseMidTerm(land, ta, ctx.now);
        logger.info("weather.fetch mid-term ok", {
          land: cfg.midTermLandId,
          ta: cfg.midTermTaId,
          tmFc,
          extracted: midDaily.length,
        });
      } catch (err) {
        logger.info("weather.fetch mid-term skipped", {
          reason: err instanceof Error ? err.message : String(err),
          land: cfg.midTermLandId,
          ta: cfg.midTermTaId,
          tmFc,
        });
      }
    }

    const data: WeatherData = {
      ...base,
      daily: mergeDaily(base.daily, midDaily),
    };
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
    numOfRows: "800",
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

async function fetchMid(
  base: string,
  serviceKey: string,
  regId: string,
  tmFc: string,
  abort: AbortSignal,
) {
  const params = new URLSearchParams({
    serviceKey,
    pageNo: "1",
    numOfRows: "10",
    dataType: "JSON",
    regId,
    tmFc,
  });
  return fetchWidget({
    url: `${base}?${params.toString()}`,
    schema: midResponseSchema,
    abort,
  });
}

type KmaResp = ReturnType<typeof kmaResponseSchema.parse>;
type AirResp = ReturnType<typeof airkoreaResponseSchema.parse>;
type MidResp = ReturnType<typeof midResponseSchema.parse>;

type WeatherBase = Omit<WeatherData, "daily"> & { daily: DailyPoint[] };

function mergeWeather(region: string, kma: KmaResp, air: AirResp, now: Date): WeatherBase {
  const items = kma.response.body?.items?.item ?? [];
  const byKey = (cat: string) =>
    items
      .filter((it) => it.category === cat)
      .sort((a, b) =>
        (a.fcstDate + a.fcstTime).localeCompare(b.fcstDate + b.fcstTime),
      );

  const tmpItems = byKey("TMP");

  // 현재 시각(KST, 시 단위) 이후 예보만 — "지금 → +24h" 롤링 윈도우.
  // KMA는 발표시각 기준 앞부터 주므로 지나간 시간이 섞임 → 현재 시각으로 컷.
  const nowKey = kstHourKey(now);
  const futureTmp = tmpItems.filter((it) => it.fcstDate + it.fcstTime >= nowKey);
  const hourlyTmp = futureTmp.length > 0 ? futureTmp : tmpItems;

  // 현재(가장 가까운) 시각의 각 카테고리 값 — 매칭 실패 시 첫 값으로 폴백.
  const curKey = hourlyTmp[0] ? hourlyTmp[0].fcstDate + hourlyTmp[0].fcstTime : null;
  const atCur = (cat: string): string | undefined => {
    if (curKey) {
      const m = items.find(
        (it) => it.category === cat && it.fcstDate + it.fcstTime === curKey,
      );
      if (m) return m.fcstValue;
    }
    return byKey(cat)[0]?.fcstValue;
  };

  const tmp = hourlyTmp[0]?.fcstValue ?? tmpItems[0]?.fcstValue;
  const pop = atCur("POP");
  const sky = atCur("SKY");
  const pty = atCur("PTY");
  const wsd = atCur("WSD");
  const reh = atCur("REH");
  const vec = atCur("VEC");
  const pcp = atCur("PCP");

  const skyText = pty && pty !== "0" ? PTY_TEXT[pty] || "강수" : SKY_TEXT[sky ?? "1"] || "맑음";

  const hourly = hourlyTmp.slice(0, 24).map((it) => {
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
  const rehNum = reh ? Number(reh) : NaN;
  const vecNum = vec ? Number(vec) : NaN;

  // 체감온도: 기온 - (풍속 m/s × 0.5). 매우 단순화된 근사. 영하에서 풍속 보정 가산.
  const feelsLike =
    Number.isFinite(tempNum) && Number.isFinite(wsdNum)
      ? Math.round((tempNum - wsdNum * (tempNum < 10 ? 1.0 : 0.5)) * 10) / 10
      : null;

  const pcpNum = parsePcp(pcp);

  // 시군구 통합 대기 — 첫 측정소
  const airItems = air.response.body?.items ?? [];
  const first = airItems[0];
  const pm10Value = first?.pm10Value && first.pm10Value !== "-" ? Number(first.pm10Value) : null;
  const pm25Value = first?.pm25Value && first.pm25Value !== "-" ? Number(first.pm25Value) : null;
  const pm10Grade: WeatherData["pm10Grade"] = GRADE_MAP[first?.pm10Grade ?? ""] ?? "정보 없음";
  const pm25Grade: WeatherData["pm25Grade"] = GRADE_MAP[first?.pm25Grade ?? ""] ?? "정보 없음";

  // 오늘 high/low: 오늘 fcstDate에 해당하는 TMP의 max/min
  const todayDate = tmpItems[0]?.fcstDate;
  const todayTemps = tmpItems
    .filter((it) => it.fcstDate === todayDate)
    .map((it) => Number(it.fcstValue))
    .filter((n) => Number.isFinite(n));
  const todayHigh = todayTemps.length > 0 ? Math.max(...todayTemps) : null;
  const todayLow = todayTemps.length > 0 ? Math.min(...todayTemps) : null;

  // 단기 daily: 오늘 + 내일 + 모레 (KMA가 ~3일치 줌)
  const daily = buildShortTermDaily(items);

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
    humidity: Number.isFinite(rehNum) ? rehNum : null,
    windSpeed: Number.isFinite(wsdNum) && wsd != null ? wsdNum : null,
    windDirection: Number.isFinite(vecNum) ? vecNum : null,
    windDirectionLabel: Number.isFinite(vecNum) ? windCompass(vecNum) : null,
    precipitation: pcpNum,
    todayHigh,
    todayLow,
    hourly,
    daily,
    source: "live",
  };
}

function parsePcp(raw: string | undefined): number | null {
  if (!raw) return null;
  if (raw === "강수없음" || raw === "0" || raw === "0.0") return 0;
  const m = raw.match(/[0-9]+(?:\.[0-9]+)?/);
  return m ? Number(m[0]) : null;
}

function windCompass(deg: number): string {
  const idx = Math.round(((deg % 360) + 360) / 22.5) % 16;
  return WIND_COMPASS[idx];
}

type KmaItem = { category: string; fcstDate: string; fcstTime: string; fcstValue: string };

function buildShortTermDaily(items: KmaItem[]): DailyPoint[] {
  const list = items;
  const today = list[0]?.fcstDate;
  if (!today) return [];

  const dates = Array.from(new Set(list.map((it) => it.fcstDate))).sort();
  const todayIdx = dates.indexOf(today);
  return dates.slice(0, 3).map((date, i) => {
    const dayOffset = i + (todayIdx === 0 ? 0 : 0);
    const dayItems = list.filter((it) => it.fcstDate === date);
    const tmps = dayItems
      .filter((it) => it.category === "TMP")
      .map((it) => Number(it.fcstValue))
      .filter((n) => Number.isFinite(n));
    const tmnMatch = dayItems.find((it) => it.category === "TMN");
    const tmxMatch = dayItems.find((it) => it.category === "TMX");
    const high = tmxMatch ? Number(tmxMatch.fcstValue) : tmps.length ? Math.max(...tmps) : null;
    const low = tmnMatch ? Number(tmnMatch.fcstValue) : tmps.length ? Math.min(...tmps) : null;

    // 정오 근처 sky/pty 대표값
    const noonItem = dayItems
      .filter((it) => it.fcstTime === "1200" || it.fcstTime === "1500")
      .reduce<Record<string, string>>((acc, it) => {
        acc[it.category] = it.fcstValue;
        return acc;
      }, {});
    const sky = noonItem["SKY"] ?? "1";
    const pty = noonItem["PTY"] ?? "0";
    const skyText = pty !== "0" ? PTY_TEXT[pty] || "강수" : SKY_TEXT[sky] || "맑음";

    const pops = dayItems
      .filter((it) => it.category === "POP")
      .map((it) => Number(it.fcstValue))
      .filter((n) => Number.isFinite(n));
    const pop = pops.length > 0 ? Math.max(...pops) : null;

    return {
      dayOffset,
      label: dayLabel(dayOffset, date),
      date: formatDate(date),
      high: Number.isFinite(high as number) ? (high as number) : null,
      low: Number.isFinite(low as number) ? (low as number) : null,
      skyText,
      pop,
    };
  });
}

function parseMidTerm(land: MidResp, ta: MidResp, now: Date): DailyPoint[] {
  const landItem = firstMidItem(land);
  const taItem = firstMidItem(ta);
  if (!landItem) return [];

  const out: DailyPoint[] = [];
  for (let day = 3; day <= 7; day++) {
    const wfAm = String(landItem[`wf${day}Am`] ?? "");
    const wfPm = String(landItem[`wf${day}Pm`] ?? "");
    const skyText = wfPm || wfAm || "정보 없음";
    const popAm = numOrNull(landItem[`rnSt${day}Am`]);
    const popPm = numOrNull(landItem[`rnSt${day}Pm`]);
    const pop = Math.max(popAm ?? 0, popPm ?? 0);

    const high = taItem ? numOrNull(taItem[`taMax${day}`]) : null;
    const low = taItem ? numOrNull(taItem[`taMin${day}`]) : null;

    const date = new Date(now);
    date.setDate(date.getDate() + day);
    out.push({
      dayOffset: day,
      label: dayLabel(day, formatDateForKma(date)),
      date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      high,
      low,
      skyText: typeof skyText === "string" ? skyText : "정보 없음",
      pop: pop || null,
    });
  }
  return out;
}

function firstMidItem(resp: MidResp): Record<string, string | number | null> | null {
  const item = resp.response.body?.items?.item;
  if (!item) return null;
  return Array.isArray(item) ? item[0] ?? null : item;
}

function numOrNull(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
}

function mergeDaily(short: DailyPoint[], mid: DailyPoint[]): DailyPoint[] {
  // short(0~2) + mid(3~7). 같은 dayOffset 충돌 시 short 우선.
  const byOffset = new Map<number, DailyPoint>();
  for (const d of short) byOffset.set(d.dayOffset, d);
  for (const d of mid) if (!byOffset.has(d.dayOffset)) byOffset.set(d.dayOffset, d);
  return Array.from(byOffset.values()).sort((a, b) => a.dayOffset - b.dayOffset);
}

const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function dayLabel(offset: number, dateStr: string): string {
  if (offset === 0) return "오늘";
  if (offset === 1) return "내일";
  if (offset === 2) return "모레";
  // dateStr is YYYYMMDD or YYYY-MM-DD
  const compact = dateStr.replace(/[^0-9]/g, "");
  if (compact.length >= 8) {
    const y = Number(compact.slice(0, 4));
    const m = Number(compact.slice(4, 6)) - 1;
    const d = Number(compact.slice(6, 8));
    const dt = new Date(y, m, d);
    return `${KOREAN_WEEKDAYS[dt.getDay()]}요일`;
  }
  return `+${offset}일`;
}

function formatDate(yyyymmdd: string): string {
  const compact = yyyymmdd.replace(/[^0-9]/g, "");
  if (compact.length < 8) return yyyymmdd;
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function formatDateForKma(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function midTermBaseTime(now: Date): string {
  const tzNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const hour = tzNow.getHours();
  const day = new Date(tzNow);
  let baseHour: number;
  if (hour < 6) {
    day.setDate(day.getDate() - 1);
    baseHour = 18;
  } else if (hour < 18) {
    baseHour = 6;
  } else {
    baseHour = 18;
  }
  // KMA expects 10-digit tmFc: YYYYMMDDHH (no minutes).
  return `${day.getFullYear()}${pad(day.getMonth() + 1)}${pad(day.getDate())}${pad(baseHour)}`;
}

// 현재 시각을 KST 시 단위 키(YYYYMMDDHH00)로 — 시간대별 예보 컷 기준.
function kstHourKey(now: Date): string {
  const tz = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return `${tz.getFullYear()}${pad(tz.getMonth() + 1)}${pad(tz.getDate())}${pad(tz.getHours())}00`;
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

  return {
    base_date: `${day.getFullYear()}${pad(day.getMonth() + 1)}${pad(day.getDate())}`,
    base_time: `${pad(base)}00`,
  };
}
