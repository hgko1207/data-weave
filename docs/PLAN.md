# DataWeave — Phase 1 Implementation Plan

> **한국 공공데이터 플러그인 위젯 플랫폼.** 조회형/알림형 위젯이 1급 시민. 새 위젯 추가 = 폴더 1개 + 레지스트리 한 줄.
>
> 본 문서는 `/plan-ceo-review` (SCOPE EXPANSION 모드) 결과물이며, 다음 구현 세션의 단일 진실 원천(SSOT)입니다.

---

## 1. 제품 차터 (Charter)

| 항목 | 결정 |
|------|------|
| **제품 본질** | 한국 공공데이터 플러그인 위젯 플랫폼 (조회형 + 알림형) |
| **사용자 (Phase 1)** | 본인 1명 (싱글 유저), 데이터 모델은 멀티 유저 호환 |
| **Review 모드** | SCOPE EXPANSION (대성당 모드) — 야심찬 비전, 디테일 풍부 |
| **개발 기간 가이드** | CC 기준 ~10시간, 인간 기준 ~3주 사이드 프로젝트 |

### 기술 스택 (확정)

- **Framework:** Next.js 15+ (App Router), React Server Components
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS, shadcn/ui (cherry-pick), Lucide React
- **Backend:** Supabase (Postgres + Auth-ready), Vercel Cron
- **Push:** Web Push (VAPID) + Telegram Bot API (듀얼 채널)
- **PWA:** Service Worker, manifest, install prompt
- **Validation:** zod (strict, schema drift 자동 감지)
- **Testing:** Vitest + MSW (unit + integration), Playwright (E2E, optional)

---

## 2. Phase 1 위젯 4개

### 위젯 인터페이스 (확정)

```typescript
// src/widgets/_types.ts
export interface Widget<TData = unknown> {
  readonly id: string;                // 'weather' | 'pharmacy' | 'camping' | 'food-recall'
  readonly title: string;
  readonly icon: LucideIcon;
  readonly category: 'view' | 'alert';

  fetch(ctx: WidgetContext): Promise<TData>;
  Render: React.FC<{ data: TData; status: WidgetStatus; config: WidgetConfig }>;

  ConfigForm?: React.FC<{ value: WidgetConfig; onChange: (v: WidgetConfig) => void }>;

  alerting?: {
    pollIntervalSec: number;
    detectChange(prev: TData | null, next: TData): ChangeEvent[] | null;
    formatNotification(events: ChangeEvent[]): NotifyPayload;
  };
}
```

### 위젯 카탈로그

| ID | 카테고리 | 데이터 소스 | 폴링 | 핵심 동작 |
|----|---------|------------|------|----------|
| `weather` | 조회형 | 기상청 단기예보 + 에어코리아 | (없음, revalidate 600s) | 온도/강수확률/미세먼지 + 시간대별 mini graph |
| `pharmacy` | 조회형 | 응급의료 OpenAPI (e-gen.or.kr) | (없음, revalidate 300s) | 사용자 위치 5km 내 야간/공휴일 운영 병원·약국, 전화 버튼 |
| `camping` | 알림형 | 한국관광공사 TourAPI 4.0 (gocamping) | 30분 | 사용자 지정 캠핑장의 새 빈자리 감지 → Push + Telegram |
| `food-recall` | 알림형 | 식약처 회수·판매중지 OpenAPI | 6시간 | 신규 리콜 항목 감지 (사용자 알레르기 키워드 필터) → Push + Telegram |

### 첫 폴링 정책 (GAP 5 해결)
- 알림형 위젯 첫 폴링: **baseline snapshot 저장만, 알림 0건**
- 두 번째 폴링부터 진짜 변화 감지 → 알림

### 다중 인스턴스 (GAP 6 해결)
- 같은 type 여러 개 허용. `config.nickname` 필드로 구분 (예: "고금 캠핑", "제주 캠핑")
- 카드 제목에 nickname 표시.

---

## 3. 시스템 아키텍처

