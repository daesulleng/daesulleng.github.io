# 사용자 제공 카테고리 픽토그램

원본 PNG 10개의 색상·투명도·비율을 유지합니다. 2026-10-11 원본 바이트 일치를 다시 확인했습니다. 홈과 가게 카드/상세/지도/선택 화면은 같은 표시 카테고리를 사용하며 메뉴의 재료로 아이콘을 덮어쓰지 않습니다.

| 홈 카테고리 | 자산 |
| --- | --- |
| 한식·혼밥 | rice.png (공기밥) |
| 중식 | jajang.png (자장면) |
| 양식 | pasta.png (파스타) |
| 일식 | sushi.png (초밥) |
| 베트남 | asian.png (아시아음식) |
| 치킨 | chicken.png |
| 고기 | meat.png |
| 술집 | drinks.png (술) |
| 카페 | cafe.png |
| 오락 | games.png |
| 편의 | 기존 장바구니 아이콘 |

홈 카테고리·업종 별칭·분류 규칙: `data/store_category_rules.json`. 변경 후 `python3 scripts/generate_store_categories.py`로 앱/서버 규칙을 함께 생성합니다. 원천 업종은 보존합니다. 베트남으로 분류할 근거가 없는 아시아음식은 전체 목록에 남기고 asian.png를 사용합니다.
