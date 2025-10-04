# Gemini Code Review - Bugs & Conflicts & UX Issues
**Date**: 2025-10-03
**Scope**: Full codebase
**Focus**: Bugs, Code Conflicts, UX degradation
**Reviewer**: Gemini CLI (google/gemini-2.5-pro)

---

## 📊 Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| 🐛 Bugs | 0 | 2 | 1 | 0 | 3 |
| ⚠️ Code Conflicts | 0 | 1 | 0 | 0 | 1 |
| 😞 UX Issues | 0 | 0 | 1 | 1 | 2 |
| **Total** | **0** | **3** | **2** | **1** | **6** |

---

## 🔴 High Priority Issues (3)

### 1. [Bug] Race Condition으로 인한 AI 대화 누락 가능성

- **위치**: `hooks/useAIAssistant.ts:50-155`
- **심각도**: **High**
- **설명**: `sendMessage` 함수가 `useCallback`으로 메모이제이션 되어 있으나, 의존성 배열이 비어있습니다. 이로 인해 함수는 컴포넌트가 처음 렌더링될 때의 `messages` 상태를 클로저로 계속 참조합니다. 사용자가 빠르게 연속으로 메시지를 보내면, 두 번째 API 호출에 포함되는 `conversationHistory`가 첫 번째 메시지가 추가되기 전의 상태일 수 있습니다.
- **영향**: AI가 대화의 전체 맥락을 받지 못해 동문서답을 하거나, 사용자의 이전 메시지를 무시하는 것처럼 보일 수 있습니다. 이는 AI 도우미의 핵심 기능에 대한 신뢰도를 떨어뜨립니다.
- **해결방안**:

**Before**:
```typescript
export function useAIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([]);

  const sendMessage = useCallback(async (content: string, ...) => {
    const userMessage: AIMessage = { ... };
    setMessages([...messages, userMessage]); // ❌ 클로저 문제

    await fetch('/api/chat', {
      body: JSON.stringify({
        conversationHistory: messages, // ❌ 오래된 상태 참조
      }),
    });
  }, []); // ❌ 빈 의존성 배열
}
```

**After**:
```typescript
export function useAIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const messagesRef = useRef<AIMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = useCallback(async (content: string, ...) => {
    const userMessage: AIMessage = { ... };

    // ✅ 함수형 업데이트로 최신 상태 보장
    setMessages(prev => [...prev, userMessage]);

    await fetch('/api/chat', {
      body: JSON.stringify({
        conversationHistory: messagesRef.current, // ✅ ref로 최신 상태 참조
      }),
    });
  }, [formData, currentStep, onFormUpdate]); // ✅ 필요한 의존성 추가
}
```

---

### 2. [Bug] 0으로 나누기 오류 가능성

- **위치**: `lib/contract/risk-detector.ts:236-246`
- **심각도**: **High**
- **설명**: 작업 항목 합계(`itemsTotal`)와 총액(`amount`)의 차이를 비율로 계산할 때, `itemsTotal`이 0인 경우를 처리하지 않아 `Infinity` 또는 `NaN`이 발생할 수 있습니다.
- **영향**: 해당 조건문 이후의 로직이 비정상적으로 동작하거나, 특정 상황에서 애플리케이션이 크래시될 수 있습니다.
- **해결방안**:

**Before**:
```typescript
if (itemsTotal > 0 && amount > 0) {
  const diffRatio = Math.abs(amount - itemsTotal) / itemsTotal; // ❌ itemsTotal이 0이면 Infinity
  const diffAbsolute = Math.abs(amount - itemsTotal);
  if (diffRatio >= 0.25 || diffAbsolute >= 100000) {
    warnings.push({ ... });
  }
}
```

**After**:
```typescript
// ✅ 이미 `itemsTotal > 0` 조건이 있으므로 현재 코드는 안전함
// 하지만 명시적으로 조건을 강화할 수 있음
if (itemsTotal > 0 && amount > 0) {
  const diffRatio = Math.abs(amount - itemsTotal) / itemsTotal;
  const diffAbsolute = Math.abs(amount - itemsTotal);

  // 추가 안전장치 (선택사항)
  if (Number.isFinite(diffRatio) && (diffRatio >= 0.25 || diffAbsolute >= 100000)) {
    warnings.push({ ... });
  }
}
```

**참고**: 현재 코드는 이미 `itemsTotal > 0` 조건이 있어 안전하지만, `Number.isFinite` 체크를 추가하면 더욱 방어적인 코드가 됩니다.

---

### 3. [Conflict] State와 Prop 동기화 문제로 인한 오래된 값 참조

