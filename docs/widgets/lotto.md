# 로또 (`lotto`)

동행복권 6/45 회차별 당첨번호 + 1등 배출점. 시·도/시·군·구 cascade 없이 회차 stepper만 — 가장 가벼운 위젯.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/lotto` | 회차 당첨번호 + 배출점 | `round` (없으면 최신) |

## 데이터 소스

- 비공식 API: `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=<round>` (JSON)
- 1등 배출점: `https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=<round>` — HTML 스크래핑 필요
- **별도 인증키 불필요** (공개 API/페이지)
- 응답 포맷이 자주 바뀌어 스크래핑 안정성 고려. 안전망으로 mock 폴백.
- 현재 mock — 회차 시드 기반 결정적 데이터.

## 페이지 구성

1. **DrawCard** — 회차/추첨일 + 회차 stepper(이전/다음/최신) + 당첨번호 6개 + 보너스
   - 공 색상: 1-10 노랑 / 11-20 파랑 / 21-30 빨강 / 31-40 회색 / 41-45 초록
2. **PrizeCard** — 1등 당첨금 + 당첨자 수 (amber)
3. **TopStoresCard** — 1등 배출점 시·도별 그룹화. 자동/수동/반자동 chip 톤 emerald/cyan/amber

## 데이터 모델

`schema.ts`의 `LottoData`:
- `round`, `drawDate`, `numbers`(6개), `bonus`
- `firstPrizeAmount`, `firstPrizeWinners`
- `topStores: { name, address, sido, method }[]`
- `latestRound` — stepper 한계 결정용 (`currentLatestRound(now)` 기반)

`currentLatestRound`는 2002-12-07 1회차 기준으로 현재 주차 계산. 동행복권 추첨일(매주 토요일)과 정확히 맞을 필요는 없고 UI 상한선만 표시.

## 진화 이력

| 시점 | 변경 |
|------|------|
| v3.4 (2026-05-19) | 위젯 신규. mock 우선. |

## TODO

- 동행복권 실 API 연동 — getLottoNumber JSON
- 1등 배출점 HTML 스크래핑 (또는 RSS/공개 데이터 발견 시 대체)
- 회차 직접 입력 input (현재는 stepper만)
- 당첨번호 통계 — 자주 나온 번호, 핫/콜드 분석 (선택)
