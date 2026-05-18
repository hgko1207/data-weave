# 매매 실거래가 (`apartment`)

국토교통부 RTMS 매매 실거래가를 시·군·구·월 단위로 조회.
+ 단지 페이지에서 같은 단지의 시간순 거래 추이.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/apartment` | 시·군·구·월 검색 + 거래 리스트 | `sido`, `sigungu`, `lawdCd`, `dealYm`, `sort`, `q` |
| `/w/apartment/building` | 단지 종합 정보 | `sido`, `sigungu`, `lawdCd`, `apt`, `dong` |

`q`는 단지명·동 키워드(client-side 필터). `dealYm`은 `YYYYMM`.

## 데이터 소스

- API: `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade`
- data.go.kr 서비스: **국토교통부\_아파트 매매 실거래 자료** (서비스 path: `RTMSDataSvcAptTrade`)
- 응답: XML only → `fast-xml-parser`
- 인증키: `MOLIT_API_KEY` 또는 `DATA_GO_KR_KEY` (폴백)
- 법정동 코드 매핑: [src/widgets/apartment/lawd-codes.ts](../../src/widgets/apartment/lawd-codes.ts) — 229개 시·군·구 5자리 코드 (군위군 27720 = 대구 편입 반영)

### 에러 응답 처리
fetch 응답을 `assertApiOk()`로 검사 — `<OpenAPI_ServiceResponse>` 또는 `response.header.resultCode != '00'/'000'/'0'` 이면 throw → caller가 mock으로 폴백 + `source='mock'` 배지. `fast-xml-parser`가 `<resultCode>00</resultCode>`를 숫자 0으로 자동 변환하므로 `'0'`도 정상 코드로 인정.

## 페이지 구성

### `/w/apartment` (검색 + 리스트)
1. **ApartmentFilters** — 시·도/시·군·구/기간 3등분 + 단지명 input + 정렬 chip (최신순/가격↓↑/면적↓/평당가↓)
2. **ApartmentTrendChart** — 최근 6개월 시·군·구 평균가 추이 (월별 1점)
3. **StatsRow** — 총 거래·평균·최저·최고 4-up
4. **ApartmentTradesList** — 거래 행 (확장 토글, 아파트명 클릭 → 단지 페이지)

### `/w/apartment/building` (단지 페이지) — Phase A
1. **BuildingHeader** — 단지명 h1 + 위치·건축년도 + **카카오맵** 외부 링크 (헤더 우측)
2. **BuildingStats** — 평균가/최저/최고/평당 평균 4-up
3. **BuildingPriceChart** — 시간순 거래가 산점도 + 추세선(선형 회귀)
4. **BuildingAreaGroups** — 평형별 평균/최저/최고 (공급평 round)
5. **BuildingTradeList** — 최신순 거래 내역

PageFrame actions에 **전월세 보기** cross-link (cyan accent) → `/w/rent/building?...`

## 데이터 모델

`schema.ts`의 `ApartmentTrade`:
- 식별: `id` (idx 포함, 호수 비공개 거래 중복 충돌 방지), `aptName`, `aptDong`, `dong`, `jibun`, `roadName`
- 거래: `dealDate`, `dealAmount`, `area`, `pricePerPyeong`, `floor`, `buildYear`
- 부가: `dealType`(중개/직거래), `agentSido`, `sellerType`/`buyerType`, `rgstDate`, `cancelDealDay`

평수 계산은 [src/widgets/apartment/format.ts](../../src/widgets/apartment/format.ts):
- `pyeongLabel(area)` → "약 33평" (공급평 기준, `SUPPLY_RATIO = 1.296`)
- `pricePerPyeong = dealAmount / supplyPyeong`

## 진화 이력

| 시점 | 변경 |
|------|------|
| Phase 1.5 v3 | 위젯 신규 추가. lawd-codes 229개, fast-xml-parser 의존. |
| v3 | 위젯 강화: 정렬 chip + 6개월 평균가 추이 차트. 행 확장 토글. |
| v3 | `idx` 포함 trade.id — 동일 데이터 거래 React key 충돌 해소. |
| v3.1 | 평수 표시를 전용평(25.7평) → 공급평(33평형)으로 통일. |
| v3.1 | **Phase A — 단지 페이지** (`/w/apartment/building`) 추가. |
| v3.2 | 단지 페이지 가독성 폴리시: 카카오맵을 헤더 액션으로, 통계 아이콘+accent, 거래 행 컬럼 재배치(면적→가격→날짜), EmptyState 백 링크. |
| v3.3 | fetch에 `assertApiOk()` — API 에러 응답을 명시적으로 throw → mock 폴백 정확도 ↑. |
| v3.3 | mock 데이터에서 region prefix·도로명·지번 제거 — region에 부정확한 단서를 주지 않도록. |
| v3.3 | **단지 페이지 ↔ 전월세 단지 페이지 cross-link**, **단지별 시간순 가격 추이 차트** 추가. |

## TODO

- 좌표 매핑(법정동 → 위경도) 확보 시 카카오맵 임베드 인라인 (현재 외부 링크)
- 단지 정보 캐싱 (RTMS 6회 호출 비용 절감)
- 평형별 추이 차트 (현재는 통합 추이 + 평형별 평균만)