```
                          USER (browser, PWA)
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
        ┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
        │   Server    │      │   Client    │      │  Service    │
        │  Component  │      │  Component  │      │   Worker    │
        │ (위젯.fetch)│      │(위젯.Render)│      │ (Web Push)  │
        └──────┬──────┘      └──────▲──────┘      └──────▲──────┘
               │                    │                    │
               ▼                    │                    │
   ┌────────────────────┐           │                    │
   │  Public Data APIs  │           │                    │
   │  (KMA/TourAPI/     │           │                    │
   │   E-Gen/MFDS)      │           │                    │
   └────────────────────┘           │                    │
                                    │                    │
                          ┌─────────┴────────────────────┴─────────┐
                          │           Supabase                      │
                          │  widgets · snapshots · notifications    │
                          │  · push_subs                            │
                          └─────────────▲───────────────────────────┘
                                        │
                          ┌─────────────┴───────────────┐
                          │   Vercel Cron Worker        │
                          │   (CRON_SECRET 검증)         │
                          │   Promise.allSettled        │
                          │   per-widget try/catch      │
                          └─────────────────────────────┘
```

### 데이터 플로우 — 알림형 위젯 (Cron 워커)

```
Cron 트리거 (30분/6시간)
  → SELECT widgets WHERE category='alert' AND active=true
  → Promise.allSettled([                       ◀ 위젯 격리
      withTryCatch(widget1, async () => {
        prev   = SELECT latest snapshot
        next   = await widget.fetch()           ◀ zod strict
        events = widget.detectChange(prev, next) ◀ normalize+sort
        if (events && prev !== null) {           ◀ baseline 보호
          INSERT snapshot
          INSERT notification
          await dispatchPush(events)
          await dispatchTelegram(events)
        } else if (events && prev === null) {
          INSERT snapshot                        ◀ baseline만
        }
      }),
      ...
    ])
  → log per-widget timing + outcome
```

---

## 4. 폴더 구조

```
data-weave/
├── PLAN.md
├── DESIGN.md
├── TODOS.md
├── README.md
├── .env.example
│
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx                   # 메인 대시보드 (RSC)
│   │   │   ├── layout.tsx                 # 헤더 + 풀폭 그리드
│   │   │   ├── catalog/page.tsx           # 위젯 카탈로그 (D3)
│   │   │   └── settings/page.tsx          # 알림 채널·health 배지
│   │   ├── api/
│   │   │   ├── cron/poll/route.ts         # Vercel Cron entry
│   │   │   ├── push/subscribe/route.ts
│   │   │   ├── push/unsubscribe/route.ts
│   │   │   └── telegram/setup/route.ts
│   │   ├── manifest.ts                    # PWA
│   │   └── icon.png
│   │
│   ├── widgets/                           # ★ 플러그인 root ★
│   │   ├── _registry.ts                   # 모든 위젯 등록 한 곳
│   │   ├── _types.ts                      # Widget interface
│   │   ├── _runner.ts                     # 폴링 코어 (try/catch 격리)
│   │   ├── _fetch-wrapper.ts              # zod + retry + abort 공통
│   │   ├── README.md                      # "5분 안에 새 위젯 만들기"
│   │   ├── weather/
│   │   │   ├── index.ts                   # Widget 객체 export
│   │   │   ├── fetch.ts                   # 기상청 API
│   │   │   ├── schema.ts                  # zod schema
│   │   │   ├── Render.tsx
│   │   │   ├── ConfigForm.tsx
│   │   │   └── mock.ts                    # Phase 1 mock fallback
│   │   ├── pharmacy/
│   │   ├── camping/
│   │   │   ├── index.ts
│   │   │   ├── fetch.ts
│   │   │   ├── schema.ts
│   │   │   ├── detectChange.ts            # 정렬+normalize 후 diff
│   │   │   ├── Render.tsx
│   │   │   ├── ConfigForm.tsx
│   │   │   └── notify.ts                  # Push/Telegram 포맷
│   │   └── food-recall/
│   │
│   ├── components/
│   │   ├── widget/
│   │   │   ├── BaseWidget.tsx             # 공통 레이아웃 (사용자 명시 요구)
│   │   │   ├── WidgetHeader.tsx
│   │   │   ├── WidgetBody.tsx
│   │   │   ├── WidgetSkeleton.tsx
│   │   │   ├── WidgetError.tsx
│   │   │   ├── WidgetDiff.tsx             # D2: diff 색표시
│   │   │   ├── WidgetRefresh.tsx
│   │   │   └── WidgetHealthDot.tsx        # Live status dot
│   │   ├── command-palette.tsx            # Cmd+K (cmdk lib)
│   │   ├── error-boundary.tsx             # 위젯 격리 (client)
│   │   ├── aurora-bg.tsx                  # Slop-회피 배경
│   │   └── ui/                            # shadcn 생성물
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                  # service role
│   │   │   ├── browser.ts                 # anon
│   │   │   └── types.ts                   # supabase-gen
│   │   ├── push/
│   │   │   ├── vapid.ts
│   │   │   └── dispatcher.ts
│   │   ├── telegram/
│   │   │   ├── bot.ts
│   │   │   └── dispatcher.ts
│   │   ├── notifications/
│   │   │   └── health.ts                  # 7일 실패 추적
│   │   └── logger.ts
│   │
│   ├── hooks/
│   │   ├── useWidgetData.ts               # client refresh + abort
│   │   ├── usePushSubscription.ts
│   │   └── useNotificationHealth.ts
│   │
│   └── types/
│       └── widget.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 0001_widgets.sql
│   │   ├── 0002_snapshots.sql
│   │   ├── 0003_notifications.sql
│   │   └── 0004_push_subs.sql
│   └── seed.sql
│
├── public/
│   ├── service-worker.js                  # Web Push
│   ├── icons/                             # PWA icons
│   └── ...
│
└── tests/
    ├── widgets/
    │   ├── weather.test.ts
    │   ├── camping.test.ts                # detectChange edge cases
    │   ├── pharmacy.test.ts
    │   └── food-recall.test.ts
    ├── widget-runner.test.ts              # 격리 + 격리 시나리오
    └── e2e/
        └── add-widget.spec.ts             # Playwright optional
```

