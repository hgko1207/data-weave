# 관광·전시 (`tour`)

한국관광공사 TourAPI 4.0 기반 지역 명소 + 축제·공연·전시. 이미지 카드 그리드로 다른 위젯과 시각 톤 차별화.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/tour` | 시·군·구 + 카테고리 검색 | `sido`, `sigungu`, `category` |

`category` ∈ `all` | `nature`(자연) | `culture`(문화·역사) | `festival`(축제·공연) | `leisure`(레저·체험) | `shopping`(쇼핑·시장)

## 데이터 소스

- API: 한국관광공사 TourAPI 4.0 (`apis.data.go.kr/B551011/...`)
- data.go.kr 통합 키 또는 `TOUR_API_KEY` 별도
- 알려진 엔드포인트 (활용신청 + spec 확정 후 연동):
  - `areaBasedList2` — 지역 기반 관광 정보
  - `searchKeyword2` — 키워드 검색
  - `searchFestival2` — 축제 검색
  - `contentTypeId`: 12(관광지) / 14(문화시설) / 15(축제·공연·행사) / 28(레저) / 38(쇼핑)
- 현재는 **mock 우선**. 활용신청 후 실 endpoint 연동.

## 페이지 구성

1. **TourFilters** — 시·도/시·군·구 cascade + 카테고리 chip 6개 (전체/자연/문화/축제/레저/쇼핑)
2. **TourDetail** — 이미지 카드 그리드 (sm:2열, lg:3열)
   - 카드: 대표 이미지(또는 카테고리 아이콘 placeholder) + 카테고리 chip + 제목 + 주소 + overview + (축제) 기간 + 카카오맵·전화·홈페이지 액션

## 디자인 특징

- 카테고리별 톤: nature emerald · culture cyan · festival amber · leisure pink · shopping violet
- 이미지 없으면 카테고리 아이콘 placeholder (zinc-950/60 배경, zinc-700 아이콘) — 빈 공간 어색하지 않게
- `<img loading="lazy">` 사용. 외부 이미지 호스트 보안상 Next/Image 도메인 화이트리스트 없이 일반 img.

## 진화 이력

| 시점 | 변경 |
|------|------|
| v3.4 (2026-05-19) | 위젯 신규. mock 우선 — 활용신청 후 TourAPI 4.0 연동 예정. |

## TODO

- TourAPI 실 연동 (활용신청 후) — `areaBasedList2` 우선
- 상세 페이지 `/w/tour/[contentId]` — 큰 이미지 + 전체 설명 + 운영시간
- 키워드 검색 input 추가 (`searchKeyword2`)
- 좌표 기반 카카오맵 임베드