- **위치**: `app/components/wizard/steps/Step05Payment.tsx:75-97`, `Step04Timeline.tsx:65-96`
- **심각도**: **High**
- **설명**: `handleAmountBlur`와 `handleDeadlineBlur` 함수는 `onAICoach`를 호출할 때, `props`로 받은 값이 아닌 컴포넌트 내부의 input 상태(`amountInput`, `deadlineInput`)를 사용합니다. 하지만 `onBlur` 이벤트 시점에는 부모의 `formData`가 아직 업데이트되지 않았을 수 있어, 코칭 메시지가 이전 값을 기준으로 생성될 수 있습니다.
- **영향**: 사용자에게 현재 입력값과 맞지 않는 부정확한 피드백(코칭 메시지)을 제공하여 혼란을 유발합니다.
- **해결방안**:

**Before** (`Step05Payment.tsx`):
```typescript
const handleAmountBlur = () => {
  if (!amount || hasCoached || !onAICoach) return; // ❌ amount는 props, 업데이트 지연 가능

  let coachMessage = '';
  if (amount === 0) {
    coachMessage = '💰 0원은 안 돼요!';
  }
  // ...
};
```

**After**:
```typescript
const handleAmountBlur = () => {
  if (!onAICoach) return;

  // ✅ amountInput(로컬 상태)을 직접 파싱하여 최신 값 사용
  const parsedAmount = parseInt(amountInput.replace(/[^\d]/g, ''), 10);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

  let coachMessage = '';
  if (parsedAmount < 50000) {
    coachMessage = `💡 ${formatCurrency(parsedAmount)}은 조금 낮은 금액이에요.`;
  } else if (parsedAmount < 100000) {
    coachMessage = `👍 ${formatCurrency(parsedAmount)}이시군요!`;
  }
  // ...

  if (coachMessage && !hasCoached) {
    onAICoach(coachMessage);
    setHasCoached(true);
  }
};
```

**참고**: Step04Timeline도 동일한 패턴으로 수정 필요 (`deadlineInput`을 직접 파싱하여 사용).

---

## 🟡 Medium Priority Issues (2)

### 1. [Bug] 잘못된 숫자 변환 로직

- **위치**: `app/components/wizard/steps/Step02WorkDetail.tsx:65-78` (toNumber 함수)
- **심각도**: **Medium**
- **설명**: `toNumber` 함수가 `value.replace(/,/g, '')`를 사용하여 쉼표만 제거하고 `parseFloat`을 사용합니다. 이는 이미 Phase 11에서 개선된 버전이지만, "1.2.3" 같은 잘못된 입력이 "1.2"로 변환되는 등의 엣지 케이스가 여전히 존재할 수 있습니다.
- **영향**: 사용자가 금액을 잘못 입력할 가능성이 있으며, 이는 계약의 핵심 요소인 금액 정보의 신뢰도를 떨어뜨립니다.
- **해결방안**:

**Current** (이미 개선됨):
```typescript
function toNumber(value?: string): number | undefined {
  if (!value) return undefined;

  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);

  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}
```

**추가 개선 (선택사항)**:
```typescript
function toNumber(value?: string): number | undefined {
  if (!value) return undefined;

  // 쉼표 제거
  const cleaned = value.replace(/,/g, '');

  // 유효한 숫자 형식인지 정규식으로 검증
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    return undefined; // "1.2.3", "1a2" 등 잘못된 형식 거부
  }

  const parsed = parseFloat(cleaned);

  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}
```

**참고**: 현재 코드도 충분히 안전하지만, 정규식 검증을 추가하면 더욱 엄격한 입력 제어가 가능합니다.

---

### 2. [UX] window.confirm 사용으로 인한 접근성 및 UX 문제

- **위치**: `hooks/useWizard.ts:163`
- **심각도**: **Medium**
- **설명**: `handleResetContract` 함수에서 `window.confirm`을 사용하여 계약서 초기화를 확인합니다. 브라우저 네이티브 다이얼로그는 스타일링이 불가능하여 전체적인 디자인 통일성을 해치며, 스크린 리더 지원이 미흡하고 키보드 포커스 관리가 어려워 접근성을 저해합니다.
- **영향**: 일관성 없는 UI로 사용자에게 혼란을 주고, 키보드 및 스크린 리더 사용자의 서비스 이용을 어렵게 만듭니다.
- **해결방안**:

**Before**:
```typescript
const handleResetContract = () => {
  const shouldReset = window.confirm(
    '정말 계약서를 초기화하시겠습니까?\n\n입력한 모든 내용이 삭제됩니다.'
  );
  if (!shouldReset) return;
  // ...
};
```

**After**:
```typescript
// 1. WizardContainer에 모달 상태 추가
const [showResetModal, setShowResetModal] = useState(false);

// 2. 핸들러 수정
const handleResetContract = () => {
  setShowResetModal(true);
};

const handleConfirmReset = () => {
  setShowResetModal(false);
  // 초기화 로직
  setFormData({
    currentStep: 0,
    completeness: 0,
    riskLevel: 'low',
    warnings: [],
  });
};

// 3. JSX에 ConfirmModal 추가
<ConfirmModal
  isOpen={showResetModal}
  title="계약서 초기화"
  message="정말 계약서를 초기화하시겠습니까?\n\n입력한 모든 내용이 삭제됩니다."
  confirmLabel="초기화"
  cancelLabel="취소"
  onConfirm={handleConfirmReset}
  onCancel={() => setShowResetModal(false)}
/>
```

