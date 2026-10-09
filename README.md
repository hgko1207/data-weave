# DataWeave

한국 공공데이터 조회형 위젯 대시보드. 날씨 · SOS 병원·약국 · 식품 리콜 · 재난문자 · 농수산물 시세 · 아파트 매매/전월세 · 공공도서관 · 관광·전시 · 로또 — **10종 위젯**을 한 곳에서.

**🔗 Live:** <https://data-weave-psi.vercel.app>

![DataWeave 대시보드 화면](docs/screenshots/home.png)

위젯별 상세 페이지, 즐겨찾기, 카카오맵 미니 지도, 앱 안 알림 배지까지 완성됐고(Phase 1·1.5), 웹 푸시 알림은 Phase 2에서 붙일 예정입니다. 설계: [PLAN](docs/PLAN.md) · [DESIGN](docs/DESIGN.md) · [TODOS](docs/TODOS.md) · [위젯별 문서](docs/widgets/)

## 실행

```bash
npm install
cp .env.example .env.local   # 키 채우기
npm run dev                  # http://localhost:3000
npm run build                # production build (Turbopack)
```

**API 키가 없어도 mock 데이터로 위젯이 동작합니다.** 실제 데이터를 쓰려면 최소 `DATA_GO_KR_KEY`(data.go.kr)와 `FOODSAFETY_API_KEY`(식품안전나라)가 필요합니다. 키 목록·발급 방법과 Vercel 배포는 [docs/setup.md](docs/setup.md)에 있습니다.

`main`에 푸시하면 Vercel이 자동 재배포합니다(서버 리전: 서울 `icn1`).

## PWA 설치

- 데스크톱(Chrome/Edge): 주소창 오른쪽 "설치" 아이콘
- iOS Safari: 공유 버튼 → "홈 화면에 추가"
- 방문 3회 이상 + 활성 위젯 1개 이상이면 자동 설치 배너 표시

## 새 위젯 추가

5분이면 됩니다. [src/widgets/README.md](src/widgets/README.md) 가이드 참고.
