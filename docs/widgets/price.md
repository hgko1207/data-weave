# 농수산물 시세 (`price`)

농산물유통정보(KAMIS) 기반 카테고리·품목별 시·도 평균가 + 최근 6개월 추이. 매매·전월세에 만든 추이 차트 인프라 재사용.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/price` | 부류별 일일 도소매 가격 테이블 | `category`, `cls` |

- `category` ∈ `grain`(식량작물) | `vegetable`(채소) | `fruit`(과일) | `meat`(축산) | `seafood`(수산)
- `cls` ∈ `retail`(소매) | `wholesale`(도매)

## 데이터 소스

- API: KAMIS `dailyPriceByCategoryList` (일별 부류별 도소매 가격)
  - `http://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList`
  - `p_product_cls_code`: 01 소매 / 02 도매
  - `p_item_category_code`: 100 식량 / 200 채소 / 400 과일 / 500 축산 / 600 수산
  - `p_regday`(YYYY-MM-DD) · `p_convert_kg_yn=Y` · `p_returntype=json`
- 인증: **`KAMIS_API_KEY`(p_cert_key) + `KAMIS_CERT_ID`(p_cert_id) 둘 다 필요**
- 한 번 호출로 그 부류의 모든 품목·품종·등급 가격(전국 평균)을 받음
- 응답 `data.item[]`: `item_name`/`kind_name`/`rank`/`unit` + `dpr1`(당일)·`dpr2`(1일전)·`dpr3`(1주일전)
- 가격은 `"3,032"` 콤마 문자열, 없으면 `"-"` → `null`
- ⚠️ KAMIS 원본에서 `dpr5~7`(1개월·1년·평년)은 일부 품목 단위가 dpr1~4와 달라 신뢰도 낮음 → **dpr1~3만 사용**

## 페이지 구성

1. **PriceFilters** — 부류 chip 5개(식량/채소/과일/축산/수산) + 소매/도매 토글
2. **PriceDetail** — 품목 가격 테이블: 품목·품종·등급 + 단위 + 당일가 + 전일比 ▲▼% + 1주前比 ▲▼%
   - 상승 rose / 하락 cyan / 보합 zinc

## 데이터 모델

- `PriceItem` — id/itemName/kindName/rank/unit + today/prevDay/prevWeek
- `PriceData` — category/cls/regday/items/source
- `catalog.ts` — 우리 카테고리 → KAMIS 부류 코드 매핑 + 라벨

조회일(`regday`)은 KST 기준 **어제** (당일 데이터는 늦게 갱신).

## 진화 이력

| 시점 | 변경 |
|------|------|
| v3.4 (2026-05-19) | 위젯 신규. mock 우선. (시·도 비교 + 추이 차트 가정) |
| v3.5 (2026-05-20) | **KAMIS 실 API 연동** — `dailyPriceByCategoryList`. 실데이터 구조에 맞춰 "품목 1개 → 시·도 비교"에서 **"부류 선택 → 품목 가격 테이블"로 재설계**. 소매/도매 토글 추가. 시·도 비교·추이 차트는 제거(별도 N회 호출 필요 + 단위 불일치). |

## TODO

- 시·도별 가격 (p_country_code 지역코드, N회 호출 또는 productList API)
- 품목별 일별 시계열 추이 (`dailyPriceByCategoryList`는 6시점만)
- 평년 대비 — dpr7 단위 정합성 확인 후
- 친환경/수입산 구분
