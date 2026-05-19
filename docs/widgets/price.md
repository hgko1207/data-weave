# 농수산물 시세 (`price`)

농산물유통정보(KAMIS) 기반 카테고리·품목별 시·도 평균가 + 최근 6개월 추이. 매매·전월세에 만든 추이 차트 인프라 재사용.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/price` | 카테고리·품목별 가격 + 시·도 비교 + 추이 | `category`, `item` |

- `category` ∈ `vegetable`(채소) | `fruit`(과일) | `meat`(축산) | `seafood`(수산) | `grain`(곡물)
- `item`은 카테고리 내 품목 id (`veg-cabbage`, `fruit-apple` 등)

## 데이터 소스

- API: 농산물유통정보 KAMIS OpenAPI (`www.kamis.or.kr/customer/price/retail/...` 또는 data.go.kr 매핑)
- data.go.kr 통합 키 또는 `KAMIS_API_KEY` 별도
- 활용신청 + 품목 코드 매핑 후 실 endpoint 연동
- 현재는 **mock** — 품목별 base 가격에 시·도/월별 ±편차 적용한 결정적 데이터

## 페이지 구성

1. **PriceFilters** — 카테고리 chip 5개(채소/과일/축산/수산/곡물) + 카테고리별 품목 chip
2. **StatsRow** — 전국 평균 / 전월 대비 ▲▼% / 전년 동월 대비 ▲▼% (3-up)
3. **PriceTrendChart** — 최근 6개월 월별 평균가 추이 (매매 `ApartmentTrendChart` 패턴)
4. **RegionPriceGrid** — 시·도별 가격 카드 그리드 + 전국 평균 대비 ±% (rose↑/cyan↓)

## 데이터 모델

- `PriceItem` — id/name/category/unit (kg/포기/10개 등)
- `RegionPrice` — sido/price/prevMonth/prevYear
- `TrendPoint` — ym/label/avg
- `PriceData` — 위 + nationwide 평균과 prev*, 카테고리 내 catalog(품목 chip 렌더링용)

`catalog.ts`에 카테고리별 대표 품목 카탈로그 하드코딩 — KAMIS 실 카탈로그가 방대하여 우선 흔히 보는 품목 위주로 25종.

## 진화 이력

| 시점 | 변경 |
|------|------|
| v3.4 (2026-05-19) | 위젯 신규. mock 우선. 매매 추이 차트 패턴 재사용. |

## TODO

- KAMIS 실 API 연동 (활용신청 + 품목 코드 매핑)
- 카탈로그 확장 (현재 25종 → 100종+)
- 일별 가격 (현재 월별)
- 도매/소매 토글
- 평년(5년 평균) 대비 표시
