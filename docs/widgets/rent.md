# 전월세 실거래가 (`rent`)

국토교통부 RTMS 전월세 실거래가. 매매와 동일 패턴 + 전세/월세 구분.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/rent` | 시·군·구·월 검색 + 거래 리스트 | `sido`, `sigungu`, `lawdCd`, `dealYm`, `type`, `sort`, `q` |
| `/w/rent/building` | 단지 종합 정보 | `sido`, `sigungu`, `lawdCd`, `apt`, `dong` |

`type` ∈ `all` | `jeonse` | `monthly` (chip).

## 데이터 소스

- API: `https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent`
- data.go.kr 서비스: **국토교통부\_아파트 전월세 자료** (서비스 path: `RTMSDataSvcAptRent`)
- 매매와 **별도 활용신청 필요** — 같은 인증키지만 서비스별 활용신청 분리.
- 인증키: `MOLIT_API_KEY` 또는 `DATA_GO_KR_KEY` (폴백)
- 법정동 코드: 매매 widget의 `lawd-codes` 재사용
- 에러 응답 처리: 매매와 동일 `assertApiOk()` 패턴

## 페이지 구성

### `/w/rent` (검색 + 리스트)
1. **RentFilters** — 시·도/시·군·구/기간 3등분 + 단지명 input + 종류 chip (전체/전세/월세) + 정렬 chip
2. **RentTrendChart** — 최근 6개월 시·군·구 평균 보증금 추이 (전세 cyan + 월세 amber 두 시리즈)
3. **StatsRow** — 총 거래/전세 평균/월세 보증금 평균/월세 평균 4-up
4. **RentDetail TradesList** — 거래 행 (전세·월세 chip + 아파트명 → 단지 페이지)

### `/w/rent/building` (단지 페이지) — Phase A 미러
1. **BuildingHeader** — 단지명 h1 + 위치 + **카카오맵** (헤더 우측)
2. **BuildingStats** — 총 거래/전세 평균/월세 보증금 평균/월세 평균 4-up
3. **RentBuildingPriceChart** — 전세 / 월세 보증금 두 sub-chart로 분리 (단위 폭 차이로 같은 y축에 두면 한쪽이 짜부됨)
4. **BuildingAreaGroups** — 평형별 전세·월세 동시 표시
5. **BuildingTradeList** — 최신순 거래 (종류 chip + 면적 + 금액 + 날짜)

PageFrame actions에 **매매 보기** cross-link (emerald accent) → `/w/apartment/building?...`

## 데이터 모델

`schema.ts`의 `RentTrade`:
- 식별: `id` (idx 포함), `aptName`, `dong`, `jibun`
- 거래: `dealDate`, `type` (jeonse/monthly), `deposit`(만원), `monthlyRent`(만원, 전세=0)
- 부가: `area`, `floor`, `buildYear`

`RentData`에 `jeonseCount`/`monthlyCount` + 각 평균 보증금 + `avgMonthlyRent` 사전 집계.

## 진화 이력

| 시점 | 변경 |
|------|------|
| Phase 1.5 v3 | 위젯 신규. 매매와 동일 fetch 패턴, `type` 필터 추가. |
| v3.1 | 평수 표시 공급평 통일 (매매와 동기화). |
| v3.2 | **Phase A 미러** — `/w/rent/building` + `fetchRentBuilding` + `RentBuildingDetail`. |
| v3.2 | RentDetail 가독성 폴리시: column header, row index, sort badge, aptName Link, hover bg. |
| v3.3 | RentFilters 레이아웃을 매매처럼 컴팩트 3등분(시·도/시·군·구/기간) + 단지명 input 추가. |
| v3.3 | fetch에 `assertApiOk()` (매매와 동일). mock에서 region prefix·도로명 제거. |
| v3.3 | **단지 페이지 cross-link**, **단지별 보증금 추이 차트** (전세/월세 sub-chart), **시·군·구 평균 추이 차트** 추가. |

## TODO

- 좌표 매핑 시 카카오맵 임베드 (현재 외부 링크)
- 단지 페이지 캐싱
- 전세→월세 전환률 등 부가 지표 (요청 시)
