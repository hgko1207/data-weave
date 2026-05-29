# 재난문자 (`disaster`)

행정안전부 긴급재난문자를 지역·긴급단계·기간별로 타임라인 조회. "생활·안전" 그룹.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/disaster` | 재난문자 타임라인 | `sido`, `sigungu`, `level`, `window` |

- `level` ∈ `all` | `critical`(위급) | `emergency`(긴급) | `info`(안내)
- `window` ∈ `24` | `72`(기본) | `168` (시간)

## 데이터 소스

- 행정안전부 긴급재난문자 — **재난안전데이터공유플랫폼(safetydata.go.kr)** 기반
- 엔드포인트: `https://www.safetydata.go.kr/V2/api/DSSP-IF-00247`
- 파라미터: `serviceKey` · `pageNo` · `numOfRows` · `returnType=json`
- 응답 필드: `SN` · `CRT_DT`("YYYY/MM/DD HH:MM:SS") · `RCPTN_RGN_NM` · `DST_SE_NM` · `EMRG_STEP_NM` · `MSG_CN`
- `EMRG_STEP_NM` → level: "위급" critical / "긴급" emergency / 그 외 info
- ⚠️ body가 **SN 오름차순(오래된→최신)**이라 최신 데이터는 **마지막 페이지** 호출 필요
- 동작: `numOfRows=1`로 totalCount 확인 → `pageNo=마지막 numOfRows=200`로 최신 200건 → client에서 sentAt 역순 정렬 + windowHours·지역·level 필터
- `DISASTER_API_KEY` 없으면 mock 폴백

## 페이지 구성

1. **DisasterFilters** — 시·도/시·군·구 + 긴급단계 chip(전체/위급/긴급/안내) + 기간 chip(24h/3일/7일)
2. **StatsRow** — 위급/긴급/전체 3-up
3. **Timeline** — 시간 역순 카드. 긴급단계별 좌측 컬러 바 + 아이콘(Siren/AlertTriangle/Info), 재난유형, 상대시각("3시간 전"), 메시지, 수신지역
   - 위급 rose / 긴급 amber / 안내 cyan

## 데이터 모델

- `DisasterMessage` — id/sentAt/region/disasterType/level/message
- `EmergencyLevel` — critical | emergency | info
- `DisasterData` — region/windowHours/level/messages/total/source

## 진화 이력

| 시점 | 변경 |
|------|------|
| v3.6 (2026-05-27) | 위젯 신규. mock 우선 (UI/UX 완성). |
| v3.6 (2026-05-29) | **실 API 연동** — safetydata.go.kr DSSP-IF-00247. 마지막 페이지=최신 200건. CRT_DT(KST) ISO 변환, EMRG_STEP_NM → level 매핑, sentAt 역순 + windowHours·지역·level client 필터. |

## TODO

- 마지막 페이지 데이터 부족 시 직전 페이지도 받아 합치기 (windowHours=168이면 700건+ 필요)
- 사용자 위치 기반 자동 지역 (geolocation)
- Phase 2: 재난문자 push 알림 (TODO 8 알림 인프라)