---

## 5. Supabase 스키마

```sql
-- 0001_widgets
create table widgets (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  user_id uuid,                           -- Phase 1 nullable, Phase 2 RLS
  config jsonb not null default '{}',    -- nickname, location, keywords, etc.
  active boolean not null default true,
  created_at timestamptz default now()
);
create index on widgets (user_id, active);
create index on widgets (type) where active = true;

-- 0002_snapshots
create table snapshots (
  id bigserial primary key,
  widget_id uuid not null references widgets(id) on delete cascade,
  data jsonb not null,
  fetched_at timestamptz default now()
);
create index on snapshots (widget_id, fetched_at desc);
-- TTL job: delete snapshots older than 30 days

-- 0003_notifications
create table notifications (
  id bigserial primary key,
  widget_id uuid not null references widgets(id) on delete cascade,
  events jsonb not null,
  channels text[] not null,
  delivered_at timestamptz default now(),
  delivery_status jsonb                   -- {push: 'ok', telegram: 'failed: 401'}
);
create index on notifications (widget_id, delivered_at desc);

-- 0004_push_subs
create table push_subs (
  id bigserial primary key,
  user_id uuid,                           -- Phase 1 nullable
  channel text not null,                  -- 'web_push' | 'telegram'
  endpoint jsonb not null,
  active boolean default true,
  last_failure_at timestamptz,            -- health 추적
  failure_count int default 0,
  created_at timestamptz default now()
);
```

---

## 6. 환경변수 (.env.example)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=               # cron worker (server only)

# 공공 API (data.go.kr 등록 필요)
KMA_API_KEY=                             # 기상청 단기예보
TOUR_API_KEY=                            # 한국관광공사 (TourAPI 4.0)
EMERGENCY_API_KEY=                       # 응급의료 OpenAPI (e-gen)
MFDS_API_KEY=                            # 식약처 회수·리콜
AIRKOREA_API_KEY=                        # 미세먼지 (날씨 위젯)

# Web Push (VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:khkkhk1207@gmail.com

