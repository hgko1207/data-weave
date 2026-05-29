import type { WidgetContext } from "../_types";
import {
  disasterConfigSchema,
  disasterDataSchema,
  type DisasterData,
  type DisasterMessage,
  type EmergencyLevel,
} from "./schema";
import { buildMockDisaster } from "./mock";
import { logger } from "@/lib/logger";

// 행정안전부 긴급재난문자 (재난안전데이터공유플랫폼).
//   https://www.safetydata.go.kr/V2/api/DSSP-IF-00247?serviceKey=&pageNo=&numOfRows=&returnType=json
//   응답: { header.resultCode "00", body: [{ SN, CRT_DT "yyyy/mm/dd HH:MM:SS",
//          RCPTN_RGN_NM 수신지역, DST_SE_NM 재난구분, EMRG_STEP_NM 긴급단계,
//          MSG_CN 메시지 }] }
//   ⚠ body가 SN 오름차순(오래된→최신) → 최신을 보려면 마지막 페이지를 받음.
const DISASTER_BASE = "https://www.safetydata.go.kr/V2/api/DSSP-IF-00247";
const PAGE_SIZE = 200; // 한 번에 받을 최신 건수

type RawMessage = {
  SN?: number | string;
  CRT_DT?: string;
  RCPTN_RGN_NM?: string;
  DST_SE_NM?: string;
  EMRG_STEP_NM?: string;
  MSG_CN?: string;
};

type RawResponse = {
  header?: { resultCode?: string; resultMsg?: string; errorMsg?: string | null };
  totalCount?: number;
  numOfRows?: number;
  pageNo?: number;
  body?: RawMessage[];
};

export async function fetchDisaster(ctx: WidgetContext): Promise<DisasterData> {
  const cfg = disasterConfigSchema.parse(ctx.config);
  const key = process.env.DISASTER_API_KEY;
  const region = `${cfg.sido} ${cfg.sigungu}`;

  if (!key) {
    logger.info("disaster.fetch fallback to mock", { reason: "no DISASTER_API_KEY" });
    return disasterDataSchema.parse(buildMockDisaster(region, cfg.windowHours, cfg.level));
  }

  try {
    // 1) totalCount 확인 (한 건만)
    const probeUrl = `${DISASTER_BASE}?${new URLSearchParams({
      serviceKey: key,
      pageNo: "1",
      numOfRows: "1",
      returnType: "json",
    }).toString()}`;
    const probeRes = await fetch(probeUrl, { signal: ctx.abort });
    if (!probeRes.ok) throw new Error(`HTTP ${probeRes.status}`);
    const probe = (await probeRes.json()) as RawResponse;
    if (probe.header?.resultCode !== "00") {
      throw new Error(`API ${probe.header?.resultCode}: ${probe.header?.resultMsg}`);
    }
    const total = probe.totalCount ?? 0;
    if (total === 0) {
      return emptyData(region, cfg.windowHours, cfg.level);
    }

    // 2) 마지막 페이지 = 최신 PAGE_SIZE건
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const dataUrl = `${DISASTER_BASE}?${new URLSearchParams({
      serviceKey: key,
      pageNo: String(lastPage),
      numOfRows: String(PAGE_SIZE),
      returnType: "json",
    }).toString()}`;
    const dataRes = await fetch(dataUrl, { signal: ctx.abort });
    if (!dataRes.ok) throw new Error(`HTTP ${dataRes.status}`);
    const data = (await dataRes.json()) as RawResponse;
    if (data.header?.resultCode !== "00") {
      throw new Error(`API ${data.header?.resultCode}: ${data.header?.resultMsg}`);
    }
    const raw = data.body ?? [];

    // 정규화 → SN desc(최신순)
    const normalized = raw
      .map(normalize)
      .filter((m): m is DisasterMessage => m !== null)
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt));

    // windowHours 필터
    const cutoff = Date.now() - cfg.windowHours * 60 * 60 * 1000;
    let messages = normalized.filter((m) => {
      const t = Date.parse(m.sentAt);
      return Number.isFinite(t) && t >= cutoff;
    });

    // 지역 매칭 (시·도 포함, 시·군·구 가능하면 추가 좁힘)
    const sido = cfg.sido;
    const sigungu = cfg.sigungu;
    const sidoMatched = messages.filter((m) => m.region.includes(sido));
    if (sidoMatched.length > 0) messages = sidoMatched;
    if (sigungu) {
      const sguMatched = messages.filter((m) => m.region.includes(sigungu));
      if (sguMatched.length > 0) messages = sguMatched;
    }

    // 긴급단계 필터
    if (cfg.level !== "all") {
      messages = messages.filter((m) => m.level === cfg.level);
    }

    return disasterDataSchema.parse({
      region,
      windowHours: cfg.windowHours,
      level: cfg.level,
      messages: messages.slice(0, 100),
      total: messages.length,
      source: "live",
    });
  } catch (err) {
    logger.warn("disaster.fetch failed, using mock", {
      error: err instanceof Error ? err.message : String(err),
    });
    return disasterDataSchema.parse(buildMockDisaster(region, cfg.windowHours, cfg.level));
  }
}

function emptyData(
  region: string,
  windowHours: number,
  level: DisasterData["level"],
): DisasterData {
  return {
    region,
    windowHours,
    level,
    messages: [],
    total: 0,
    source: "live",
  };
}

function normalize(row: RawMessage): DisasterMessage | null {
  const msg = row.MSG_CN?.trim();
  if (!msg) return null;
  const crtDt = row.CRT_DT?.trim();
  if (!crtDt) return null;
  // "2023/09/19 12:22:17" → ISO "2023-09-19T12:22:17+09:00" (KST)
  const sentAt = toIsoKst(crtDt);
  if (!sentAt) return null;
  return {
    id: `disaster-${row.SN ?? crtDt}-${(row.RCPTN_RGN_NM ?? "").slice(0, 10)}`,
    sentAt,
    region: row.RCPTN_RGN_NM?.trim() || "",
    disasterType: row.DST_SE_NM?.trim() || "기타",
    level: mapLevel(row.EMRG_STEP_NM),
    message: msg,
  };
}

function toIsoKst(crtDt: string): string | null {
  // "2023/09/19 12:22:17" → "2023-09-19T12:22:17+09:00"
  const m = crtDt.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+09:00`;
}

function mapLevel(stepName: string | undefined): EmergencyLevel {
  if (!stepName) return "info";
  if (stepName.includes("위급")) return "critical";
  if (stepName.includes("긴급")) return "emergency";
  return "info";
}
