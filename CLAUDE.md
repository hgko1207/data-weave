# DataWeave — Claude 작업 가이드

한국 공공데이터 조회형 위젯 대시보드. **Phase 1 (위젯 3개) 완성 → Phase 1.5 (사이드바 네비 + 위젯별 상세 페이지)** 진행 중. 로컬-only 운영, Vercel 배포는 [docs/TODOS.md](docs/TODOS.md) TODO 10으로 deferred.

## SSOT 문서

- [docs/PLAN.md](docs/PLAN.md) — Phase 1 차터·위젯 인터페이스·구현 단계 (Step 0~6)
- [docs/DESIGN.md](docs/DESIGN.md) — 컬러/타이포/스페이싱 토큰, 디자인 원칙
- [docs/TODOS.md](docs/TODOS.md) — Phase 2+ 의식적으로 deferred한 항목

새 기능 들어오면 위 셋 중 어느 쪽에 속하는지 먼저 판단. 새 결정은 PLAN/DESIGN/TODOS의 적절한 곳에 변경 이력과 함께 기록.

## 기술 스택

- Next.js 16 (App Router, RSC) + Turbopack
- TypeScript strict
- Tailwind v4 (`@theme inline` 토큰, `globals.css` 단일 import)
- shadcn/ui 컴포넌트 (slate base, 일부만 사용)
- zod (strict on normalized widget data, passthrough on raw API responses)
- Supabase (Phase 1은 데모 데이터 하드코딩, 마이그레이션만 `supabase/migrations/0001_widgets.sql` 준비)
- 폰트: Inter (sans) + JetBrains Mono (data)

## 폴더 구조

```
src/
├── app/
│   ├── layout.tsx                 # html/body, fonts, viewport (dark forced)
│   ├── manifest.ts                # PWA manifest
│   ├── globals.css                # Tailwind v4 @theme + 다크 토큰
│   └── (dashboard)/               # 모든 인증 후 페이지 (라우트 그룹)
│       ├── layout.tsx             # Sidebar + 상단 header + 본문
│       ├── page.tsx               # / 대시보드 (RSC, demo instances)
│       ├── settings/page.tsx      # 위젯 핀 토글 (localStorage)
│       ├── w/<id>/page.tsx        # 위젯별 상세 (RSC, searchParams 기반)
│       └── w/apartment/building/  # 단지 상세 — 거래 행 → 아파트명 클릭 진입
│           └── page.tsx           # ?sido&sigungu&lawdCd&apt&dong → 6개월 거래 집계
│
├── components/
│   ├── sidebar/                   # Sidebar.tsx, SidebarContent.tsx
│   ├── widget/                    # BaseWidget, DashboardWidget,
│   │   ├── BaseWidget.tsx         #   WidgetHeader/Body/Skeleton/Error/
│   │   ├── DashboardWidget.tsx    #   Refresh/HealthDot/Diff
│   │   ├── WidgetPreview.tsx      # 상세 페이지에서 데모 위젯 RSC 렌더
│   │   ├── WidgetDetailStub.tsx   # UpcomingBanner + SidePanelStub
│   │   └── weather/               # weather 전용 상세 컴포넌트
│   │       ├── RegionPicker.tsx
│   │       ├── WeatherDetail.tsx
│   │       └── sky-icon.ts        # 날씨 텍스트 → Lucide 아이콘 매핑
│   ├── page-frame.tsx             # 페이지 공통 헤더 (eyebrow/title/desc/actions)
│   ├── dashboard-stats.tsx        # 상단 4-up stats strip
│   ├── command-palette.tsx        # ⌘K
│   ├── pwa-install-prompt.tsx     # DESIGN.md §12.8 트리거
│   ├── sw-register.tsx            # production 한정 register, dev에서 자동 unregister
│   └── error-boundary.tsx         # 위젯 격리
│
├── widgets/                       # ★ 위젯 플러그인 ★
│   ├── _types.ts                  # Widget 인터페이스 + WidgetConfig (v:1)
│   ├── _registry.ts               # 등록/조회/리스트
│   ├── _registry.bootstrap.ts     # 모든 위젯 등록 (idempotent)
│   ├── _fetch-wrapper.ts          # zod strict + 7s timeout + retry + abort
│   ├── _metadata.ts               # 클라이언트 안전한 위젯 메타 (사이드바·설정에서 사용)
│   ├── README.md                  # 5분 위젯 추가 가이드
│   ├── weather/                   # KMA + AirKorea + KMA 중기예보
│   ├── pharmacy/                  # 국립중앙의료원 응급의료 OpenAPI
│   └── food-recall/               # 식품안전나라 I0490 (data.go.kr와 별도 시스템)
│
├── hooks/
│   └── useGeolocation.ts
│
└── lib/
    ├── supabase/{server,browser}.ts
    ├── pinned-widgets.ts          # localStorage 'dataweave.pinned' 읽기/쓰기
    ├── page-titles.ts             # pathname → eyebrow + title
    └── logger.ts                  # JSON line
```