# Telegram
TELEGRAM_BOT_TOKEN=                      # @BotFather에서 생성
TELEGRAM_DEFAULT_CHAT_ID=                # 본인 chat_id (Phase 1)

# Cron 보안
CRON_SECRET=                             # Vercel Cron Authorization 헤더

# Admin alert (schema drift 시)
ADMIN_EMAIL=khkkhk1207@gmail.com
RESEND_API_KEY=                          # 또는 Supabase Auth email
```

---

## 7. Error & Rescue Map (핵심 요약)

| 코드패스 | 실패 모드 | Rescue | 사용자 표시 |
|---------|----------|--------|------------|
| 위젯 fetch (4개) | 5xx/timeout/schema drift | strict zod, retry, mock fallback | 토스트 + 위젯 카드 에러 상태 |
| Cron 위젯 격리 | 한 위젯 throw | per-widget try/catch | 다른 위젯 정상 폴링 |
| Cron 워커 timeout | 60s 초과 | Promise.allSettled, 다음 회차 보완 | (서버 로그) |
| Web Push 실패 | 410 Gone, VAPID 만료 | sub auto-delete, 다음 접속 토스트 | "푸시 다시 설정" 배지 |
| Telegram 실패 | 401, 봇 차단 | sub inactive | "봇 다시 시작" 배지 |
| Schema drift | API 응답 포맷 변경 | strict zod 차단 + admin email | "위젯 점검 중" |
| First poll flooding | 첫 폴링에 N개 신규 | **baseline만 저장, 알림 0** | (자동) |
| Diff false positive | 같은 데이터 다른 순서 | normalize + sort 후 비교 | (자동) |

**Critical Gaps: 0** — 모든 실패 모드 커버.

---

## 8. 구현 순서 (다음 세션에서 시작)

사용자 원본 프롬프트의 Step 1~4를 본 차터에 맞게 재구성:

### Step 0 — 프로젝트 부트스트랩
1. `pnpm create next-app data-weave --ts --tailwind --app --src-dir --eslint`
2. shadcn/ui init: `pnpm dlx shadcn@latest init` (Slate base, dark default)
3. shadcn 컴포넌트: `button card dialog form input select toast skeleton sheet command`
4. 추가 deps: `zod`, `lucide-react`, `cmdk`, `web-push`, `node-telegram-bot-api`, `@supabase/supabase-js`, `@supabase/ssr`
5. dev deps: `vitest`, `@vitejs/plugin-react`, `msw`, `playwright`

### Step 1 — 메인 레이아웃 + 디자인 시스템
1. `DESIGN.md` 토큰을 `tailwind.config.ts`에 반영
2. `<AuroraBg>` 배경 컴포넌트
3. 헤더 (로고 + 알림 belly + 설정 + 위젯 추가 + Cmd+K)
4. 풀폭 반응형 그리드 (xl:3, lg:2, md:1)
5. `<CommandPalette>` (cmdk)
6. **확인 체크포인트** — 사용자 검토

### Step 2 — BaseWidget + 격리 + Mock
1. `BaseWidget` + Header/Body/Skeleton/Error/Refresh/HealthDot
2. `<ErrorBoundary>` per-widget 격리
3. `_fetch-wrapper.ts` (zod + retry + abort)
4. `_registry.ts` 빈 등록 시스템
5. **확인 체크포인트**

### Step 3 — 위젯 1: 날씨 (조회형, mock 시작)
1. `widgets/weather/` 5개 파일 (index/fetch/schema/Render/mock)
2. mock 데이터로 카드 시각 완성
3. 실제 KMA API 연동
4. **확인 체크포인트**

### Step 4 — 위젯 2: SOS 병원/약국 (조회형, 위치 기반)
1. 위치 권한 hook
2. 응급의료 OpenAPI 연동
3. 카드 + 전화 버튼 + 거리 표시
4. **확인 체크포인트**

### Step 5 — 알림 인프라 (Push + Telegram + Cron)
1. Supabase 마이그레이션 4개 적용
2. VAPID 키 생성, service-worker.js, push subscribe API
3. Telegram 봇 등록, dispatcher
4. `/api/cron/poll` 엔드포인트 + CRON_SECRET 검증
5. `_runner.ts` (Promise.allSettled + per-widget try/catch + baseline 보호)
6. **확인 체크포인트**

### Step 6 — 위젯 3: 캠핑장 빈자리 (알림형 1호)
1. TourAPI 연동 + 캠핑장 ID 입력 ConfigForm
2. detectChange (normalize + sort)
3. notify formatter (Push + Telegram 포맷)
4. 실시간 첫 폴링 + baseline 저장 검증
5. **확인 체크포인트**

### Step 7 — 위젯 4: 위해식품 리콜 (알림형 2호)
1. 식약처 OpenAPI 연동
2. 알레르기 키워드 필터
3. 6시간 폴링
4. **확인 체크포인트**

### Step 8 — UX 디테일 (D1+D2+D3+D5)
1. First Run Magic (위젯 추가 즉시 1회 폴링)
2. Diff 색 표시 (`<WidgetDiff>`)
3. 위젯 카탈로그 페이지
4. 알림 라이브 프리뷰

### Step 9 — Health + 알림 채널 모니터링
1. `<WidgetHealthDot>` 7일 실패 추적
2. 다음 접속 시 토스트 + 설정 페이지 배지
3. settings/page.tsx (구독 상태, health, 재구독 버튼)

### Step 10 — 배포
1. Supabase 프로덕션 마이그레이션
2. Vercel 배포 + env 등록
3. PWA manifest + 아이콘 + install prompt
4. 첫 5분 smoke test (Section 8.3)

---

## 9. NOT in scope (Phase 1)

| 항목 | 이유 | 어디로? |
|------|------|--------|
| 자연어 위젯 생성 (LLM) | Phase 1 LLM 비용·환각 리스크 회피 | TODOS.md #1 |
| 다중 사용자 + Auth + RLS | 싱글 유저로 시작, 데이터 모델만 호환 | TODOS.md #2 |
| 워치 갤러리·공유 | 다중 사용자 선행 필요 | TODOS.md #3 |
| 체육시설 취소표 | 크롤링 + 법적 회색지대 + 별도 워커 | TODOS.md #4 |
| 스마트홈 트리거 (Webhook out) | 사용자 11번 아이디어, Phase 2 자연 흡수 | TODOS.md #5 |
| 부동산 mashup | 호갱노노 등 강한 경쟁자 | (Skip 결정) |
| CCTV 관제 | 스트림 호스팅 비용 + iframe 제약 | (Skip 결정) |
| 주차장 빈자리 | 데이터 일관성 부족 | (Skip 결정) |
| 휴게소 플래너 | T맵 강력한 경쟁자 | (Skip 결정) |
| 부동산 mashup | 차별화 어려움 | (Skip) |
| 자연어 검색 | LLM 의존, Phase 2 | (Phase 2) |

---

## 10. Dream State Delta — 12개월 후

```
   현재 (오늘)               Phase 1 완료              12개월 이상적
   ─────────────             ──────────────            ─────────────────
   빈 디렉토리 +              위젯 4개 + 듀얼 알림 +     위젯 12~15개 +
   11개 산만 아이디어         플러그인 인터페이스 +       자연어 위젯 생성 +
                             다크 SaaS UI               PWA 풀 푸시 +
                                                       워치 갤러리 +
                                                       다중 사용자
   
                            "본인 + 가족이                "공공데이터 알림 OS"
                            매일 쓰는 사이드 프로젝트"
```

---

## 11. Diagrams (이 문서에 모두 포함)

- ✅ 시스템 아키텍처 (Section 3)
- ✅ Cron 데이터 플로우 (Section 3)
- ✅ 폴더 구조 (Section 4)
- ✅ 위젯 인터페이스 (Section 2)
- ✅ Error/Rescue 표 (Section 7)

---

## 12. 변경 이력

| 날짜 | 변경 | 출처 |
|------|------|------|
| 2026-05-04 | 최초 작성 | `/plan-ceo-review` SCOPE EXPANSION 모드 |
