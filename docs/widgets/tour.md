# 관광·전시 (`tour`)

한국관광공사 TourAPI 4.0 기반 지역 명소 + 축제·공연·전시. 이미지 카드 그리드로 다른 위젯과 시각 톤 차별화.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/tour` | 시·군·구 + 카테고리 검색 | `sido`, `sigungu`, `category` |

`category` ∈ `all` | `nature`(자연) | `culture`(문화·역사) | `festival`(축제·공연) | `leisure`(레저·체험) | `shopping`(쇼핑·시장)

## 데이터 소스

- API: 한국관광공사 TourAPI 4.0 **KorService2** `areaBasedList2`
  - `apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey&areaCode&contentTypeId&_type=json`
- `TOUR_API_KEY` (없으면 `DATA_GO_KR_KEY` 폴백)
- 매핑: [area-codes.ts](../../src/widgets/tour/area-codes.ts)
  - 시·도명 → areaCode (대전 3 등)
  - 카테고리 → contentTypeId: nature 12 / culture 14 / festival 15 / leisure 28 / shopping 38 / all 미지정
- 응답 `response.body.items.item[]` = `{ contentid, contenttypeid, title, addr1, addr2, firstimage, tel, mapx, mapy }`. 결과 없으면 `items=""` (방어 처리)
- 시·군·구는 sigungucode 매핑이 없어 `addr1` 매칭으로 client 필터
- 키 없거나 실패 시 mock 폴백
- ⚠️ 사용자가 활용신청한 서비스가 KorService1이면 엔드포인트 조정 필요 (현재 KorService2 기준)

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
| v3.4 (2026-05-19) | 위젯 신규. mock 우선. |
| v3.5 (2026-05-20) | **실 연동** — KorService2 `areaBasedList2`. areaCode/contentTypeId 매핑, 시·군·구 addr 매칭, firstimage 카드. overview/홈페이지/축제 기간은 areaBasedList2에 없어 null (detailCommon/searchFestival 별도). |

## TODO

- 상세 페이지 `/w/tour/[contentId]` — `detailCommon2`로 큰 이미지 + 전체 설명 + 운영시간 + 홈페이지
- 축제는 `searchFestival2`로 기간(startDate/endDate) 채우기
- 키워드 검색 (`searchKeyword2`)
- 좌표(mapx/mapy) 기반 카카오맵 핀 (현재 q 검색)
