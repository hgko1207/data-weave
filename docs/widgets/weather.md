# 날씨 (`weather`)

기상청 단기예보 + 에어코리아 미세먼지 + 기상청 중기예보 (단기 3일 + 중기 5일 = 주간 8일).

## 라우트

| 경로 | 주요 searchParams |
|------|-------------------|
| `/w/weather` | `region` (지역 chip 선택) |

## 데이터 소스 (3개 통합)

| 서비스 | data.go.kr ID | 용도 |
|--------|---------------|------|
| 기상청 단기예보 | 15084084 | 오늘~모레 시간대별 |
| 한국환경공단 에어코리아 | 15073861 | 미세먼지/초미세먼지 + 등급 |
| 기상청 중기예보 | 15059468 | 4~7일 |

모두 `DATA_GO_KR_KEY` 통합 키. AirKorea `pm10Grade`는 nullable (schema drift 방지).

## 페이지 구성

1. **RegionPicker** — 지역 chip 셀렉터 (서울/대전/부산 등)
2. **WeatherDetail**:
   - 현재: 기온/하늘/풍속/풍향/습도, 오늘 high·low
   - 미세먼지 카드 (등급별 색상)
   - 시간대별 24h horizontal strip (`getSkyVisual()` Lucide 아이콘 매핑)
   - 주간 예보 8일 (단기 3 + 중기 5)

## 진화 이력

| 시점 | 변경 |
|------|------|
| Phase 1 Step 3 | 위젯 신규 — KMA + AirKorea |
| Phase 1.5 v3 | 중기예보 (`fetchMidTermForecast`) 추가해서 주간 8일 |
| Phase 1.5 v3 | 시간대별 24h 카드 strip — 가독성 위해 그라데이션 대신 mini cards |
