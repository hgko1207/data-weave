import type { EmergencyLevel } from "./schema";

// 정보안전부 EMRG_STEP_NM → 우리 EmergencyLevel.
// 별도 파일 — fetch.ts(server fetch + logger 의존) 없이 import해 테스트 용이.
export function mapEmergencyLevel(stepName: string | undefined): EmergencyLevel {
  if (!stepName) return "info";
  if (stepName.includes("위급")) return "critical";
  if (stepName.includes("긴급")) return "emergency";
  return "info";
}
