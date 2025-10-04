# 코드 리뷰 (2025-02-07) – 버그/UX 페인 포인트 집중 점검

## 개요
- 브랜치: `main` @ 3541df1
- 살펴본 영역: Step04/Step05 코칭, 다중 작업 항목 경고, 위험 감지, API 핸들러/타입, 관련 테스트
- 확인 방식: 코드 정독 + `npm test` 실행 + 잠재 시나리오 점검

## 발견 사항
### 1. Step05 코칭 플래그 로직
- 위치: `app/components/wizard/steps/Step05Payment.tsx`
- 현재 `hasCoached` 초기값이 `false`이고, 블러 시 `coachMessage`가 있을 때만 `true`로 바꾸도록 되어 있습니다. 무료/0원 입력은 그대로 skip되는데 이는 의도된 동작입니다. 다만 사용자가 입력→코칭 수신 후 금액을 변경하면 `hasCoached`가 이미 `true`여서 추가 안내가 나오지 않습니다.
- **권장:** 금액 범위가 크게 변한 경우에 한해 `hasCoached`를 리셋하거나, 금액이 변화할 때마다 새 안내가 필요하면 조건을 재조정하십시오.

### 2. Step04 코칭 타이밍은 개선됨
- `deadlineInput` 기준으로 계산하도록 수정되어 신규 입력도 인식합니다. 추가 조치 필요 없음.

### 3. 위험 감지 – 0원 항목 처리
- `lib/contract/risk-detector.ts`가 0원을 합계에 포함하도록 수정되어 총액 비교가 정상 동작합니다. 테스트(`__tests__/lib/contract/risk-detector.test.ts`)도 추가되어 신뢰성 확보.

### 4. 위험 감지 – 금액 불일치 경고 임계값
- 절대/비율 기준(25% 또는 10만 원)으로 경고를 띄우도록 개선되었습니다. 실무에서도 유효한 수준.

### 5. API 핸들러/타입
- `withApiHandler`가 `SyntaxError`, `TypeError`를 400으로 매핑하고 전체 API가 이를 사용합니다.
- `types/api.ts`에서 `ChatRequest.context.formData`가 `ContractFormData`로 강화되어 타입 안전성이 개선되었습니다.

### 6. Step05 0원 처리 UX
- 금액이 0이거나 비어 있으면 코칭이 나오지 않지만, 위험 감지에서 `no_payment` 경고를 던지므로 UX 측면에서 수용 가능. 필요 시 위 Step05 개선안을 참고.

## 테스트
- `npm test` (12 suites, 137 tests) 성공.

---
추가 의뢰 시 더 깊은 영역(예: AI 오류 복구, ConfirmModal UX 등)도 점검할 수 있습니다.