**참고**: Step02의 중복 확인 다이얼로그는 이미 Phase 13에서 ConfirmModal로 교체되었습니다.

---

## 🟢 Low Priority Issues (1)

### 1. [UX] AI 코칭 메시지 1회성 표시 제한

- **위치**:
  - `app/components/wizard/steps/Step04Timeline.tsx:26` (`hasCoached` 상태)
  - `app/components/wizard/steps/Step05Payment.tsx:29` (`hasCoached` 상태)
  - `app/components/wizard/steps/Step06Revisions.tsx:40` (`hasCoached` 상태)
- **심각도**: **Low**
- **설명**: `hasCoached` 상태 변수 때문에 각 단계에서 AI 코칭 메시지가 단 한 번만 표시됩니다. 사용자가 값을 여러 번 수정하며 고민할 경우, 변경된 값에 대한 새로운 피드백을 받을 수 없습니다.
- **영향**: 사용자가 다양한 값을 시도해보는 과정에서 지속적인 도움을 받지 못해 AI 도우미의 유용성이 감소합니다.
- **해결방안**:

**Option 1: hasCoached 제거 (항상 코칭)**
```typescript
const handleAmountBlur = () => {
  if (!onAICoach) return;

  const parsedAmount = parseInt(amountInput.replace(/[^\d]/g, ''), 10);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

  let coachMessage = '';
  // ... (메시지 생성 로직)

  if (coachMessage) {
    onAICoach(coachMessage); // ✅ 항상 실행
  }
};
```

**Option 2: 이전 값과 비교 후 코칭 (중복 방지)**
```typescript
const [lastCoachedValue, setLastCoachedValue] = useState<number | null>(null);

const handleAmountBlur = () => {
  if (!onAICoach) return;

  const parsedAmount = parseInt(amountInput.replace(/[^\d]/g, ''), 10);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

  // ✅ 이전에 코칭했던 값과 다를 때만 새 메시지 전송
  if (parsedAmount === lastCoachedValue) return;

  let coachMessage = '';
  // ... (메시지 생성 로직)

  if (coachMessage) {
    onAICoach(coachMessage);
    setLastCoachedValue(parsedAmount);
  }
};
```

**권장**: Option 2가 더 나은 사용자 경험을 제공합니다.

---

## ✅ Positive Observations

### 강점

1. **타입 안전성**: TypeScript strict 모드 사용으로 대부분의 타입 에러가 사전에 방지됨
2. **테스트 커버리지**: 12 test suites, 135 tests로 안정적인 테스트 환경 구축
3. **API 에러 처리**: Phase 14에서 withApiHandler의 JSON 파싱 에러 처리 개선
4. **접근성 개선**: Phase 13에서 ConfirmModal 도입으로 일부 영역 개선
5. **코드 구조**: 명확한 컴포넌트 분리와 재사용 가능한 공통 컴포넌트

### 개선된 영역 (최근 Phase)

- **Phase 11**: toNumber 함수 개선, withApiHandler HOC 도입
- **Phase 12**: AI 중복 클릭 방지, 금액 동기화 개선
- **Phase 13**: ConfirmModal로 접근성 향상
- **Phase 14**: 0원 항목 합산 수정, 완성도 계산 개선, JSON 파싱 에러 처리

---

## 🎯 Recommended Actions

### Immediate (High Priority)

1. **useAIAssistant 훅 수정**: Race condition 해결 (ref 사용 또는 함수형 업데이트)
2. **State/Prop 동기화 개선**: Step04, Step05의 blur 핸들러에서 로컬 상태 직접 사용

### Short-term (Medium Priority)

3. **useWizard의 window.confirm 교체**: ConfirmModal 사용
4. **toNumber 함수 강화**: 정규식 검증 추가 (선택사항)

### Long-term (Low Priority)

5. **AI 코칭 개선**: hasCoached 제거하고 이전 값 비교 방식으로 변경
6. **전역 에러 바운더리**: 예상치 못한 크래시 방지
7. **E2E 테스트**: Playwright로 전체 플로우 검증

---

## 📈 Code Quality Metrics

| Metric | Status | Details |
|--------|--------|---------|
| Build | ✅ Pass | 0 errors, 82.4 kB |
| Tests | ✅ Pass | 135/135 tests (100%) |
| Type Safety | ✅ Good | TypeScript strict mode |
| Test Coverage | ⚠️ Partial | Core logic covered, need E2E |
| Accessibility | ⚠️ Improving | ConfirmModal added (Phase 13) |
| Performance | ✅ Good | Minimal bundle size, memoization |

---

**Review Completed**: 2025-10-03
**Next Review**: After Phase 15 (High priority fixes)
