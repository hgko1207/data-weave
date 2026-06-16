# 복지·지원금 매칭 위젯 (`welfare`)

> 사용자가 자기 지역 + 카테고리(청년/육아/노인/장애 등)를 고르면, **받을 수 있는 정부·지자체 지원금 목록**을 보여주는 위젯. DataWeave 위젯 패턴(`schema/mock/fetch/Render/ConfigForm/index`) 그대로.

**한 줄 가치**: "내가 모르고 못 받는 지원금이 없게."

---

## 우선순위·범위

이 위젯은 DataWeave 11번째 위젯으로 합류. 기존 10개와 동일한 위젯 모델 — 따로 페이지·아키텍처 만들지 않는다. 사이드바 그룹은 **생활·안전** (emerald 톤 그대로).

| 항목 | Phase 1 (MVP) | Phase 2 | Phase 3+ |
|------|----|----|----|
| 자격 매칭 | **지역 + 카테고리만** | + 나이/성별 | + 소득·가구·조건 |
| 데이터 소스 | **정적 큐레이션 JSON** (수동 모음) | data.go.kr 통합 OpenAPI | 지자체별 자체 API |
| 결과 형식 | 카드 리스트 + 외부 신청 링크 | 즐겨찾기 | 알림(신규/마감) |

Phase 1만으로도 기존 위젯 수준의 가치 — 다른 위젯들도 처음엔 mock으로 출발했음.

---

## 라우트·URL

- 메인: `/w/welfare?sido=&sigungu=&category=`
- `sido` 시·도 (전국 옵션 포함)
- `sigungu` 시·군·구 (선택)
- `category` 청년 / 육아 / 노인 / 장애 / 한부모 / 저소득 / 창업·취업 / 주거 / 의료 / `all`

기존 위젯의 SearchParams = URL 진실 컨벤션 그대로.

---

## 데이터 소스 — 솔직한 현실

**이상**: 단일 통합 API로 "조건 입력 → 자격 매칭 결과" 받기. **현실**: 한국 복지 데이터는 분산 + 비정형이라 단일 API가 없음.

**가용한 소스**:

| 소스 | 형태 | 비고 |
|------|------|------|
| 복지로 (bokjiro.go.kr) | 검색 페이지 위주, **API는 제한적** | 통합 안내 사이트지만 OpenAPI 빈약. 스크래핑 비추 |
| 한국사회보장정보원 사회보장급여 통합조회 (data.go.kr 15000031) | OpenAPI | 신청 가능하지만 응답 구조 무거움 + 일관성 낮음 |
| 보건복지부 정책 OpenAPI | 카테고리별 분산 | 노인/아동/장애 별 별도 |
| 청년정책통합 (온통청년 youthcenter.go.kr) | **OpenAPI 양호** | 청년 카테고리는 단독으로 잘 됨 — Phase 2에서 우선 통합 가능 |
| 지자체 자체 API | 시·도별 천차만별 | 서울/경기 정도만 정리됨, 나머지 비추 |

**Phase 1 결정**: 위 소스들 중 *카테고리 대표 항목* 30~50건을 **수동 큐레이션해서 정적 JSON으로 시작**. mock의 진화형. 다른 위젯들과 다른 점: 처음부터 "실제 가치 있는 정적 데이터"를 모아 둠.

```ts
// src/widgets/welfare/data/curated.json
[
  {
    id: "yc-housing-2026",
    name: "청년월세특별지원",
    category: "주거",
    targetGroup: "청년",
    eligibility: "만 19~34세, 무주택, 부모와 별도 거주, 중위소득 60% 이하 가구",
    amount: "월 20만원, 최대 12개월",
    region: "전국",
    department: "국토교통부",
    applyUrl: "https://www.gov.kr/...",
    deadline: "2026-12-31",
    updatedAt: "2026-05-01"
  },
  ...
]
```

큐레이션 작업: 1~2일 (실제 정책 모으는 시간). 분기별 1회 수동 업데이트.

**Phase 2**: 청년정책통합 API 라이브 연동 (가장 잘 된 소스). 청년 카테고리만 live, 나머지는 정적 유지.

---

## 화면 구성

기존 위젯과 동일한 골격: `PageFrame` + `Filters` + `Detail`.

### 1. Filters
- 시·도 select (RegionPicker 패턴 재사용 가능)
- 시·군·구 select (cascade — apartment의 lawd-codes 재활용 가능)
- 카테고리 chip group (9개 + `all`)

### 2. Detail
- 상단: `StatCard` 3개 — 매칭 건수 / 카테고리 / 지역 (DisasterDetail의 StatsRow 패턴 재사용 — `@/components/widget/StatCard`)
- 결과: 카드 리스트 (FoodRecallDetail의 timeline 패턴 차용)
  - 카드: 카테고리 chip (의미별 톤 — 청년=emerald, 노인=amber, 장애=cyan 등) + 지원금명 + 한 줄 자격 요약 + 금액 + 신청 마감 + **외부 신청 링크** (카카오맵 외부 링크 패턴 재사용)
- 빈 상태: "이 지역·카테고리에 등록된 지원금이 없어요" + 카테고리 변경 안내

---

## 스키마 초안

