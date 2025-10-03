# 코드 리뷰 메모 (2025-02-07)

## 개요
- 기준 브랜치: `main` @ 11316c4 (확인 시점)
- 주요 변경 사항: 다중 작업 항목 지원, ConfirmModal 도입, 공통 API 핸들러, JSON 파싱 에러 처리 등
- 점검 방법: 마법사 단계/계약 로직 정적 분석, API 라우트 오류 처리 확인, `npm test` 결과 검토

## 긍정적 관찰
- Step02/Step05의 `WorkItem` 흐름이 안정적으로 작동하며 항목 합계 → 금액 경고까지 연동됩니다.
- `withApiHandler` + JSON 파싱 예외 처리 덕분에 API 에러 응답이 명확해졌습니다.
- ConfirmModal 도입으로 접근성이 개선되고, 테스트 커버리지도 12 suites/135 tests로 유지되고 있습니다.

## 개선 포인트
1. **코칭 메시지가 최신 입력을 인지하지 못함 (마감일)**  
   - 위치: `app/components/wizard/steps/Step04Timeline.tsx:75-104`  
   - 문제: 마감일을 입력 후 바로 blur 하면 `handleDeadlineBlur`가 아직 업데이트되지 않은 `deadline` prop을 참조하여 코칭 메시지를 띄우지 못합니다.  
   - 제안: `deadlineInput` 값 또는 `new Date(value)`를 기반으로 코칭을 트리거하거나, `onUpdate` 내부에서 코칭 로직을 실행해 최신 값에 접근하세요.

2. **코칭 메시지가 최신 입력을 인지하지 못함 (금액)**  
   - 위치: `app/components/wizard/steps/Step05Payment.tsx:75-97`  
   - 문제: 금액 입력 후 blur 하면 `amount` prop이 아직 이전 값이어서 코칭 메시지가 호출되지 않습니다.  
   - 제안: `handleAmountBlur`에서 `amountInput`을 숫자로 변환해 사용하거나, `handleAmountChange`에서 코칭 로직을 실행해 최신 값 기준으로 안내하세요.

3. **위험 감지 합계 차이 경고**  
   - 위치: `lib/contract/risk-detector.ts:69-104`  
   - 문제: `itemsTotal`은 이제 0원을 포함하지만, `work_items_amount_mismatch` 경고는 총액과 항목 합계의 상대 차이를 기준으로 합니다. 총액이 0원이고 항목 합계가 0이 아닌 경우만 경고가 나와, 총액 변경을 잊었을 때 즉시 인지하기 어렵습니다.  
   - 제안: `Math.abs(amount - itemsTotal) >= 1000` 같은 절대 차이 기준을 추가하거나, 0/0 케이스를 별도로 처리해 사용자가 총액을 재확인하도록 유도하세요.

## 테스트
- `npm test` (12 suites, 135 tests) 성공.

---
추가적으로 확인하고 싶은 영역이 있으면 알려주세요.
