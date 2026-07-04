# DataWeave — Claude 작업 가이드

한국 공공데이터 조회형 위젯 대시보드. **Phase 1 + 1.5 완성** — 위젯 **10종**(weather / pharmacy / food-recall / disaster / price / apartment / rent / library / tour / lotto), 사이드바 네비, 위젯별 상세 페이지(URL `searchParams`), 즐겨찾기, geo 자동 기본값, 인앱 알림 배지, 모바일 드로어, 카카오맵 SDK 임베드까지. **Vercel(icn1 리전) 배포 완료 — live 운영 중.** Phase 2(알림 인프라)는 [docs/TODOS.md](docs/TODOS.md) TODO 8로 deferred.

## SSOT 문서

- [docs/PLAN.md](docs/PLAN.md) — 차터·위젯 인터페이스·공통 골격(사이드바·즐겨찾기·라우트 규약)
- [docs/widgets/](docs/widgets/) — **위젯별 화면 문서** (10종 모두 — 페이지 구조, 데이터 소스, 진화 이력, TODO를 위젯 단위로 분리). 위젯 단위 변경은 여기가 SSOT.
- [docs/plans/](docs/plans/) — **진행 트래킹용 로드맵.** `new-widgets.md`(신규 4+1종 — 완료), `welfare-widget.md`(11번째 위젯 — 미착수), `local-dashboard-map.md`(지도 뷰 — 미착수), `separate/law-clear.md`(별도 신규 프로젝트 구상).
- [docs/DESIGN.md](docs/DESIGN.md) — 컬러/타이포/스페이싱 토큰, 디자인 원칙
- [docs/TODOS.md](docs/TODOS.md) — Phase 2+ 의식적으로 deferred한 항목

