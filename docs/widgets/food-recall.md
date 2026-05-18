# 식품 리콜 (`food-recall`)

식품안전나라 회수·판매중지 정보. **data.go.kr와 별도 시스템.**

## 라우트

| 경로 | 주요 searchParams |
|------|-------------------|
| `/w/food-recall` | `q`(쉼표 구분 키워드), `window`(시간), `grade`(1/2/3) |

## 데이터 소스 ⚠️ 별도 시스템

- API: `https://openapi.foodsafetykorea.go.kr/api/{KEY}/I0490/json/...`
- 서비스 ID: I0490 — **foodsafetykorea.go.kr 에서 별도 가입 + 키 발급**
- data.go.kr 키 호환 X (잘못된 키 사용 시 HTML 에러 페이지 반환)
- 인증키: `FOODSAFETY_API_KEY`

API 필드: `PRDTNM`(제품명), `BSSHNM`(회사명), `CRET_DTM`(날짜), `RTRVLPRVNS`(사유), `RTRVL_GRDCD_NM`(등급)

## 페이지 구성

- 키워드 input (쉼표 구분, 예: `우유, 계란`)
- 자주 쓰는 키워드 chip + 기간 chip
- **등급 필터** (1등급 rose / 2등급 amber / 3등급 zinc 톤)
- 결과 카드: 제품명·회사·등급 badge·사유·날짜

## 진화 이력

| 시점 | 변경 |
|------|------|
| Phase 1 Step 5 | 식품안전나라 OpenAPI 연동 |
| 초기 trial-and-error | data.go.kr 잘못된 endpoint 시도 → HTML 404 → foodsafetykorea로 정정 |
| Phase 1.5 | 등급 필터 chip 추가 |
