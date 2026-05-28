# 롤체 판단기 — Spec (v1, 2026-05-28)

> 사용자 설계서 원본. 본 파일은 ground truth. 코드 변경 시 이 spec 과 일치해야 함.

## 한 줄 정의
롤토체스 수동 미러링 AI 판단기 — iPhone Safari + 게임을 빠르게 왔다 갔다 하며 쓰는 턴 의사결정 도구.

## 절대 금지
- 단순 S티어 덱 추천 X
- "AD 각 열어두세요" 모호한 조언 X
- 유닛 개수 / 상점 / 골드 / 이자 무시 X

## MVP 1 범위 (이번 라운드)
- 모바일 Safari 최적화
- 게임 상태 입력 (라운드/레벨/골드/체력/보드 상태)
- 체스판 / 대기석 9칸 / 상점 5칸 수동 미러링
- 유닛 선택 모달 (검색 + 코스트 필터 + 최근)
- 아이템 트레이 + 방향 점수
- 골드/이자 자동 계산 + spend limit
- 같은 유닛 개수 / 2성 가능 표시
- mock AI judge → 결과 카드 (상점 5칸 각각 buy/skip/conditional + 판매 + 리롤 + 레벨업 + 증강체 순위 + 턴 플랜)
- localStorage 저장/복원
- PWA add-to-home
- Vercel 배포

## NON-GOAL (MVP 1)
- 실 AI API 호출 (mock 만)
- Supabase
- Riot API 연동
- 스크린샷 OCR
- 정확한 셋14 유닛 데이터 (시드 유닛 30개 정도)

자세한 원본 설계서는 사용자 요청 메시지 참고. 본 파일 = MVP 1 요약 + invariant.

## Invariant (절대 깨지면 안 됨)
1. 상점 구매 → 골드 자동 차감 + 대기석 자동 추가 + 유닛 개수 재계산
2. 상점 5칸 각 유닛에 대해 judge 가 반드시 4 후보 (buy/skip/conditional/hold) 중 1 출력
3. judge 는 반드시 리롤 여부 + 레벨업 여부 + 증강체 순위 + turnPlan 출력
4. 모바일 한 손 조작 — 모든 버튼 최소 44pt
5. localStorage 키 = `rolche.gameState.v1` 고정

## Mistake Log (다음 라운드 negative example)
- (이번이 첫 라운드 — 비어있음)
