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
1. **Risk Detector 총액 합산 조건**  
   - 위치: `lib/contract/risk-detector.ts:22-44, 69-84`  
   - 문제: 완성도 가중치는 workItems 유무를 반영하지만, `itemsTotal` 계산은 여전히 `subtotal ? ...` 조건을 사용해 0원 항목을 누락합니다. Step05에서 0원 항목을 허용했으므로 동일하게 `subtotal !== undefined` 비교로 수정해야 일관성이 맞습니다.  
   - 제안: `subtotal !== undefined ? sum + subtotal : sum`으로 변경하고, 필요 시 0원 항목에 대한 별도 경고를 추가하세요.

2. **API 타입 안전성 부족**  
   - 위치: `types/api.ts:29`  
   - 문제: `ChatRequest.context.formData`가 `any`로 선언돼 있어, 새로운 필드가 추가될 때 타입 안전성이 떨어집니다.  
   - 제안: `ContractFormData` 또는 최소한 필요한 필드만 포함한 타입으로 변경해 런타임 오류를 줄이세요.

3. **withApiHandler JSON 에러 감지 조건**  
   - 위치: `lib/api/withApiHandler.ts:34-59`  
   - 문제: 단순히 메시지에 'JSON' 문자열이 포함되는지 여부로 판단합니다. 일부 런타임은 다른 메시지를 반환할 수 있어 누락 가능성이 있습니다.  
   - 제안: `SyntaxError`뿐 아니라 `TypeError` 케이스 등도 포괄적으로 핸들링하거나, 핸들러에서 직접 400을 반환하도록 구성해 정확도를 높여주세요.

## 테스트
- `npm test` (12 suites, 135 tests) 성공.

---
추가적으로 확인하고 싶은 영역이 있으면 알려주세요.
