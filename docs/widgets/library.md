# 공공도서관 (`library`)

전국 공공도서관 위치·운영시간 + 도서명 → 보유 도서관 검색. SOS의 위치 cascade + 매매의 단지명 검색 패턴 결합.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/library` | 시·군·구 도서관 검색 + 도서 검색 | `sido`, `sigungu`, `mode`, `q` |

- `mode` ∈ `location`(인근 도서관) | `book`(도서명 → 보유 도서관)
- `q` 키워드는 mode에 따라 도서관명/동(location) 또는 도서 제목(book)

## 데이터 소스

- API: **정보나루** (`https://data4library.kr/api/...`)
- data.go.kr 통합 키 또는 별도 인증키(`LIBRARY_API_KEY`)
- 알려진 엔드포인트 (활용신청 + spec 확정 후 연동):
  - `libSrch` — 도서관 검색
  - `srchBooks` — 도서 검색
  - `libSrchByBook` — 책 소장 도서관
- 현재는 **mock 우선** — region 시드 기반 결정적 목 데이터. `LIBRARY_API_KEY` 또는 `DATA_GO_KR_KEY` 활용신청 후 실 endpoint 연동.

## 페이지 구성

1. **LibraryFilters** — 시·도/시·군·구 cascade + 키워드 input + mode chip (도서관 위치 / 도서명 검색)
2. **MatchedBookCard** (mode=book + 검색어 있을 때) — 매칭 도서 메타 (작가·출판사·ISBN)
3. **StatsRow** — 보유 도서관/대출 가능/조회 지역 3-up
4. **LibraryList** — 도서관 카드: 이름·주소·운영시간·휴관일·장서 수 + 전화·카카오맵·홈페이지 외부 링크. book mode에서는 대출 가능/대출 중/미소장 chip 표시.

## 데이터 모델

`schema.ts`의 `Library`:
- 기본: `id`, `name`, `address`, `sigungu`, `tel`, `homepage`
- 운영: `openHours`, `closedDays`, `bookCount`(장서 수)
- book mode 한정: `holdsBook`, `bookAvailable`

## 진화 이력

| 시점 | 변경 |
|------|------|
| v3.4 (2026-05-19) | 위젯 신규. mock 우선 — 활용신청 후 정보나루 API 연동 예정. |

## TODO

- 정보나루 실 API 연동 (활용신청 후)
- 도서관 상세 페이지 `/w/library/[id]` — 보유 도서 목록, 좌석 현황
- 도서 검색 자동완성 (debounce)
- 좌표 기반 인근 도서관 (현재 사용자 위치 활용)
