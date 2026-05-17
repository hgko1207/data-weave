# DataWeave — Implementation Plan (v3)

> 한국 공공데이터 **조회형 위젯 대시보드** + 데이터 익스플로러. Phase 1 (위젯 3개, 무료 호스팅) ✅ 완성 → Phase 1.5 (사이드바 네비 + 상세 페이지 + 위젯 강화 + 신규 위젯) ✅ 완성 → Phase 2 (Watcher Platform: 알림형 위젯 + cron 인프라)는 [TODOS.md](TODOS.md) TODO 8.
>
> 본 문서는 `/plan-ceo-review` + `/plan-eng-review` 통과 후 실제 구현하며 진화한 결과물.
> **단일 진실 원천 (SSOT) — 코드와 어긋나면 코드가 기준.**

---

## 변경 이력

| 날짜 | 버전 | 변경 | 출처 |
|------|------|------|------|
| 2026-05-04 | v1 | 최초 작성 — 위젯 4개 + Web Push + Telegram 듀얼 알림 | `/plan-ceo-review` SCOPE EXPANSION |
| 2026-05-04 | v2 | **Phase 1 조회형 3개로 축소**. 캠핑장 + 알림 인프라 → Phase 2. | `/plan-eng-review` + Outside Voice (#1 Vercel Hobby cron 1/day 한도) + 사용자 결정 (조회만, 무료) |
| 2026-05-16 | v3 | **Phase 1 + 1.5 완성 반영.** Step 0~6 완료 마킹. 위젯 4개로 확장 (아파트 실거래가 추가). 사이드바 네비, 위젯별 상세 페이지(URL `searchParams`), 즐겨찾기, 위젯별 강화 기능 (등급/영업중/정렬/추이 차트) §14에 정리. Aurora bg는 §7 deprecated 표시 (solid surface로 교체 — [DESIGN.md](DESIGN.md) §14 참조). | 실제 구현 진화 반영, 사용자 요청 |
| 2026-05-17 | v3.1 | **Phase A — 아파트 단지 상세 페이지** (`/w/apartment/building`) 추가. 거래 목록에서 아파트명 클릭 → 최근 6개월 거래 집계 + 평형별 그룹 + 카카오맵 외부 링크. 평수 표시는 공급평(33평형) 기준으로 통일. §14.8 추가. | 사용자 요청 (지도 + 단지 상세) |

---

## 1. 제품 차터

| 항목 | 결정 |
|------|------|
| 제품 본질 (Phase 1) | 한국 공공데이터 **조회형 위젯 대시보드** |
| 제품 본질 (Phase 2 비전) | Watcher Platform — 알림형 위젯 + cron + 듀얼 채널 |
| Phase 1 사용자 | 본인 1명. 데이터 모델은 Phase 2 멀티유저 호환 |
| Phase 1 알림 | **없음**. Phase 2에 Web Push 활성화. |
| Phase 1 인프라 비용 | **$0** — Vercel Hobby + Supabase Free + 공공 API |
| 구현 비용 가이드 | CC 기준 **~4시간**, 인간 기준 ~1주 |

---

## 2. 기술 스택

- **Framework:** Next.js 15+ (App Router, RSC strict)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui (cherry-pick) + Lucide React + cmdk
- **Backend:** Supabase Free Tier (Postgres, Auth-ready). **cron / push / queue 모두 X.**
- **Validation:** zod (strict 모드, schema drift 감지)
- **Testing:** Vitest + MSW (unit + integration). Playwright E2E는 optional.
- **PWA:** manifest.ts + Service Worker (offline 정적 캐시만). **Push subscribe 없음.**
- **Design system:** [DESIGN.md](DESIGN.md) — Emerald 액센트 + zinc 솔리드 surface (Supabase/shadcn 톤), JetBrains Mono 데이터, Cmd+K. Aurora bg는 §7에 deprecated.
- **XML parser:** `fast-xml-parser` — 국토교통부 RTMS 응답이 XML only라 v3에서 추가.

---

## 3. 위젯 목록 (모두 조회형, v3 = 4개)

| ID | 데이터 소스 | API 시스템 | 상세 페이지 강화 |
|----|------------|------------|------------------|
| `weather` | 기상청 단기예보 + 에어코리아 + 기상청 중기예보 | data.go.kr 통합 키 | 지역 chip 셀렉터 + 시간대별 24h + 주간 예보 8일 + 습도/풍속/풍향/오늘 high·low |
| `pharmacy` | 국립중앙의료원 응급의료 (응급실 + 약국) | data.go.kr 통합 키 | 시·도/시·군·구 cascade + 반경 + 종류 chip + **지금 영업중 토글** |
| `food-recall` | 식품안전나라 I0490 (별도 시스템) | foodsafetykorea.go.kr **별도 키** | 키워드 chip + 기간 chip + **등급 필터 (1/2/3등급)** |
| `apartment` | 국토교통부 RTMS 매매 실거래가 (15126469) | data.go.kr 통합 키 | 시·도/시·군·구 cascade + 월 stepper + **정렬 chip** + **6개월 평균가 추이 차트** |

**모든 위젯은 사용자 능동 조회.** 새로고침 버튼으로 강제 fetch. Phase 2에 cron 폴링 추가 예정 ([TODOS.md](TODOS.md) TODO 8).

**공통 강화 (Phase 1.5, v3):**
- **즐겨찾기**: 모든 상세 페이지 헤더에 ★ 버튼 — 현재 검색 URL을 `localStorage["dataweave.bookmarks"]`에 저장 → 사이드바 즐겨찾기 섹션에서 1클릭 복귀.
- **검색 상태 = URL searchParams**: 클라이언트 상태 없음. 새로고침/공유/북마크 OK.

---

## 4. 위젯 인터페이스 (lock-in 확정)

```typescript
// src/widgets/_types.ts

export interface Widget<TData = unknown> {
  // 식별
  readonly id: string;                // 'weather' | 'pharmacy' | 'food-recall'
  readonly title: string;
  readonly icon: LucideIcon;
  readonly category: 'view';          // Phase 1: 'view'만. Phase 2: 'view' | 'alert'

  // 능력 1: 데이터 가져오기 (server-side)
  fetch(ctx: WidgetContext): Promise<TData>;

  // 능력 2: 화면에 그리기 (client component)
  Render: React.FC<{ data: TData; status: WidgetStatus; config: WidgetConfig }>;

  // 능력 3: 위젯 사용자 설정 폼 (선택)
  ConfigForm?: React.FC<{ value: WidgetConfig; onChange: (v: WidgetConfig) => void }>;

  // RESERVED for Phase 2 (Watcher Platform):
  // alerting?: {
  //   pollIntervalSec: number;
  //   detectChange(prev: TData | null, next: TData): ChangeEvent[] | null;
  //   formatNotification(events: ChangeEvent[]): NotifyPayload;
  // }
}

export type WidgetContext = {
  config: WidgetConfig;
  abort: AbortSignal;                 // fetch 취소
  now: Date;                          // 테스트용 clock injection
  // RESERVED for Phase 2: prevSnapshot
};

export type WidgetStatus = 'loading' | 'success' | 'error' | 'partial';

export type WidgetConfig = {
  v: 1;                               // schema version (Outside Voice #5 — 미래 진화 대비)
  nickname?: string;                  // 같은 type 여러 인스턴스 구분 (예: "강원" / "충청")
  [key: string]: unknown;             // 위젯-specific 필드
};

// RESERVED for Phase 2:
// export type ChangeEvent = { kind: 'added' | 'removed' | 'modified'; key: string; payload: ...; detectedAt: Date };
// export type NotifyPayload = { push: { title; body; url?; icon? } };
```

**핵심:**
- `category: 'view'` — Phase 1 모든 위젯. Phase 2엔 `'view' | 'alert'` 유니언으로 확장.
- `alerting?` 필드는 인터페이스에 *주석으로 reserved*. Phase 2에 unncomment + 위젯별 추가.
- `WidgetConfig.v: 1` — 미래 config 형식 진화 시 마이그레이션 키 (Outside Voice #5 자동 적용).

---

## 5. 폴더 구조

```
data-weave/
├── docs/
│   ├── PLAN.md
│   ├── DESIGN.md
│   └── TODOS.md
├── README.md
├── .env.example
│
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # 메인 대시보드 (RSC)
│   │   │   ├── layout.tsx            # 헤더 + 풀폭 그리드
│   │   │   ├── catalog/page.tsx      # 위젯 카탈로그 (D3)
│   │   │   └── settings/page.tsx     # 위젯 인스턴스 관리, 디바이스 PWA install
│   │   ├── manifest.ts               # PWA
│   │   └── icon.png
│   │
│   ├── widgets/                      # ★ 플러그인 root ★
│   │   ├── _registry.ts              # 모든 위젯 등록 한 곳
│   │   ├── _types.ts                 # Widget interface (위 §4)
│   │   ├── _fetch-wrapper.ts         # zod strict + retry + abort + timeout 공통
│   │   ├── README.md                 # "5분 안에 새 위젯 만들기" 가이드
│   │   ├── weather/
│   │   │   ├── index.ts              # Widget 객체 export
│   │   │   ├── fetch.ts              # 기상청 + 에어코리아
│   │   │   ├── schema.ts             # zod schema (drift 감지)
│   │   │   ├── Render.tsx
│   │   │   ├── ConfigForm.tsx
│   │   │   └── mock.ts               # Phase 1 mock fallback
│   │   ├── pharmacy/
│   │   └── food-recall/
│   │
│   ├── components/
│   │   ├── widget/
│   │   │   ├── BaseWidget.tsx        # 공통 레이아웃
│   │   │   ├── WidgetHeader.tsx
│   │   │   ├── WidgetBody.tsx
│   │   │   ├── WidgetSkeleton.tsx
│   │   │   ├── WidgetError.tsx
│   │   │   ├── WidgetDiff.tsx        # D2 — 새로고침 시 변화 색표시
│   │   │   ├── WidgetRefresh.tsx
│   │   │   └── WidgetHealthDot.tsx   # 위젯별 fetch 성공률
│   │   ├── command-palette.tsx       # Cmd+K (cmdk lib)
│   │   ├── error-boundary.tsx        # 위젯 격리 (client)
│   │   ├── aurora-bg.tsx             # Slop-회피 배경
│   │   └── ui/                       # shadcn 생성물
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts             # service role
│   │   │   ├── browser.ts            # anon
│   │   │   └── types.ts              # supabase-gen
│   │   └── logger.ts
│   │
│   ├── hooks/
│   │   └── useWidgetData.ts          # client refresh + abort
│   │
│   └── types/
│       └── widget.ts
│
├── supabase/
│   └── migrations/
│       └── 0001_widgets.sql          # 단일 마이그레이션
│
├── public/
│   ├── icons/                        # PWA icons
│   └── ...
│
└── tests/
    ├── widgets/
    │   ├── weather.test.ts
    │   ├── pharmacy.test.ts
    │   └── food-recall.test.ts
    └── widget-runner.test.ts         # _fetch-wrapper 테스트
```

**총 파일 수: ~50개. CC ~4시간.**
새 위젯 추가 = `src/widgets/<id>/` 폴더 + `_registry.ts` 한 줄 등록.

---

## 6. Supabase 스키마

```sql
-- supabase/migrations/0001_widgets.sql
create table widgets (
  id uuid primary key default gen_random_uuid(),
  type text not null,                  -- 'weather' | 'pharmacy' | 'food-recall'
  user_id uuid,                        -- Phase 1 nullable, Phase 2 RLS
  config jsonb not null default '{"v":1}',  -- WidgetConfig (위 §4) — 'v' 키 필수
  active boolean not null default true,
  created_at timestamptz default now()
);
create index on widgets (user_id, active);
create index on widgets (type) where active = true;
```

**Phase 2에 추가될 테이블:** `snapshots`, `notifications`, `push_subs`, `cron_runs` (TODO 8 참조).

---

## 7. 환경변수 (`.env.example`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=             # server only (config CRUD)

# 공공 API (data.go.kr 등록 필요, 1~3일)
KMA_API_KEY=                           # 기상청 단기예보
EMERGENCY_API_KEY=                     # 응급의료 OpenAPI
MFDS_API_KEY=                          # 식약처 회수·리콜
AIRKOREA_API_KEY=                      # 미세먼지 (날씨 위젯)
```

**6개 env. 끝.** Phase 2에 VAPID, CRON_SECRET 등 추가.

---

## 8. Error & Rescue Map (조회형 한정)

| 코드패스 | 실패 모드 | Rescue | 사용자 표시 |
|---------|----------|--------|------------|
| 위젯 fetch | 5xx | 1회 재시도 → mock 폴백 | 토스트 "잠시 후 재시도" + 마지막 데이터 |
| 위젯 fetch | timeout (>7s) | 1회 재시도 | "느린 응답" + 새로고침 버튼 |
| 위젯 fetch | API key 무효 | log fatal | "설정 필요" 카드 |
| 위젯 fetch | rate limit (429) | exp backoff 무음 | (자동 복구) |
| 위젯 fetch | **schema drift** | strict zod throw → 위젯 격리 | "위젯 점검 중" + Vercel logs에 ERROR |
| 위젯 render | nil 부분 필드 | 부분 표시 | dash placeholder |
| Service Worker | 구버전 stuck | "업데이트 사용 가능" 배너 | reload prompt |
| 사용자 위치 (SOS) | 권한 거부 | 기본 좌표 (서울 시청) | "위치 켜면 더 정확" CTA |

**Critical Gaps: 0.** 알림 인프라가 빠지니 Failure modes도 단순.

**Schema drift admin alert 채널 (Outside Voice #2):** Phase 1엔 *Vercel logs*만. Phase 2에 본격 admin email + Web Push 통합. 사용자 dashboard 방문 시 위젯의 `<HealthDot>`이 빨간색으로 인지 가능.

---

## 9. 구현 순서 (Step 0~6, 모두 ✅ 완성 — Phase 1.5는 §14 참조)

### Step 0 — 프로젝트 부트스트랩 ✅
1. `npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" --use-npm`
2. shadcn/ui init: `npx shadcn@latest init` (Slate base, dark default)
3. 컴포넌트 추가: `button card dialog form input select toast skeleton sheet command`
4. 추가 deps: `zod lucide-react cmdk @supabase/supabase-js @supabase/ssr`
5. dev deps: `vitest @vitejs/plugin-react msw playwright`
6. **확인 체크포인트** (사용자)

### Step 1 — 메인 레이아웃 + 디자인 시스템 ✅
1. DESIGN.md 토큰을 `tailwind.config.ts`에 반영
2. `<AuroraBg>` 배경 컴포넌트
3. 헤더 (로고 + 설정 + 위젯 추가 + Cmd+K)
4. 풀폭 반응형 그리드 (xl:3, lg:2, md:1)
5. `<CommandPalette>` (cmdk)
6. **확인 체크포인트**

### Step 2 — BaseWidget + 격리 + Mock + Registry ✅
1. `BaseWidget` + Header/Body/Skeleton/Error/Refresh/HealthDot/Diff
2. `<ErrorBoundary>` per-widget 격리
3. `_fetch-wrapper.ts` (zod strict + retry + abort + 7s timeout)
4. `_registry.ts` 빈 등록 시스템
5. `_types.ts` Widget 인터페이스 + `WidgetConfig` (v: 1)
6. Supabase 마이그레이션 0001 적용
7. **확인 체크포인트**

### Step 3 — 위젯 1: 날씨 (mock → 실 API) ✅
1. `widgets/weather/` 5개 파일 (index/fetch/schema/Render/mock + ConfigForm)
2. mock 데이터로 카드 시각 완성
3. 실제 KMA + 에어코리아 API 연동
4. zod schema (drift 감지)
5. **확인 체크포인트**

### Step 4 — 위젯 2: SOS 병원/약국 (위치 기반) ✅
1. 위치 권한 hook (`navigator.geolocation`)
2. 응급의료 OpenAPI 연동 + 거리 계산
3. 카드 + 전화 버튼 + Naver/Kakao Map 링크
4. **확인 체크포인트**

### Step 5 — 위젯 3: 위해식품 리콜 (키워드 필터) ✅
1. 식약처 OpenAPI 연동
2. 알레르기 키워드 client-side 필터
3. 최근 24시간 vs 전체 토글
4. **확인 체크포인트**

### Step 6 — PWA + 배포 (PWA만 ✅, Vercel/Supabase는 deferred)
1. ✅ manifest.ts + 아이콘 + install prompt
2. ✅ Service Worker (정적 캐시만, dev 모드 자동 unregister)
3. ⏳ Vercel 배포 → [TODOS.md](TODOS.md) TODO 10 (사용자 결정으로 로컬-only 운영)
4. ⏳ Supabase 프로덕션 마이그레이션 → 데모 인스턴스 하드코딩 + localStorage로 충분, Vercel 시점에 함께
5. ⏳ Smoke test → Vercel 배포 시점에

**총 Step 6단계 (PWA까지 완료), CC ~4시간. Phase 1 완성.**

---

## 10. NOT in scope (Phase 1 → Phase 2 deferred)

| 항목 | 이유 | 어디로? |
|------|------|--------|
| 캠핑장 빈자리 위젯 | 알림이 코어인데 Phase 1엔 알림 인프라 없음 | TODO 8 |
| Web Push 인프라 | Vercel Hobby cron 1/day 한도 + 사용자 무료 결정 | TODO 8 |
| Telegram 봇 | 사용자가 Phase 1 단순화로 제외 | (영구 skip) |
| Vercel Cron 워커 | Hobby 1/day로 알림용 부족 | TODO 8 |
| `snapshots`/`notifications`/`push_subs`/`cron_runs` 테이블 | 알림 인프라 의존 | TODO 8 |
| 자연어 위젯 생성 (LLM) | LLM 비용·환각 리스크 | TODO 1 |
| 다중 사용자 + Auth + RLS | 싱글 유저 시작, 데이터 모델만 호환 | TODO 2 |
| 워치 갤러리·공유 | 다중 사용자 선행 | TODO 3 |
| 체육시설 취소표 | 별도 워커 + 법적 회색지대 | TODO 4 |
| 스마트홈 트리거 | 알림 인프라 의존 | TODO 5 |
| 부동산 mashup | 호갱노노 등 강한 경쟁 | (영구 skip) |
| CCTV 관제 | 스트림 호스팅 비용 | (영구 skip) |
| 휴게소 플래너 | T맵 강한 경쟁 | (영구 skip) |
| 주차장 빈자리 | 데이터 일관성 | (영구 skip) |

---

## 11. Diagrams

### 시스템 아키텍처 (Phase 1 단순)

```
                  USER (browser, PWA optional)
                            │
            ┌───────────────┼───────────────┐
            │               │               │
     ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
     │   Server    │  │   Client  │  │  Service    │
     │  Component  │  │   Render  │  │  Worker     │
     │ (위젯.fetch)│  │           │  │ (offline    │
     └──────┬──────┘  └───────────┘  │  cache only)│
            │                         └─────────────┘
            ▼
   ┌──────────────────┐
   │  공공 API 4종     │
   │  (KMA, AirKorea, │
   │   E-Gen, MFDS)   │
   └──────────────────┘
            │
            ▼
   ┌──────────────────┐
   │   Supabase       │
   │   widgets table  │  ← 사용자 위젯 인스턴스 + config
   └──────────────────┘

Phase 2 추가 예정 (점선): cron worker + push dispatcher + push_subs/snapshots/notifications/cron_runs
```

### Diagrams produced
- ✅ 시스템 아키텍처 (위)
- ✅ 폴더 구조 (§5)
- ✅ 위젯 인터페이스 (§4)
- ✅ Error/Rescue 표 (§8)
- (Phase 2에 cron/diff/notify flow 다이어그램 추가)

---

## 12. Phase 2 Trigger Condition (Outside Voice #8)

본 프로젝트가 Phase 2 (Watcher Platform 활성화)로 전환되는 조건 중 **하나라도** 충족하면 진행:

1. **사용량 기준:** 60일 연속 사용자가 매주 1회 이상 dashboard 진입
2. **명시적 결정:** "캠핑장 알림 필요" 또는 동등한 알림형 use case 등장
3. **사용자 확장:** 외부 사용자 1명 이상이 자신의 위젯 만들고 싶다고 요청
4. **데이터 확장:** 새 데이터 소스가 알림형으로 가치 큰 경우 (예: 보조금 잔여예산이 분 단위 갱신되는 새 API 등장)

조건 미충족 시 Phase 1 그대로 운영. **인프라 단순함이 가치.**

전환 결정 시 우선 처리:
- TODO 8 (Web Push + cron 인프라 + 캠핑장 위젯 일괄 추가)
- 그 다음 TODO 2 (다중 사용자 시 가족 초대) — 조건 3 충족 시
- 그 다음 TODO 1 (자연어 위젯 생성) — 데이터 소스 6개+ 시점

---

## 13. 완료 정의 (Phase 1 + 1.5 완성)

**Phase 1 (모두 ✅):**
- [x] 3개 위젯 (날씨/SOS/리콜) 모두 실 API 연동, mock fallback 동작
- [x] zod strict 파싱이 모든 위젯 fetch에 적용 (drift → mock 폴백)
- [x] BaseWidget Skeleton/Error/Refresh/HealthDot 동작
- [x] 위젯 인스턴스 demo 하드코딩 (Supabase deferred)
- [x] PWA install prompt + 정적 offline cache (dev 모드 SW 자동 unregister)
- [x] 사용자 로컬-only 운영 정상

**Phase 1.5 (모두 ✅, §14 참조):**
- [x] 사이드바 네비 (대시보드/공공데이터/즐겨찾기/설정)
- [x] 위젯별 상세 페이지 (URL `searchParams` 동기화)
- [x] 설정 페이지 — localStorage 핀 토글
- [x] 신규 위젯: 아파트 실거래가 (국토교통부 RTMS)
- [x] 위젯 강화: 등급 필터(리콜), 영업중 토글(약국), 정렬+추이 차트(아파트)
- [x] 즐겨찾기 시스템 — 검색 URL을 localStorage에 핀

**아직 안 한 것 (의식적 defer):**
- ⏳ Vercel 배포 → TODO 10
- ⏳ Supabase 인스턴스 영구 저장 → Vercel 시점에
- ⏳ tests: Vitest unit + schema drift 테스트 → 안정화되면

---

## 14. Phase 1.5 — 사이드바 + 상세 페이지 + 위젯 강화

> Phase 1 완성 후 사용자 피드백("공공데이터 익스플로러로 진화"): 단순 위젯 대시보드 → 사이드바 네비 + 위젯별 상세 페이지로 확장. v3에서 추가된 결정 사항 정리.

### 14.1 라우트 구조 (App Router)

```
src/app/(dashboard)/
├── layout.tsx           # Sidebar + 상단 header + main
├── page.tsx             # / 대시보드 (RSC, DEMO_INSTANCES 하드코딩, DashboardStats + 위젯 카드 그리드)
├── settings/page.tsx    # /settings — localStorage 핀 토글
└── w/<id>/page.tsx      # /w/weather, /w/pharmacy, /w/food-recall, /w/apartment
```

### 14.2 URL = 진실의 원천

- 모든 상세 페이지는 **RSC**. 검색 조건은 `searchParams`로.
- 클라이언트 입력(셀렉터/chip)은 `<Link href={...}>` 또는 `router.push` → URL 갱신 → 새 server fetch.
- 클라이언트 상태 X (즐겨찾기/핀 같은 사용자 메타데이터만 localStorage).
- 효과: 새로고침 보존, 공유 가능 (북마크 가능), Service Worker 캐시 친화적.

### 14.3 위젯별 상세 페이지 패턴

각 페이지 동일 골격:
1. **PageFrame** (eyebrow + title + description + actions slot) — [DESIGN.md §14](DESIGN.md) 참조
2. **Filter 카드** — 검색·필터 chip 그룹 + form
3. **Result 카드** — 결과 리스트/차트 + empty state
4. **(선택) 보조 카드** — 통계, 차트, etc.

검색 파라미터 정리:
- `/w/weather?region=서울`
- `/w/pharmacy?sido=대전광역시&sigungu=유성구&radius=5&kind=all&openNow=1`
- `/w/food-recall?q=우유,계란&window=168&grade=1`
- `/w/apartment?sido=서울특별시&sigungu=강남구&lawdCd=11680&dealYm=202605&sort=amount-desc`

### 14.4 즐겨찾기 (Bookmark) 시스템

저장 형식 — `localStorage["dataweave.bookmarks"]`:
```ts
type Bookmark = {
  id: string;          // {widgetId}-{timestamp}
  label: string;       // 자동 생성 (예: "아파트 · 서울특별시 강남구 · 2026년 5월")
  href: string;        // 현재 페이지 URL (pathname + searchParams)
  widgetId: string;    // 'weather' | 'pharmacy' | 'food-recall' | 'apartment'
  createdAt: number;
};
```

- 상세 페이지 헤더 `<BookmarkButton>` 클릭 → 현재 URL이 localStorage에 추가/제거.
- 사이드바 "즐겨찾기" 섹션 (대시보드 ↔ 공공데이터 사이) — 저장된 항목을 별표 + 라벨로 표시, 클릭 시 URL 복귀.
- 동기화: 같은 탭은 custom event(`dataweave-bookmarks-changed`), 다른 탭은 `storage` event.

### 14.5 위젯별 강화 (v3)

| 위젯 | 강화 |
|------|------|
| 날씨 | 시간대별 24h 카드 strip + 주간 8일 예보 (단기 3 + 중기 5, KMA 중기예보 별도 활용신청 필요) |
| SOS | 시·도→시·군·구 cascade select (235개 매핑) + "전체" 옵션 + 종류 필터 + **지금 영업중 토글** (KST 기준 운영시간 파싱) |
| 식품 리콜 | 키워드 chip + 기간 chip + **등급 필터** (1=rose / 2=amber / 3=zinc 톤) |
| 아파트 | 시·도→시·군·구 cascade + 월 stepper + **정렬 chip** (최신/가격↓↑/면적/평당가) + **6개월 평균가 추이 SVG 차트** |

### 14.6 새 위젯: 아파트 실거래가

- **데이터**: 국토교통부 RTMS 매매 실거래가 (15126469)
- **법정동 코드 매핑**: `src/widgets/apartment/lawd-codes.ts` — 229개 시·군·구 5자리 코드 (군위군 → 대구 27720 반영)
- **응답 포맷**: XML only → `fast-xml-parser`로 파싱
- **상세 페이지**: 시·도/시·군·구 cascade + 월 stepper + 정렬 chip + 추이 차트 + 거래 내역 리스트

### 14.7 디자인 토큰 진화 (Aurora → Solid)

Phase 1엔 Aurora gradient + 반투명 surface, Phase 1.5에서 **솔리드 surface로 교체** ([DESIGN.md §14](DESIGN.md) 참조). 사용자 피드백: "사이드바와 메인 구분 안 됨" → opaque chrome (zinc-900) + 명확한 border (zinc-800) 도입. Aurora bg는 `src/components/aurora-bg.tsx`에 남아있으나 root layout에서 제거됨.

---

### 14.8 Phase A — 아파트 단지 상세 페이지 (v3.1)

> 거래 행에서 아파트명을 클릭하면 그 단지의 종합 정보로 진입. 사용자 요청: "상세 정보 페이지를 만들어서 뭔가 아파트 정보나 아니면 지도 까지 있으면 좋을거같은데."

**라우트**: `/w/apartment/building?sido=&sigungu=&lawdCd=&apt=<aptName>&dong=<법정동>`

- 같은 시·군·구 내에 동일 단지명이 다른 법정동에 존재할 수 있어 `(aptName, dong)` 페어를 단지 식별자로 사용. RTMS는 고유 building_id 미제공.
- `[id]` 동적 세그먼트 대신 query string — URL=진실 원칙 유지 + 즐겨찾기/공유 가능.

**데이터**: `fetchBuilding(cfg, months=6)` — 시·군·구 RTMS API를 최근 6개월 분 병렬 호출 → `aptName + dong` 일치만 추려 시간 역순 정렬.
- 6 API call (월별). 키 없으면 mock 폴백.
- 좌표가 없어 카카오맵 좌표 임베드 X. 도로명/지번 검색 외부 링크(`https://map.kakao.com/?q=...`)로 폴백.

**페이지 구성**:
1. 단지 헤더 (아파트명 h1, 법정동·도로명·건축년도, 거래 N건, 집계 범위)
2. 통계 4-up (평균가 / 최저 / 최고 / 평당 평균 + 최근 거래일)
3. **평형별 거래** 카드 — 공급평 round (33평형/26평형 등) 그룹별 평균/최저/최고 + 면적 범위
4. 거래 내역 (최신순)
5. 카카오맵 외부 링크 버튼 (도로명 우선, 폴백: `region + dong + aptName + jibun`)

**진입점**: `ApartmentTradesList` 거래 행의 아파트명을 `<Link>`로. 외부 링크 아이콘으로 affordance. 클릭 시 `e.stopPropagation()` → 행 확장과 별개 동작.
- 행 자체는 `<button>` → `<div role="button" tabIndex={0}>`로 전환 (a/button nesting 회피, 키보드 접근성 onKeyDown 처리).
- 확장 패널에도 "단지 종합 정보 보기" emerald 버튼 중복 배치 (확장 후에도 빠른 진입).

**즐겨찾기 호환**: 단지 페이지 헤더에 `BookmarkButton` 동일하게 배치. 라벨 예: `단지 · 삼성푸른아파트 (대전 유성구 봉명동)`.

**향후 (TODO)**:
- 단지별 시간순 가격 추이 차트 (현재는 거래 리스트만)
- 좌표 매핑(법정동 → 위경도) 확보 시 카카오맵 임베드 인라인 — 현재 외부 링크
- 단지 정보 캐싱 (RTMS 6회 호출 비용 절감)

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | clean | 4 proposed, 3 accepted, 1 deferred (자연어 위젯) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clean | Phase 1 축소 결정 (4→3 위젯, 알림 인프라 deferred). 인터페이스 lock-in (1A 채택). config_version 자동 적용 (OV #5). |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clean | score 7.5/10 → 9.5/10. 7-pass 압축. 2 decisions made (로고 wordmark, PWA prompt 트리거). 자동 fix 6개 (카드 IA, 인터랙션 상태, User Journey, Slop 차별화 4가지, 위젯-토큰 매핑, 모바일 변환). DESIGN.md §12에 모두 반영. |
| Outside Voice | Claude subagent (codex 미설치) | Independent 2nd opinion | 1 | issues_found | 8 issue 발견. Critical 3개 (Vercel Hobby cron, schema drift chicken-egg, iOS Web Push) → Phase 1 스코프 축소로 모두 무력화. 자동 적용 5개. |

**CROSS-MODEL TENSION (모두 Outside Voice 우세, 반영 완료):**
- Cron tier: Eng `Pattern A 단일 cron` ↔ OV `Hobby 1/day 한도` → **Phase 1 cron 자체 제거**로 무력화
- Schema drift admin: Eng `Web Push self-notify` ↔ OV `chicken-egg` → **Phase 1엔 Vercel logs만**, Phase 2에 본격 admin alert

**UNRESOLVED:** 0
**VERDICT:** **CEO + ENG + DESIGN CLEARED — ready to implement.** 모든 review 통과, PLAN/DESIGN/TODOS 단일 진실 원천 일관성 OK.
