# 신규 위젯 로드맵 (2026-05)

기존 5개 위젯(weather/pharmacy/food-recall/apartment/rent) 위에 4개를 사용자 결정 우선순위대로 추가.

## 우선순위

| # | 위젯 | id | 카테고리 | 데이터 소스 | 상태 |
|---|------|----|---------|------------|------|
| 1 | 공공도서관 + 도서 검색 | `library` | 교육/문화 | 정보나루(data4library.kr) — data.go.kr 통합 | ✅ mock 출시 (실 API 활용신청 대기) |
| 2 | 관광/전시·공연 | `tour` | 생활/문화 | 한국관광공사 TourAPI (data.go.kr) | ✅ mock 출시 |
| 3 | 로또 | `lotto` | 생활 | 동행복권 회차 API | ✅ mock 출시 |
| 4 | 농수산물 시세 | `price` | 생활/물가 | 농산물유통정보 KAMIS (data.go.kr) | ✅ mock 출시 |

각 위젯은 독립 ship — 한 위젯 완료 후 다음으로. 매매·전월세에 만든 인프라(시·도→시·군·구 cascade, URL=진실, 즐겨찾기, 추이 차트)를 최대한 재사용.

---

## 1. 공공도서관 (`library`)

- 라우트
  - `/w/library?sido=&sigungu=&mode=&q=` — mode: `location`(인근 도서관) | `book`(도서명 → 보유 도서관)
  - (선택) `/w/library/[libCode]` — 단지 페이지 패턴 차용, 도서관 상세
- 데이터: 정보나루 OpenAPI (도서관 정보 + 도서 검색)
- 페이지 구성:
  1. 검색 폼 — 시·도/시·군·구 cascade + mode chip + 키워드 input
  2. 결과 카드 리스트 — 도서관(이름·주소·운영시간·휴관일·열람실/자료실 보유) 또는 보유 도서관 그룹(책 → 도서관별 대출 가능)
  3. 카카오맵 외부 링크 (단지 페이지의 헤더 액션 패턴 재사용)
- 인프라 재사용: SOS의 시·군·구 cascade + 매매의 단지명 검색

## 2. 관광/전시·공연 (`tour`)

- 라우트: `/w/tour?sido=&sigungu=&category=`
- category: 자연/문화/축제·공연·행사/체험/숙박 등 (TourAPI contentTypeId 기반)
- 데이터: 한국관광공사 TourAPI 4.0 (`apis.data.go.kr/B551011/...`)
- 페이지 구성:
  1. 시·군·구 + 카테고리 chip
  2. **이미지 카드 그리드** — 지금까지 텍스트 위주 위젯과 결이 다른 시각적 위젯
  3. 카드: 대표 이미지 + 이름 + 주소 + 카카오맵 링크
- 키 포인트: 이미지 fetch는 첫 외부 의존 — Next/Image whitelist 또는 `<img>` 처리

## 3. 로또 (`lotto`)

- 라우트: `/w/lotto?round=`
- 데이터: 동행복권 공식 API — 회차별 당첨번호 + 1등 배출점
- 페이지 구성:
  1. 회차 stepper (이전/다음) + 회차 직접 입력
  2. 당첨번호 6개 + 보너스 (색상별 공)
  3. 1등 판매점 리스트 (지역별 그룹)
- 가볍게 — 매주 한 번 보는 위젯, 트렌드/차트 없이 깔끔하게

## 4. 농수산물 시세 (`price`)

- 라우트: `/w/price?item=&sido=&period=`
- 데이터: KAMIS 농산물유통정보 OpenAPI
- 페이지 구성:
  1. 품목 검색/카테고리 (사과/돼지고기/배추 등)
  2. 시·도별 가격 비교 카드
  3. **가격 추이 차트** — 매매의 `ApartmentTrendChart` 패턴 재사용 (월별 평균가)
  4. 평년 대비 ±% badge
- 인프라 재사용: 추이 차트, 시·도 select

---

## 공통 작업 패턴

각 위젯 추가 시 동일 절차:
1. `src/widgets/<id>/` 폴더 + 6개 파일 (schema/mock/fetch/Render/ConfigForm?/index)
2. `_registry.bootstrap.ts` 등록 한 줄
3. `_metadata.ts` 메타 추가 (사이드바·설정·Cmd+K 자동 반영)
4. `src/app/(dashboard)/w/<id>/page.tsx` 상세 페이지
5. `docs/widgets/<id>.md` 화면 문서
6. mock 폴백 우선 — API 키 없이도 동작 + `source='mock'` 배지

[src/widgets/README.md](../../src/widgets/README.md) 코드 가이드 그대로 따른다.