## 디자인 시스템 (요점)

상세는 [docs/DESIGN.md](docs/DESIGN.md). 코드에서 반복해서 쓰는 패턴 모음:

### Surface elevation (Supabase + shadcn 톤)

| Layer | 클래스 | 용도 |
|-------|--------|------|
| L0 page | `bg-zinc-950` | 메인 영역 배경 |
| L1 chrome | `bg-zinc-900` + `border-zinc-800/80` | 사이드바, 헤더 (불투명) |
| L2 card | `bg-zinc-900` + `border-zinc-800/80` | 위젯 카드, 컨테이너 |
| L3 inset | `bg-zinc-950/60` + `border-zinc-800` | 카드 안의 입력/칩 (시간대별 mini card 등) |

**원칙:** 반투명·backdrop-blur 남용 금지. 불투명 + 명확한 경계선이 다크 톤에서 더 깔끔.

### 버튼 시스템

| 종류 | 클래스 |
|------|--------|
| Primary (emerald) | `bg-emerald-500 text-zinc-950 hover:bg-emerald-400` |
| Ghost zinc | `border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800` |
| Active state | `bg-emerald-500/10 text-emerald-200` + 아이콘 `text-emerald-400` |
| Touch target | 최소 `h-9` (36px), 가능하면 `h-10` |

### 타이포그래피

| 토큰 | 용도 |
|------|------|
| `text-3xl font-semibold tracking-tight` | 페이지 h1 (PageFrame 자동) |
| `text-base font-semibold` | 카드 제목 |
| `text-base` | 본문 강조 |
| `text-sm` | 본문, 라벨 |
| `text-xs font-mono uppercase tracking-[0.14em]` | eyebrow / 섹션 라벨 (모노) |
| `font-mono tabular-nums` | 숫자/데이터 (°C, %, 거리 등) — 절대 본문 X |

**금지:**
- `text-[10px]` — 다크에서 안 보임. 캡션도 `text-xs` 하한.
- `text-zinc-600` 이하 본문 — `text-zinc-400` 또는 `text-zinc-500`만.
- 폰트 mono를 본문에 사용

### 컴포넌트 빌딩 블록

- **PageFrame** — 모든 페이지 헤더 (eyebrow + h1 + description + actions). 새 페이지 만들 때 무조건 이걸로 감싸기.
- **BaseWidget / DashboardWidget** — 위젯 카드. 새 위젯 만들 때 절대 직접 카드 스타일 작성 X.
- **getSkyVisual(skyText)** — 날씨 텍스트 → Lucide 아이콘 + 색상.
- **DashboardStats** — 4-up stats strip 패턴 (위젯 추가 시 stats도 늘릴 수 있음).

## 위젯 추가 절차

[src/widgets/README.md](src/widgets/README.md) 참고. 골자:

1. `src/widgets/<id>/` 폴더에 6개 파일 (`schema.ts` / `mock.ts` / `fetch.ts` / `Render.tsx` / `ConfigForm.tsx` / `index.ts`)
2. `_registry.bootstrap.ts`에 등록 한 줄 추가
3. `_metadata.ts`의 `WIDGET_META`에 메타 한 줄 추가 (사이드바·설정·Cmd+K 자동 반영)
4. (선택) `src/app/(dashboard)/w/<id>/page.tsx` 상세 페이지 — `PageFrame` + 위젯별 검색 패널 + `WidgetPreview`
5. **항상 mock 폴백 우선** — API 키 없거나 5xx면 mock으로 안전하게 떨어뜨림

## 라우트 + URL 동기화

- 상세 페이지는 RSC. 검색 조건은 `searchParams`로 (예: `?region=서울`).
- 페이지에서 `searchParams`를 받아 widget config로 변환 → server fetch → 컴포넌트에 전달.
- 클라이언트 입력(셀렉터)은 `<Link href={...}>` 로 URL 갱신 → 새 server fetch → 페이지 재렌더.
- 클라이언트 상태 X. URL이 진실의 원천.

