# SOS 약국·응급실 (`pharmacy`)

국립중앙의료원 응급의료 OpenAPI — 시·군·구별 약국 / 응급실 검색 + 운영시간 파싱.

## 라우트

| 경로 | 주요 searchParams |
|------|-------------------|
| `/w/pharmacy` | `sido`, `sigungu`, `radius`(km), `kind`(all/pharmacy/emergency), `openNow`(0/1) |

## 데이터 소스

| 서비스 | data.go.kr ID |
|--------|---------------|
| 국립중앙의료원\_응급의료기관 | 15000563 |
| 국립중앙의료원\_전국 약국 | 15000578 |

응답 `items` 필드는 array / object / null 다양 — `z.unknown()` + 방어적 추출.

## 페이지 구성

- 시·도 → 시·군·구 cascade select + "전체" 옵션 (235개 매핑)
- 종류 chip (전체/약국/응급실)
- 반경 chip (반경 km — 사용자 위치 기준)
- **지금 영업중 토글** — KST 기준 운영시간 파싱
- 결과 행: 이름·주소·전화·거리 + 전화 버튼 + Kakao Map 외부 링크

## 진화 이력

| 시점 | 변경 |
|------|------|
| Phase 1 Step 4 | 응급의료 OpenAPI 연동, 거리 계산 |
| Phase 1.5 | 시·군·구 cascade select + "전체" 옵션 |
| Phase 1.5 | "지금 영업중" 토글 — 운영시간 파싱 |
