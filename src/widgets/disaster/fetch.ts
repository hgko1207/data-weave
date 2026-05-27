import type { WidgetContext } from "../_types";
import {
  disasterConfigSchema,
  disasterDataSchema,
  type DisasterData,
  type EmergencyLevel,
} from "./schema";
import { buildMockDisaster } from "./mock";
import { logger } from "@/lib/logger";

// 행정안전부 긴급재난문자 — 재난안전데이터공유플랫폼(safetydata.go.kr) 기반.
// 공유플랫폼 별도 가입 + 활용신청 필요. data.go.kr 연계(15134001).
// 알려진 응답 필드(대문자 약어): CRT_DT(생성일시) · RCPTN_RGN_NM(수신지역) ·
//   DST_SE_NM(재난구분) · EMRG_STEP_NM(긴급단계) · MSG_CN(메시지).
// endpoint/응답 spec 확정 전까지 mock. DISASTER_API_KEY 발급 후 실 연동.

export async function fetchDisaster(ctx: WidgetContext): Promise<DisasterData> {
  const cfg = disasterConfigSchema.parse(ctx.config);
  const key = process.env.DISASTER_API_KEY || process.env.DATA_GO_KR_KEY;
  const region = `${cfg.sido} ${cfg.sigungu}`;

  if (!key) {
    logger.info("disaster.fetch fallback to mock", { reason: "no DISASTER/DATA_GO_KR key" });
    return disasterDataSchema.parse(buildMockDisaster(region, cfg.windowHours, cfg.level));
  }

  // 실 endpoint/응답 확정 후 연동. 현재는 mock — UI/UX는 완전 동작.
  return disasterDataSchema.parse(buildMockDisaster(region, cfg.windowHours, cfg.level));
}

// 신버전 응답의 긴급단계명 → 우리 level. (실 연동 시 사용)
export function mapEmergencyLevel(stepName: string | undefined): EmergencyLevel {
  if (!stepName) return "info";
  if (stepName.includes("위급")) return "critical";
  if (stepName.includes("긴급")) return "emergency";
  return "info";
}
