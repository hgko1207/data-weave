# Widgets — 화면별 문서

위젯·페이지별로 데이터 소스, 라우트, 기능, 진화 이력을 정리.
[PLAN.md](../PLAN.md)는 공통 골격(차터, 위젯 인터페이스, 사이드바, 즐겨찾기)만 다루고
구현 디테일은 이 폴더로 분산.

| 위젯 | 데이터 소스 | 라우트 | 문서 |
|------|-------------|--------|------|
| 매매 실거래가 | 국토교통부 RTMS 매매 | `/w/apartment` + `/w/apartment/building` | [apartment.md](apartment.md) |
| 전월세 실거래가 | 국토교통부 RTMS 전월세 | `/w/rent` + `/w/rent/building` | [rent.md](rent.md) |
| 날씨 | 기상청 단기예보 + 에어코리아 + 중기예보 | `/w/weather` | [weather.md](weather.md) |
| SOS 약국·응급실 | 국립중앙의료원 응급의료 | `/w/pharmacy` | [pharmacy.md](pharmacy.md) |
| 식품 리콜 | 식품안전나라 I0490 | `/w/food-recall` | [food-recall.md](food-recall.md) |

## 새 위젯 추가하기

코드 레벨 추가 가이드는 [src/widgets/README.md](../../src/widgets/README.md) 참조.
이 폴더(docs/widgets/)에는 사용자 화면 관점의 문서를 추가:

```markdown
# <위젯 이름>
- 라우트, 검색 파라미터
- 데이터 소스 (data.go.kr 서비스 ID 등)
- 페이지 구성, 주요 컴포넌트
- 진화 이력
- TODO
```

화면 단위로 문서가 커지면 `docs/widgets/<id>-detail.md` 같이 분리 OK.