새 기능이 들어오면:
- 위젯 화면별 변경 → `docs/widgets/<id>.md`에 진화 이력 한 줄 + 필요 시 섹션 추가
- 위젯 인터페이스·라우트 규약 등 공통 골격 변경 → `docs/PLAN.md` 변경 이력 + §14
- 디자인 토큰 변경 → `docs/DESIGN.md`
- 의식적으로 미루는 항목 → `docs/TODOS.md`

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
│   └── (dashboard)/               # 모든 페이지 (라우트 그룹)
│       ├── layout.tsx             # Sidebar + MobileSidebar + 헤더(h-14) + ContentBackdrop + 본문
│       ├── page.tsx               # / 대시보드 → DashboardHome (핀 런처 + 그룹별 둘러보기)
│       ├── settings/page.tsx      # 위젯 핀 토글 (localStorage)
│       ├── w/<id>/page.tsx        # 위젯별 상세 10종 (RSC, searchParams 기반)
│       ├── w/apartment/building/  # 매매 단지 상세 — 거래 행 → 아파트명 클릭 진입
│       │   └── page.tsx           # ?sido&sigungu&lawdCd&apt&dong → 6개월 거래 집계
│       └── w/rent/building/       # 전월세 단지 상세 (매매 미러)
│           └── page.tsx
│
├── components/
│   ├── sidebar/                   # Sidebar(데스크톱 w-64) + MobileSidebar(<md 햄버거 드로어)
│   │   ├── Sidebar.tsx            #   + SidebarContent + SidebarBookmarks
│   │   ├── MobileSidebar.tsx
│   │   ├── SidebarContent.tsx
│   │   └── SidebarBookmarks.tsx   # 즐겨찾기 섹션 (mounted 후 표시)
│   ├── widget/                    # BaseWidget, DashboardWidget, StatCard + 위젯별 상세 폴더
│   │   ├── BaseWidget.tsx         #   WidgetHeader/Body/Skeleton/Error/Refresh/HealthDot/Diff
│   │   ├── DashboardWidget.tsx
│   │   ├── StatCard.tsx           # 상세 페이지 상단 통계 카드 (공유)
│   │   ├── WidgetPreview.tsx      # 상세 페이지에서 데모 위젯 RSC 렌더
│   │   ├── WidgetDetailStub.tsx   # UpcomingBanner + SidePanelStub
│   │   └── <id>/                  # 위젯별 상세 컴포넌트 (10개 폴더: weather/pharmacy/…/lotto)
│   │       └── …                  #   예: weather/{RegionPicker,WeatherDetail}, sky-icon.ts
│   ├── kakao-map.tsx              # 카카오맵 JS SDK 로더 (NEXT_PUBLIC_KAKAO_MAP_KEY)
│   ├── dashboard-home.tsx         # 메인 대시보드 client island (핀 연동 + 알림 배지)
│   ├── alert-counts-provider.tsx  # 인앱 새 알림 카운트 context (disaster/food-recall)
│   ├── alert-dot.tsx              # rose dot "새 알림 있음" (건수 X) — 페이지 진입 시 markSeen
│   ├── content-backdrop.tsx       # 위젯 그룹별 배경 틴트 (weather는 자체 배경이라 제외)
│   ├── location-defaulter.tsx     # geo → 가장 가까운 시·도를 위젯 기본값으로 (cookie+localStorage)
│   ├── page-frame.tsx             # 페이지 공통 헤더 (eyebrow/title/desc/actions)
│   ├── page-error.tsx             # 페이지 단위 에러 표시
│   ├── command-palette.tsx        # ⌘K
│   ├── pwa-install-prompt.tsx     # DESIGN.md §12.8 트리거
│   ├── sw-register.tsx            # production 한정 register, dev에서 자동 unregister
│   └── error-boundary.tsx         # 위젯 격리
│
├── widgets/                       # ★ 위젯 플러그인 (10종) ★
│   ├── _types.ts                  # Widget 인터페이스 + WidgetConfig (v:1)
│   ├── _registry.ts               # 등록/조회/리스트
│   ├── _registry.bootstrap.ts     # 10개 위젯 등록 (idempotent)
│   ├── _fetch-wrapper.ts          # zod strict + 7s timeout + retry + abort
│   ├── _metadata.ts               # 클라이언트 안전한 위젯 메타 + 사이드바 그룹(living/realestate/culture)
│   ├── README.md                  # 5분 위젯 추가 가이드
│   ├── weather/                   # KMA 단기 + AirKorea + KMA 중기예보
│   ├── pharmacy/                  # 국립중앙의료원 응급의료 (응급실+약국) + sido-centers.ts
│   ├── food-recall/               # 식품안전나라 I0490 (data.go.kr와 별도 시스템)
│   ├── disaster/                  # 행정안전부 긴급재난문자
│   ├── price/                     # KAMIS 농수산물 시세
│   ├── apartment/                 # 국토교통부 RTMS 매매 + lawd-codes.ts
│   ├── rent/                      # 국토교통부 RTMS 전월세
│   ├── library/                   # 정보나루 공공도서관 + 도서 검색
│   ├── tour/                      # 한국관광공사 TourAPI
│   └── lotto/                     # 동행복권 회차 API
│
├── hooks/
│   └── useGeolocation.ts
│
└── lib/
    ├── supabase/{server,browser}.ts
    ├── pinned-widgets.ts          # localStorage 'dataweave.pinned' 읽기/쓰기
    ├── bookmarks.ts               # localStorage 'dataweave.bookmarks' (검색 URL 핀)
    ├── user-location.ts           # nearestSido(lat,lng) — geo → 시·도 (location-defaulter용)
    ├── layout-dims.ts             # 레이아웃 치수 상수 (CONTENT_BACKDROP_INSET 등)
    ├── page-titles.ts             # pathname → eyebrow + title
    ├── utils.ts                   # cn() 등 shadcn 유틸
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
- **`text-xs` + `text-zinc-500` 조합** — 작은 텍스트(<14pt)는 WCAG AA 대비
  4.5:1 필요. `text-zinc-500` (#71717b)은 다크 배경 대비 3.67:1로 미달.
  `text-xs`엔 무조건 `text-zinc-400` 이상. `text-zinc-500`은 큰 텍스트
  (text-base 이상) 또는 보조 강조에만.
- 폰트 mono를 본문에 사용

### 컴포넌트 빌딩 블록

- **PageFrame** — 모든 페이지 헤더 (eyebrow + h1 + description + actions). 새 페이지 만들 때 무조건 이걸로 감싸기.
- **BaseWidget / DashboardWidget** — 위젯 카드. 새 위젯 만들 때 절대 직접 카드 스타일 작성 X.
- **StatCard** — 상세 페이지 상단 통계 카드 (아이콘 + 라벨 + mono 값). 위젯별 상세에서 공유.
- **KakaoMap** (`kakao-map.tsx`) — 카카오맵 JS SDK 로더. 약국/단지/도서관/관광/로또 위젯에서 mini 지도 임베드. `NEXT_PUBLIC_KAKAO_MAP_KEY` 없으면 지도만 안 보이고 위젯은 정상.
- **AlertDot** (`alert-dot.tsx`) — "새 알림 있음" rose dot. 건수는 표시 X, 위젯 페이지 진입 시 `AlertCountsProvider.markSeen`으로 사라짐. 현재 disaster + food-recall.
- **getSkyVisual(skyText)** — 날씨 텍스트 → Lucide 아이콘 + 색상.

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

- `DATA_GO_KR_KEY` — data.go.kr 발급 키 1개 (KMA, AirKorea, 응급의료, RTMS 매매·전월세 공유)
- `FOODSAFETY_API_KEY` — foodsafetykorea.go.kr 별도 시스템 (식품 리콜)
- `LIBRARY_API_KEY` — 정보나루(data4library.kr). 없으면 `DATA_GO_KR_KEY` 폴백
- `TOUR_API_KEY` — 한국관광공사 TourAPI. data.go.kr 통합 키 또는 별도
- `KAMIS_API_KEY` + `KAMIS_CERT_ID` — KAMIS 농수산물 (인증키 + 요청자 id 둘 다 필요)
- `DISASTER_API_KEY` — 행정안전부 긴급재난문자(safetydata.go.kr). 없으면 `DATA_GO_KR_KEY` 폴백
- `NEXT_PUBLIC_KAKAO_MAP_KEY` — 카카오맵 JS SDK (mini 지도). 클라이언트 노출되지만 도메인 제한으로 OK
- 서비스별 변수는 `DATA_GO_KR_KEY`로 자동 폴백. `??` 대신 `||` 사용 (빈 문자열도 폴백 처리).
- 동행복권 로또 API는 키 불필요 (공개 endpoint).

각 위젯은 키 없으면 mock으로 떨어뜨림. mock 데이터는 그 자체로 의미 있게 보이도록 (실제 카드 모양 + 사실적 값).

## API 활용신청 필요 서비스

| 서비스 | data.go.kr ID | 위젯 |
|--------|---------------|------|
| 기상청 단기예보 | 15084084 | weather (오늘~모레) |
| 한국환경공단 에어코리아 | 15073861 | weather (미세먼지) |
| 기상청 중기예보 | 15059468 | weather (4~7일) |
| 국립중앙의료원 응급의료기관 | 15000563 | pharmacy (응급실) |
| 국립중앙의료원 전국 약국 | 15000578 | pharmacy (약국) |
| 국토교통부 RTMS 아파트 매매 | 15126469 | apartment |
| 국토교통부 RTMS 아파트 전월세 | (RTMS 전월세) | rent |

**별도 시스템 (data.go.kr 키 호환 X — 각자 가입·인증키):**

| 서비스 | 시스템 | 위젯 |
|--------|--------|------|
| 식품 회수·판매중지 I0490 | foodsafetykorea.go.kr | food-recall |
| 정보나루 도서관·도서 | data4library.kr | library |
| 한국관광공사 TourAPI 4.0 | (data.go.kr 통합 또는 별도) | tour |
| KAMIS 농산물유통정보 | kamis.or.kr | price |
| 긴급재난문자 | safetydata.go.kr | disaster |
| 동행복권 회차 | dhlottery.co.kr (키 불필요) | lotto |

`food-recall`은 foodsafetykorea.go.kr 별도 가입 + 인증키 발급 필요 — data.go.kr 키 호환 X (HTML 에러 페이지 반환). KAMIS는 인증키 + 요청자 id 둘 다 필요.

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
- 사이드바: **데스크톱(md+)은 `w-64` 고정 표시**, **모바일(<md)은 햄버거 드로어**(`MobileSidebar`). 데스크톱 반응형 collapse는 폐기됐지만 모바일 폭 대응으로 드로어를 추가함 (커밋 b877971 이후). 레이아웃 치수는 `lib/layout-dims.ts`에 상수화.
- 사용자는 본인 1명, 데스크톱 위주, Windows. 백그라운드 dev 서버는 `npm run start`로 일상 사용. Vercel(icn1)에도 live 배포되어 모바일에서도 접속 가능.

## 현재 상태 (Phase 1 + 1.5 완성, Vercel live)

완성:
- Step 0~6 (Phase 1)
- 사이드바 네비(데스크톱 고정 + 모바일 드로어) + 설정 페이지 (localStorage 핀 토글)
- 즐겨찾기 시스템 (검색 URL을 localStorage에 핀, 사이드바 복귀)
- **위젯 10종 + 상세 페이지** — 모두 URL `searchParams` 기반 검색·필터 동기화. 위젯별 화면 문서는 [docs/widgets/](docs/widgets/):
  - 생활·안전: `weather` / `pharmacy` / `food-recall` / `disaster` / `price`
  - 부동산: `apartment` (+ `/building` 단지 상세) / `rent` (+ `/building`)
  - 문화·여가: `library` / `tour` / `lotto`
- 공통 강화: geo 자동 기본값(가장 가까운 시·도), 인앱 알림 배지(disaster·food-recall), 카카오맵 SDK mini 지도, 그룹별 배경 틴트, 추이 차트(apartment·rent·price)
- Vercel(icn1 리전) 배포 완료 — `git push origin main` 시 자동 재배포

미진행 (Phase 2 이후 → [docs/TODOS.md](docs/TODOS.md)): 알림 인프라(TODO 8, Web Push+cron), 자연어 위젯 생성, 다중 사용자/Auth, 워치 갤러리, 복지 위젯·지도 뷰(plans/), 유가 위젯(TODO 11) 등.
