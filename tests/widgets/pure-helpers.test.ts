// 순수 헬퍼 함수 테스트 — 도메인 계산 로직이 의도대로 동작하는지.
import { describe, it, expect } from "vitest";

import { supplyPyeong, pyeongLabel, formatAmount } from "@/widgets/apartment/format";
import { mapEmergencyLevel } from "@/widgets/disaster/utils";

describe("apartment format helpers", () => {
  it("supplyPyeong: 전용면적 84.9㎡ → 약 33평형(공급)", () => {
    expect(supplyPyeong(84.9)).toBeCloseTo(33.3, 1);
  });

  it("pyeongLabel: 84.9㎡ → '약 33평'", () => {
    expect(pyeongLabel(84.9)).toBe("약 33평");
  });

  it("pyeongLabel: 0 또는 NaN → '—'", () => {
    expect(pyeongLabel(0)).toBe("—");
    expect(pyeongLabel(Number.NaN)).toBe("—");
  });

  it("formatAmount: 1억 이상 → 'N.N억'", () => {
    expect(formatAmount(50000)).toBe("5.0억");
    expect(formatAmount(124000)).toBe("12.4억");
  });

  it("formatAmount: 1억 미만 → 'N,NNN만'", () => {
    expect(formatAmount(8500)).toBe("8,500만");
  });

  it("formatAmount: null → '—'", () => {
    expect(formatAmount(null)).toBe("—");
  });
});

describe("disaster level mapping", () => {
  it("EMRG_STEP_NM '위급재난' → critical", () => {
    expect(mapEmergencyLevel("위급재난")).toBe("critical");
  });

  it("'긴급재난' → emergency", () => {
    expect(mapEmergencyLevel("긴급재난")).toBe("emergency");
  });

  it("'안전안내' → info", () => {
    expect(mapEmergencyLevel("안전안내")).toBe("info");
  });

  it("undefined / 빈 문자열 → info (안전 기본값)", () => {
    expect(mapEmergencyLevel(undefined)).toBe("info");
    expect(mapEmergencyLevel("")).toBe("info");
  });

  it("알 수 없는 단계 → info", () => {
    expect(mapEmergencyLevel("기타")).toBe("info");
  });
});