## 환경 변수

[.env.example](.env.example) 참고. 핵심:

- `DATA_GO_KR_KEY` — data.go.kr 발급 키 1개 (KMA, AirKorea, 응급의료 모두 공유)
- `FOODSAFETY_API_KEY` — foodsafetykorea.go.kr 별도 시스템, 다른 계정으로 발급 필요
- 서비스별 변수 (`KMA_API_KEY` 등)는 `DATA_GO_KR_KEY`로 자동 폴백. `??` 대신 `||` 사용 (빈 문자열도 폴백 처리).

각 위젯은 키 없으면 mock으로 떨어뜨림. mock 데이터는 그 자체로 의미 있게 보이도록 (실제 카드 모양 + 사실적 값).

## API 활용신청 필요 서비스

| 서비스 | data.go.kr ID | 위젯 |
|--------|---------------|------|
| 기상청 단기예보 | 15084084 | weather (오늘~모레) |
| 한국환경공단 에어코리아 | 15073861 | weather (미세먼지) |
| 기상청 중기예보 | 15059468 | weather (4~7일) |
| 국립중앙의료원 응급의료기관 | 15000563 | pharmacy (응급실) |
| 국립중앙의료원 전국 약국 | 15000578 | pharmacy (약국) |
| 식품안전나라 I0490 | — (별도 시스템) | food-recall |

`food-recall`은 foodsafetykorea.go.kr에서 별도 가입 + 인증키 발급 필요 — data.go.kr 키 호환 X (HTML 에러 페이지 반환).

## 명령

```bash
npm run dev           # 개발 (Turbopack HMR, Service Worker 자동 비활성)
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 모드 (PWA SW 활성, 일상 사용 권장)
node scripts/generate-icons.mjs   # PWA 아이콘 재생성 (sharp)
```

## 운영 정책

- **TypeScript strict + zod strict** — schema drift를 명시적 에러로 표면화. 위젯별 `fetchWeather/Pharmacy/...`는 안에서 catch → mock 폴백 → 사용자에게 안 깨지게.
- **Server-first** — 위젯 데이터 fetch는 RSC에서. 클라이언트는 Render/ConfigForm/refresh 트리거만.
- **위젯 격리** — `WidgetErrorBoundary`로 위젯 단위 오류 캡슐화. 하나 깨져도 다른 위젯 영향 X.
- **다크 일관** — `<html class="dark">` 강제. 라이트 모드 지원 안 함.

## 사용자 협업 노트

- **디자인 일관성 중요** — 새 페이지/컴포넌트 만들 때 기존 패턴(PageFrame, ghost-zinc 버튼, surface 토큰, 타이포 스케일) 반드시 참고. 즉흥적 스타일 X.
- 단계별 체크포인트 선호 — 큰 작업은 여러 커밋으로 쪼개고 단계마다 사용자가 시각 확인할 수 있도록.
- 한국어 UI. 모든 사용자 가시 문자열 한국어. 코드/로그는 영어.
- 사이드바는 **항상 표시** (모바일 collapse·반응형 width 시도하다 사용자 피드백으로 폐기됨 — `w-64` 고정).
- 사용자는 본인 1명, 데스크톱 위주, Windows. 백그라운드 dev 서버는 `npm run start`로 일상 사용.

## 현재 상태 (Phase 1.5 완성)

완성:
- Step 0~6 (Phase 1)
- 사이드바 네비 + 설정 페이지 (localStorage 핀 토글)
- 위젯 3종 상세 페이지 — URL `searchParams` 기반 검색·필터 동기화
  - `/w/weather?region=` — 지역 chip 셀렉터 + 시간대별 24h + 주간 예보 8일 (단기 3 + 중기 5)
  - `/w/pharmacy?sido=&sigungu=&radius=&kind=` — 시·도/시·군·구 폼 + 반경·종류 chips + 카카오맵 링크
  - `/w/food-recall?q=&window=` — 키워드 폼(쉼표 구분) + 자주 쓰는 키워드 chip + 기간 chips

미진행 (Phase 2 이후 → [docs/TODOS.md](docs/TODOS.md)): 자연어 위젯 생성, 다중 사용자/Auth, 워치 갤러리, 알림 인프라 등.
