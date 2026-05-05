# DataWeave — Phase 1 Implementation Plan (v2)

> 한국 공공데이터 **조회형 위젯 대시보드**. Phase 1은 의도적으로 단순. 알림 인프라 zero, 위젯 3개, 무료 호스팅.
> Phase 2에서 Watcher Platform (알림형 위젯 + cron 인프라)를 활성화. 인터페이스는 Phase 2 호환을 미리 박아둠.
>
> 본 문서는 `/plan-ceo-review` (SCOPE EXPANSION) + `/plan-eng-review` (Phase 1 축소 결정) 통과 결과물.
> **다음 구현 세션의 단일 진실 원천 (SSOT).**

---

## 변경 이력

| 날짜 | 버전 | 변경 | 출처 |
|------|------|------|------|
| 2026-05-04 | v1 | 최초 작성 — 위젯 4개 + Web Push + Telegram 듀얼 알림 | `/plan-ceo-review` SCOPE EXPANSION |
| 2026-05-04 | v2 | **Phase 1 조회형 3개로 축소**. 캠핑장 + 알림 인프라 → Phase 2. | `/plan-eng-review` + Outside Voice (#1 Vercel Hobby cron 1/day 한도) + 사용자 결정 (조회만, 무료) |

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
- **Design system:** [DESIGN.md](DESIGN.md) — Emerald + Cyan, Aurora bg, JetBrains Mono 데이터, Cmd+K

---

## 3. Phase 1 위젯 3개 (모두 조회형)

| ID | 데이터 소스 | 캐시 (revalidate) | 핵심 동작 |
|----|------------|------------------|----------|
| `weather` | 기상청 단기예보 + 에어코리아 | 600s (10분) | 온도/강수확률/미세먼지 + 시간대별 mini graph |
| `pharmacy` | 응급의료 OpenAPI (e-gen.or.kr) | 300s (5분) | 사용자 위치 5km 내 야간/공휴일 운영 병원·약국, 전화 버튼 |
| `food-recall` | 식약처 회수·판매중지 OpenAPI | 21600s (6시간) | 최근 24시간 신규 리콜 + 사용자 알레르기 키워드 필터 |

**Phase 1 위젯은 모두 사용자가 능동 조회.** 새로고침 버튼으로 강제 fetch 가능.

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

## 9. 구현 순서 (Step 0~6)

### Step 0 — 프로젝트 부트스트랩
1. `npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" --use-npm`
2. shadcn/ui init: `npx shadcn@latest init` (Slate base, dark default)
3. 컴포넌트 추가: `button card dialog form input select toast skeleton sheet command`
4. 추가 deps: `zod lucide-react cmdk @supabase/supabase-js @supabase/ssr`
5. dev deps: `vitest @vitejs/plugin-react msw playwright`
6. **확인 체크포인트** (사용자)

### Step 1 — 메인 레이아웃 + 디자인 시스템
1. DESIGN.md 토큰을 `tailwind.config.ts`에 반영
2. `<AuroraBg>` 배경 컴포넌트
3. 헤더 (로고 + 설정 + 위젯 추가 + Cmd+K)
4. 풀폭 반응형 그리드 (xl:3, lg:2, md:1)
5. `<CommandPalette>` (cmdk)
6. **확인 체크포인트**

### Step 2 — BaseWidget + 격리 + Mock + Registry
1. `BaseWidget` + Header/Body/Skeleton/Error/Refresh/HealthDot/Diff
2. `<ErrorBoundary>` per-widget 격리
3. `_fetch-wrapper.ts` (zod strict + retry + abort + 7s timeout)
4. `_registry.ts` 빈 등록 시스템
5. `_types.ts` Widget 인터페이스 + `WidgetConfig` (v: 1)
6. Supabase 마이그레이션 0001 적용
7. **확인 체크포인트**

### Step 3 — 위젯 1: 날씨 (mock → 실 API)
1. `widgets/weather/` 5개 파일 (index/fetch/schema/Render/mock + ConfigForm)
2. mock 데이터로 카드 시각 완성
3. 실제 KMA + 에어코리아 API 연동
4. zod schema (drift 감지)
5. **확인 체크포인트**

### Step 4 — 위젯 2: SOS 병원/약국 (위치 기반)
1. 위치 권한 hook (`navigator.geolocation`)
2. 응급의료 OpenAPI 연동 + 거리 계산
3. 카드 + 전화 버튼 + Naver/Kakao Map 링크
4. **확인 체크포인트**

### Step 5 — 위젯 3: 위해식품 리콜 (키워드 필터)
1. 식약처 OpenAPI 연동
2. 알레르기 키워드 client-side 필터
3. 최근 24시간 vs 전체 토글
4. **확인 체크포인트**

### Step 6 — PWA + 배포
1. manifest.ts + 아이콘 + install prompt
2. Service Worker (정적 캐시만)
3. Vercel 배포 + env 등록
4. Supabase 프로덕션 마이그레이션
5. 첫 5분 smoke test

**총 Step 6단계, CC ~4시간.**

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

## 13. 완료 정의 (Phase 1 끝났다는 신호)

- [ ] 3개 위젯 모두 실 API 연동, mock fallback 동작
- [ ] zod strict 파싱이 모든 위젯 fetch에 적용
- [ ] BaseWidget Skeleton/Error/Refresh/HealthDot/Diff 모두 동작
- [ ] D1 First Run Magic — 위젯 추가 시 즉시 데이터 표시
- [ ] D2 Diff 색표시 — 새로고침 시 변화 강조
- [ ] D3 위젯 카탈로그 페이지
- [ ] 위젯 인스턴스 추가/삭제/config 편집 (UI)
- [ ] PWA install prompt + 정적 offline cache
- [ ] Vercel 배포 + 사용자가 자기 폰·PC에서 정상 사용 7일
- [ ] tests: Vitest unit + integration 80%+, 모든 위젯의 schema drift 테스트 포함

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
