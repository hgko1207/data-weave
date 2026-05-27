# 재난문자 (`disaster`)

행정안전부 긴급재난문자를 지역·긴급단계·기간별로 타임라인 조회. "생활·안전" 그룹.

## 라우트

| 경로 | 페이지 | 주요 searchParams |
|------|--------|-------------------|
| `/w/disaster` | 재난문자 타임라인 | `sido`, `sigungu`, `level`, `window` |

- `level` ∈ `all` | `critical`(위급) | `emergency`(긴급) | `info`(안내)
- `window` ∈ `24` | `72`(기본) | `168` (시간)

## 데이터 소스

- 행정안전부 긴급재난문자 — **재난안전데이터공유플랫폼(safetydata.go.kr)** 기반, data.go.kr 연계(15134001)
- 공유플랫폼 **별도 가입 + 활용신청** 필요 (data.go.kr 통합 키와 다를 수 있음)
- 알려진 응답 필드(대문자 약어): `CRT_DT`(생성일시) · `RCPTN_RGN_NM`(수신지역) · `DST_SE_NM`(재난구분) · `EMRG_STEP_NM`(긴급단계) · `MSG_CN`(메시지)
- `EMRG_STEP_NM` → level 매핑: "위급" critical / "긴급" emergency / 그 외 info (`mapEmergencyLevel`)
- **현재 mock** — endpoint/응답 spec 확정 전. `DISASTER_API_KEY` 발급 + 실 응답 확인 후 연동.

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
| v3.6 (2026-05-27) | 위젯 신규. mock 우선 (UI/UX 완성). safetydata.go.kr 활용신청 후 실 연동 예정. |

## TODO

- 실 API 연동 — safetydata.go.kr 신버전 endpoint/응답 확정 후
- 사용자 위치 기반 자동 지역 (geolocation)
- Phase 2: 재난문자 push 알림 (TODO 8 알림 인프라)