```ts
// src/widgets/welfare/schema.ts
export const welfareConfigSchema = z.object({
  v: z.literal(1),
  sido: z.string().default("전국"),
  sigungu: z.string().optional(),
  category: z.enum([
    "all", "청년", "육아", "노인", "장애", "한부모",
    "저소득", "창업·취업", "주거", "의료"
  ]).default("all"),
});

export const welfareItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  targetGroup: z.string(),
  eligibility: z.string(),          // 자격 요약 한 줄
  amount: z.string().nullable(),    // 금액·기간 (자유 텍스트)
  region: z.string(),               // "전국" 또는 시·도명
  department: z.string(),           // 주무부처/지자체
  applyUrl: z.string().nullable(),  // 신청 페이지
  deadline: z.string().nullable(),  // 마감일 ISO
  updatedAt: z.string(),
});

export const welfareDataSchema = z.object({
  region: z.string(),
  category: z.string(),
  items: z.array(welfareItemSchema),
  total: z.number(),
  source: z.enum(["curated", "live", "mock"]),
});
```

`source: "curated"` 는 다른 위젯의 `"live"`와 동급으로 취급 — 사용자에겐 "큐레이션 데이터 (최근 업데이트 N월)" 안내.

---

## Phase별 구현 순서

### Phase 1 (3~5일)
1. `src/widgets/welfare/` 6개 파일 (`schema.ts`, `mock.ts`, `fetch.ts`, `Render.tsx`, `index.ts`, ~~ConfigForm~~ 불필요)
2. `data/curated.json` 첫 데이터 30~50건 수동 큐레이션
3. `_registry.bootstrap.ts` 등록 한 줄
4. `_metadata.ts` 메타 추가 (group: `living`, icon: `HandCoins` 또는 `HeartHandshake`)
5. `src/app/(dashboard)/w/welfare/page.tsx` 상세 페이지
6. `src/components/widget/welfare/{WelfareFilters, WelfareDetail}.tsx`
7. `docs/widgets/welfare.md` 화면 문서
8. (선택) `tests/` — fetch 정적 JSON 파싱·필터링 unit test

### Phase 2 (2~3일)
9. 청년정책통합 OpenAPI 라이브 연동 (`source: "live"`)
10. 청년 카테고리는 live + 큐레이션 merge, 나머지는 큐레이션만
11. 캐싱 (Next.js `revalidate: 3600`)

### Phase 3 (1주~)
12. 사용자 프로필 입력 (나이/소득/가구) — localStorage
13. 매칭 점수 (자격 일치도)
14. 즐겨찾기 (`bookmarks` 패턴 재사용)
15. 마감 D-7 알림 (Phase B의 알림 인프라 의존)

---

## 인프라 재사용

기존 위젯에서 그대로 가져올 것:

| 부분 | 재사용 출처 |
|------|------------|
| 시·도/시·군·구 cascade | `apartment/lawd-codes.ts`, `weather/regions.ts` |
| 카테고리 chip 의미별 톤 | DisasterDetail의 `LEVEL_META` 패턴 |
| StatCard | `@/components/widget/StatCard` (공유) |
| 카드 리스트 + 외부 신청 링크 | FoodRecallDetail / PharmacyDetail |
| DataSourceNotice | 큐레이션 데이터 안내용으로 재사용 |
| 즐겨찾기 (Phase 3) | `lib/bookmarks.ts` 기존 |
| 사이드바 그룹 배경 틴트 | living = emerald — 자동 적용 |

신규 작성: 정적 JSON 로딩·필터링 로직(`fetch.ts`)만.

---

## 리스크·미해결

- **큐레이션 데이터 품질**: 분기별 수동 업데이트의 지속 가능성. → 분기 1회 30분 작업 정도면 OK.
- **자격 매칭 정확성**: Phase 1엔 자격을 텍스트로만 보여줌(자동 매칭 X) — 사용자가 직접 읽고 판단. **법적 책임 회피 필요** — 카드에 "신청 자격은 신청 페이지에서 다시 확인" disclaimer.
- **신청 URL 변동**: 정부 사이트 URL은 가끔 바뀜 → broken link 감지 필요 (Phase 3 cron으로 monthly check).
- **사용자 프로필 = 민감 정보**: Phase 3에서 나이/소득 입력 받을 때 localStorage만, 서버 전송 X.

---

## 완성 정의 (Phase 1)

- [ ] `/w/welfare?sido=대전광역시&category=청년` 접근 시 큐레이션된 청년 지원금 카드 N개 표시
- [ ] 카테고리 변경 시 URL 갱신 + 결과 재렌더
- [ ] 외부 신청 링크 클릭 시 정부 신청 페이지 새 탭
- [ ] DataSourceNotice 표시 ("큐레이션 데이터 · 최근 업데이트 YYYY-MM")
- [ ] 모바일 1-col 레이아웃 OK
- [ ] mock 폴백 (큐레이션 JSON 로딩 실패 시)
- [ ] vitest: 필터링 로직 unit test 3건 이상
- [ ] 사이드바 + 대시보드 + Cmd+K에 자동 등장

---

## 향후 확장 가능성

- "내 지역 + 내 조건 다 알려줘" 챗봇 인터페이스 (별도 프로젝트 [조례 AI](./separate/law-clear.md)와 결합 가능 — 시민 도구 결)
- 지자체 직접 입력 API (시·도 자체 운영 사이트와 협력)
- 알림: 마감 D-7 / 신규 지원금 등록 시
- 친구·가족 공유 ("이 지원금 받을 수 있을 거야")
