# 공공도서관 (`library`)

전국 공공도서관 위치·운영시간 + 도서명 → 보유 도서관 검색. SOS의 위치 cascade + 매매의 단지명 검색 패턴 결합.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/library` | 시·군·구 도서관 검색 + 도서 검색 | `sido`, `sigungu`, `mode`, `q` |

- `mode` ∈ `location`(인근 도서관) | `book`(도서명 → 보유 도서관)
- `q` 키워드는 mode에 따라 도서관명/동(location) 또는 도서 제목(book)

## 데이터 소스

- API: **정보나루** (`https://data4library.kr/api/libSrch`)
- 인증키 `LIBRARY_API_KEY` (없으면 `DATA_GO_KR_KEY` 폴백)
- **location mode 실 연동 완료** — `libSrch?authKey=KEY&region=<코드>&format=json`
  - region(시·도) 코드 매핑: [region-codes.ts](../../src/widgets/library/region-codes.ts) (대전 25 등)
  - 시·군·구는 응답에 없어 `address` 문자열 매칭으로 client 필터
  - 응답 `response.libs[].lib` = `{ libCode, libName, address, tel, homepage, operatingTime, closed, BookCount, latitude, longitude }`
  - 좌표(latitude/longitude)로 카카오맵 핀 정확하게 (`map.kakao.com/link/map/이름,위도,경도`)
- **book mode(도서명→소장 도서관) 실 연동** — 2단계 + 도서 선택 UX:
  1. `srchBooks?keyword=&pageSize=30` → **도서 목록**. 정보나루는 `loan_count`(대출순) 정렬이라 제목에 검색어 포함된 책을 client에서 우선 재정렬. URL에 `isbn` 없으면 도서 목록 그리드(표지+제목+저자) 표시.
  2. 사용자가 책 선택(URL `isbn=` 추가) → `libSrchByBook?isbn13=&region=` → 소장 도서관 (libSrch와 동일 구조, `holdsBook=true`)
  - 검색어 없으면 안내, 키 없거나 실패 시 mock
  3. 소장 도서관 상위 25곳에 `bookExist?libCode=&isbn13=` 병렬 호출 → 대출 가능 여부(`loanAvailable` Y/N) → "대출 가능"/"대출 중"/"소장" chip. 응답 형식 안 맞으면 null=소장만.
  - ⚠️ 정보나루는 실시간이 아니라 각 도서관 동기화 데이터 — 최종 대출 상태는 도서관 통합 홈페이지에서 확인 권장
- 키 없거나 호출 실패 시 mock 폴백, `source='mock'` 배지

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
| v3.4 (2026-05-19) | 위젯 신규. mock 우선. |
| v3.5 (2026-05-20) | **location mode 실 연동** — 정보나루 `libSrch`. region 코드 매핑, 시·군·구·키워드 client 필터, 좌표 기반 카카오맵 핀. |
| v3.5 (2026-05-20) | **book mode 실 연동** — `srchBooks` → `libSrchByBook` 2단계. 처음엔 첫 1권 자동선택이었으나, 정보나루가 대출순 정렬이라 "사랑" 검색에 "종의 기원"이 뜨는 문제 → **도서 목록(표지+제목)에서 사용자가 선택**하는 UX로 개선. 제목 매칭 우선 재정렬. URL `isbn=`로 선택 상태. |

## TODO

- 도서관 상세 페이지 `/w/library/[libCode]` — 보유 도서 목록, 좌석 현황
- 대출 가능 여부 — `bookExist`(libCode+isbn) 추가 호출 (현재 소장 여부만)
- 좌표 기반 인근 도서관 (현재 사용자 위치 활용)
