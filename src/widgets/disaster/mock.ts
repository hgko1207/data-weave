import type { DisasterData, DisasterMessage, EmergencyLevel } from "./schema";

function regionSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

type Template = {
  disasterType: string;
  level: EmergencyLevel;
  message: (region: string) => string;
};

// 현실적인 재난문자 템플릿 (실데이터 형태 흉내).
const TEMPLATES: Template[] = [
  {
    disasterType: "호우",
    level: "emergency",
    message: (r) => `[기상청] ${r} 호우주의보 발효. 하천변·저지대 침수 주의, 외출 자제 바랍니다.`,
  },
  {
    disasterType: "폭염",
    level: "info",
    message: (r) => `[${r}] 폭염주의보 발효. 낮 시간대 야외활동 자제, 충분한 수분 섭취하세요.`,
  },
  {
    disasterType: "실종",
    level: "emergency",
    message: (r) => `[경찰청] ${r} 인근 80대 여성(치매) 실종. 발견 시 112 신고 바랍니다.`,
  },
  {
    disasterType: "안전안내",
    level: "info",
    message: (r) => `[${r}] 산불 조심 기간입니다. 입산 시 화기 소지 금지, 논·밭두렁 태우기 자제.`,
  },
  {
    disasterType: "대설",
    level: "emergency",
    message: (r) => `[기상청] ${r} 대설주의보. 빙판길 교통사고 주의, 대중교통 이용 권장.`,
  },
  {
    disasterType: "지진",
    level: "critical",
    message: (r) => `[기상청] ${r} 인근 규모 3.2 지진 발생. 낙하물 주의, 안전한 곳으로 대피하세요.`,
  },
  {
    disasterType: "강풍",
    level: "emergency",
    message: (r) => `[기상청] ${r} 강풍주의보. 간판·시설물 낙하 주의, 안전사고에 유의하세요.`,
  },
  {
    disasterType: "안전안내",
    level: "info",
    message: (r) => `[${r}] 미세먼지 비상저감조치 시행. 노약자 외출 자제, 마스크 착용 권장.`,
  },
];

export function buildMockDisaster(
  region: string,
  windowHours: number,
  level: "all" | EmergencyLevel,
): DisasterData {
  const seed = regionSeed(region);
  const now = Date.now();
  const count = 5 + (seed % 5); // 5~9건
  const all: DisasterMessage[] = Array.from({ length: count }, (_, i) => {
    const t = TEMPLATES[(i + seed) % TEMPLATES.length];
    // windowHours 내에서 시간 분산
    const hoursAgo = Math.floor(((seed + i * 37) % (windowHours * 60)) / 60);
    const sentAt = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
    return {
      id: `mock-disaster-${region}-${i}`,
      sentAt,
      region,
      disasterType: t.disasterType,
      level: t.level,
      message: t.message(region),
    };
  }).sort((a, b) => b.sentAt.localeCompare(a.sentAt));

  const filtered = level === "all" ? all : all.filter((m) => m.level === level);

  return {
    region,
    windowHours,
    level,
    messages: filtered,
    total: filtered.length,
    source: "mock",
  };
}
