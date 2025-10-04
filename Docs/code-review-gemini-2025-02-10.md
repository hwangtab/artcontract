# Gemini CLI 종합 코드 리뷰
**날짜:** 2025-02-10
**검토자:** Gemini 2.0 Flash (via Claude Code)
**범위:** 버그, UX 문제, 엣지 케이스에 중점을 둔 전체 코드베이스 리뷰

---

## 요약

이 종합 코드 리뷰는 ArtContract 코드베이스의 4개 주요 섹션에 대해 Gemini CLI를 사용하여 수행되었습니다. 총 **23개의 이슈**를 발견했으며, High 심각도 버그부터 Low 우선순위 개선사항까지 다양합니다.

### 심각도별 이슈 분류

| 심각도 | 개수 | 카테고리 |
|----------|-------|-----------|
| **High** | 5 | 상태 손실, 타임존 버그, 속도 제한, 저작권 기본값, 결제 로직 |
| **Medium** | 5 | 계약서 생성 로직, 상태 패턴, API 검증, 위저드 초기화 |
| **Low** | 13 | UX 개선, 코드 품질, 효율성 최적화 |

### 중요 발견사항

1. **네비게이션 시 상태 손실** (2개 컴포넌트)
2. **기본 계약서의 위험한 저작권 기본값**
3. **결함있는 결제 위험 감지** (0원 계약 감지 안됨)
4. **날짜 처리의 타임존 버그**
5. **분산 환경에서 비효율적인 속도 제한**

---

## 섹션 1: 위저드 컴포넌트

### HIGH 심각도

#### 1.1 비제어 단계에서 상태 손실
- **파일:** `Step06bCopyright.tsx`, `Step08Protection.tsx`
- **문제:** 폼 입력에 로컬 상태 사용; 사용자가 "적용" 클릭 없이 이동하면 모든 변경사항 손실
- **영향:** 데이터 손실 및 다른 단계와 일관성 없는 나쁜 UX
- **수정:**
  1. 폼 데이터용 모든 로컬 `useState` 훅 제거
  2. props를 통해 값 받기
  3. 모든 입력 변경 시 `onUpdate` 호출
  4. "적용" 버튼 제거

#### 1.2 잘못된 날짜 처리 (타임존 버그)
- **파일:** `Step04Timeline.tsx` (53, 62행), `Step06bCopyright.tsx` (230, 238행)
- **문제:** `new Date('YYYY-MM-DD')`가 문자열을 UTC로 취급하여 일부 타임존에서 하루 차이 발생
- **영향:** 특정 타임존 사용자에게 잘못된 날짜 저장/표시
- **수정:**
```typescript
// 수정 전
new Date(value)

// 수정 후
new Date(value + 'T00:00:00')  // 로컬 타임존 강제 해석
```

### MEDIUM 심각도

#### 1.3 계약서 생성 활성화 로직 결함
- **파일:** `Step08FinalCheck.tsx` (211행)
- **문제:** 완료된 항목 개수(`completedItems < 4`)로 버튼 활성화, 특정 필수 필드가 아님
- **영향:** 사용자가 필수 필드를 건너뛰고 선택 필드 4개만 채워도 버튼 활성화 가능
- **수정:**
```typescript
const requiredFieldsMet =
  !!formData.field &&
  !!(formData.workType || formData.workDescription) &&
  !!formData.clientType &&
  !!formData.payment?.amount;

<Button
  disabled={!requiredFieldsMet}
>
  {requiredFieldsMet ? '🎉 계약서 만들기' : '필수 항목을 모두 입력하세요'}
</Button>
```

#### 1.4 비효율적이고 버그 있는 상태 업데이트
- **파일:** `Step00ArtistInfo.tsx` (40, 48, 60, 68행), `Step03ClientType.tsx` (60, 91, 98행)
- **문제:** 변경된 값만이 아닌 모든 props의 전체 객체로 `onUpdate` 호출
- **영향:** 비효율적이고 오래된 상태 버그 유발 가능
- **수정:**
```typescript
// 수정 전
<Input onChange={(value) =>
  onUpdate({ artistName: value, artistContact, artistIdNumber, artistAddress })
} />

// 수정 후
<Input onChange={(value) => onUpdate({ artistName: value })} />
```

### LOW 심각도

#### 1.5 첫 단계에서 "뒤로" 버튼의 혼란스러운 UX
- **파일:** `WizardContainer.tsx` (311행)
- **문제:** 뒤로 버튼의 `onClick={() => prevStep(handleRequestReset)}`이 첫 단계에서 초기화 모달 트리거 암시
- **영향:** 비표준 UX; 초기화는 명시적 액션이어야 함
- **수정:**
```typescript
// 수정 전
onClick={() => prevStep(handleRequestReset)}

// 수정 후
onClick={prevStep}
```

#### 1.6 커스텀 입력 선택 시 시각적 결함
- **파일:** `Step06Revisions.tsx` (100행)
- **문제:** 사용자가 프리셋과 일치하는 숫자(예: "3") 입력 시 커스텀 입력 카드와 프리셋 카드 둘 다 선택됨으로 표시
- **영향:** 혼란스러운 시각적 상태
- **수정:**
```typescript
<Card
  selected={revisions === option.value && !showCustomInput}
  onClick={() => handlePresetSelect(option.value)}
/>
```

#### 1.7 서브 필드의 복잡한 상태 로직
- **파일:** `Step01FieldSelection.tsx`
- **문제:** "기타" 버튼이 `onSubFieldChange?.('')` 호출하여 부모 상태 초기화, 커스텀 입력이 나타나지 않음
- **영향:** 커스텀 서브 필드 기능 버그
- **수정:**
1. `const [isCustomActive, setCustomActive] = useState(false)` 추가
2. 프리셋 클릭: `onSubFieldChange?.(value); setCustomActive(false)`
3. "기타" 클릭: `onSubFieldChange?.(''); setCustomActive(true)`
4. `isCustomActive`일 때만 입력 표시

---

## 섹션 2: AI 통합

### HIGH 심각도

#### 2.1 프로액티브 알림 중복 제거 결함
- **파일:** `useAIAssistant.ts` (184행), `useProactiveAlerts.ts` (24행)
- **문제:** `useProactiveAlerts`가 고유 ID 생성하지만 `addProactiveMessage`가 이를 무시하고 메시지 내용으로 중복 제거
- **영향:** 두 알림의 텍스트가 같으면 경고 누락 가능
- **수정:**

**`useAIAssistant.ts`에서:**
```typescript
const addProactiveMessage = useCallback((content: string, severity: 'info' | 'warning' | 'danger', id?: string) => {
  const key = id || `proactive_${content}`;
  if (addedMessageIds.current.has(key)) return;

  const message: AIMessage = {
    id: id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_proactive`,
    role: 'assistant',
    content,
    timestamp: new Date(),
    type: 'proactive',
    metadata: { sourceType: 'ai' },
  };

  addedMessageIds.current.add(key);
  setMessages((prev) => [...prev, message]);
  setIsOpen(true);
}, []);
```

**`useProactiveAlerts.ts`에서:**
```typescript
// shownWarningsRef 제거
const registerWarning = useCallback(
  (id: string, message: string, severity: ProactiveSeverity) => {
    addProactiveMessage(message, severity, id);  // ID 전달
  },
  [addProactiveAlerts]
);
```

### MEDIUM 심각도

#### 2.2 채팅 API의 무제한 히스토리 위험
- **파일:** `app/api/chat/route.ts` (52행)
- **문제:** 클라이언트로부터 `conversationHistory` 길이 검증 없음
- **영향:** 악의적 사용자가 거대 배열 전송 → 과도한 AI 토큰 사용, 비용 증가, 성능 저하
- **수정:**
```typescript
const RECENT_HISTORY_LIMIT = 20;
const recentHistory = context.conversationHistory.slice(-RECENT_HISTORY_LIMIT);

const aiContext: AIContext = {
  // ...
  conversationHistory: recentHistory.map((msg: ChatMessage) => ({
    id: msg.id || `msg_${Date.now()}`,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp || Date.now()),
  })),
};
```

#### 2.3 `useAIAssistant`의 취약한 상태 패턴
- **파일:** `hooks/useAIAssistant.ts` (81-95행)
- **문제:** `setMessages` 업데이터 내 사이드 이펙트로 API 호출용 히스토리 획득
- **영향:** 암묵적 React 실행 순서 의존, concurrent 기능에서 깨질 수 있음
- **수정:**
```typescript
export function useAIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const sendMessage = useCallback(async (content: string, ...) => {
    const userMessage: AIMessage = { /* ... */ };
    const conversationHistory = [...messagesRef.current, userMessage];

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        body: JSON.stringify({
          message: content,
          context: { currentStep, formData, conversationHistory },
        }),
      });
    } finally {
      // ...
    }
  }, []);
}
```

### LOW 심각도

#### 2.4 `useProactiveAlerts`의 비효율적 `useEffect`
- **파일:** `hooks/useProactiveAlerts.ts` (68행)
- **문제:** 전체 `formData`에 의존하는 단일 `useEffect`, 모든 키 입력마다 전체 검사 재실행
- **영향:** 성능 비효율
- **수정:** 여러 개의 집중된 useEffect로 분할:
```typescript
// formData에 의존하는 하나의 큰 useEffect 대신
useEffect(() => {
  const amount = formData.payment?.amount;
  if (currentStep >= 5 && amount !== undefined) {
    // 결제 검사만
  }
}, [currentStep, formData.payment?.amount, registerWarning]);

useEffect(() => {
  const revisions = formData.revisions;
  if (currentStep >= 6 && revisions !== undefined) {
    // 수정 횟수 검사만
  }
}, [currentStep, formData.revisions, registerWarning]);
```

#### 2.5 일관성 없는 속도 제한 구현
- **파일:** `app/api/templates/route.ts` (258-283행)
- **문제:** 핸들러에 직접 속도 제한 구현, 다른 라우트는 `withApiHandler` HOC 사용
- **영향:** 코드 불일치, 유지보수 어려움
- **수정:**
```typescript
import { withApiHandler } from '@/lib/api/withApiHandler';

async function handler(request: NextRequest) {
  try {
    // 원본 try 블록 로직
  } catch (error) {
    // 원본 catch 블록 로직
  }
}

export const GET = withApiHandler(handler, { rateLimiter: generalRateLimiter });
```

#### 2.6 채팅 API의 하드코딩된 `incompletedFields`
- **파일:** `app/api/chat/route.ts` (50행)
- **문제:** `incompletedFields`가 `[]`로 하드코딩됨
- **영향:** AI가 컨텍스트 인식 조언을 제공할 기회 놓침
- **권장사항:** 클라이언트가 누락된 필수 필드 계산하여 요청에 포함해야 함

#### 2.7 고유하지 않은 메시지 ID 가능성
- **파일:** `app/api/chat/route.ts` (53행)
- **문제:** 폴백 ID `msg_${Date.now()}`가 같은 밀리초에 여러 메시지 시 중복 생성 가능
- **수정:**
```typescript
conversationHistory: context.conversationHistory.map((msg: ChatMessage) => ({
  id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  // ...
})),
```

---

## 섹션 3: 핵심 훅 & 유틸리티

### HIGH 심각도

#### 3.1 아키텍처 이슈: 분산 환경에서 비효율적인 속도 제한
- **파일:** `lib/utils/rate-limiter.ts` (15행)
- **문제:** `lru-cache`(인메모리) 사용으로 각 서버 인스턴스가 별도 속도 제한 상태 보유
- **영향:** Vercel의 분산 환경에서 사용자가 다른 인스턴스 접속으로 제한 우회 가능
- **수정:** 중앙화된 분산 캐시로 교체:
  - **Vercel KV (Redis)** 또는 **Upstash**
  - 모든 인스턴스가 동일한 요청 카운터 공유 보장

### MEDIUM 심각도

#### 3.2 버그: AI 채팅의 안전하지 않은 상태 처리
- **파일:** `hooks/useAIAssistant.ts` (56-60, 80행)
- **문제:** `setMessages`의 사이드 이펙트로 업데이트된 변수로 대화 히스토리 획득
- **영향:** 상태 업데이트는 비동기; fetch 전 사이드 이펙트 실행 보장 없음
- **수정:** (2.3과 동일 - `useRef` 패턴 사용)

#### 3.3 버그: 잘못된 통화 파싱
- **파일:** `lib/utils/currency-format.ts` (8행)
- **문제:** `parseCurrency`가 `.replace(/[^\d]/g, '')`로 모든 비숫자 제거, 소수점 숫자 깨짐
- **영향:** `"1,234.56"`이 `1234.56` 대신 `123456`으로 파싱됨
- **수정:**
```typescript
export function parseCurrency(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, '');

  if ((cleaned.match(/\./g) || []).length > 1) {
    return null;
  }

  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}
```

#### 3.4 버그: 혼란스럽고 안전하지 않은 위저드 초기화 로직
- **파일:** `hooks/useWizard.ts` (153, 198행)
- **문제:** 두 개의 초기화 함수(`reset`과 `resetContract`)가 다른 동작
  - `reset`: Step 1로 점프, `canGoNext: true` 하드코딩 (유효하지 않음)
  - `resetContract`: Step 0으로 올바르게 초기화
- **수정:**
```typescript
// 버그 있는 `reset` 함수 완전 제거

// resetContract를 reset으로 이름 변경
const reset = useCallback(() => {
  setState({
    currentStep: 0,
    formData: initialFormData,
    isComplete: false,
    canGoNext: false,
    canGoPrev: false,
    completeness: 0,
    visitedSteps: [0],
  });
}, []);

return {
  // ...
  reset,  // 단일하고 올바른 reset 함수 내보내기
};
```

### LOW 심각도

#### 3.5 버그: 부정확한 마감일 계산
- **파일:** `hooks/useProactiveAlerts.ts` (120행)
- **문제:** 날짜 간 정확한 시간 차이로 일수 계산
- **영향:** 하루 차이 오류 (예: "오늘 오후 10시"일 때 "내일 오전 9시"가 0일로 표시)
- **수정:**
```typescript
if (currentStep >= 4 && formData.timeline?.deadline) {
  const deadline = new Date(formData.timeline.deadline);
  const today = new Date();

  // 자정으로 정규화
  const deadlineDateOnly = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const daysUntilDeadline = (deadlineDateOnly.getTime() - todayDateOnly.getTime()) / (1000 * 60 * 60 * 24);

  if (daysUntilDeadline <= 1) {
    // 이제 오늘/내일 올바르게 식별
  }
}
```

#### 3.6 코드 품질: 취약한 FAQ 키워드 매칭
- **파일:** `lib/ai-assistant/faq-database.ts` (217행)
- **문제:** `string.includes()`가 단어 내 부분 문자열 매칭 (예: "수"가 "수정" 매칭)
- **영향:** FAQ 오매칭
- **수정:**
```typescript
export function getFAQResponse(userMessage: string, currentStep?: number): FAQItem | null {
  const lowerMessage = userMessage.toLowerCase();
  const createWordRegex = (word: string) => new RegExp(`\\b${word}\\b`, 'i');

  for (const faq of faqDatabase) {
    for (const question of faq.question) {
      if (lowerMessage.includes(question.toLowerCase())) {
        return faq;
      }
    }

    for (const keyword of faq.keywords) {
      if (createWordRegex(keyword).test(lowerMessage)) {
        return faq;
      }
    }
  }

  return null;
}
```

---

## 섹션 4: 계약서 생성

### HIGH 심각도

#### 4.1 기본 계약서의 위험한 저작권 기본값
- **파일:** `lib/contract/generator.ts` (`generateArticle7_RightsAttribution` 내 ~323행)
- **문제:** 저작재산권 완전 양도(`저작재산권은 갑에게 양도한다`)가 기본값
- **영향:** 작가에게 매우 불리; 모르고 모든 권리 포기
- **수정:**
```typescript
// 수정 전: 권리 양도
content += `① 본 저작물의 저작재산권은 갑에게 양도한다.\n\n`;
content += `② **저작인격권은 을에게 유보되며 양도할 수 없다.**\n\n`;
content += `③ 사용 범위: **${scopeKor}**\n\n`;

// 수정 후: 이용 허락
content += `① 을은 갑이 본 저작물을 사용하는 것을 허락한다. (이용허락)\n\n`;
content += `② 사용 범위: **${scopeKor}**\n\n`;
content += `③ **저작인격권은 을에게 유보되며 양도할 수 없다.**\n\n`;
content += `④ 본 계약에서 명시적으로 허락되지 않은 모든 권리는 창작자 "을"에게 유보된다.\n\n`;
```

#### 4.2 결함있는 결제 로직으로 중요 위험 감지 누락
- **파일:** `lib/contract/risk-detector.ts` (212-235행)
- **문제:** amount 정의 시 `|| 0` 사용으로 누락된 금액과 `0` 구별 불가
- **영향:** "Zero Payment" 경고(`zero_payment`) 절대 트리거 안됨
- **수정:**
```typescript
// 수정 전
const amount = enhancedPay?.totalAmount || payment?.amount || 0;

// 수정 후
const amount = enhanced.enhancedPayment?.totalAmount ?? formData.payment?.amount;

// 검사 재구성
if (amount === undefined) {
  warnings.push({
    id: 'no_payment',
    severity: 'danger',
    message: '🚨 금액이 정해지지 않았습니다!',
    // ...
  });
} else if (amount === 0) {
  criticalErrors.push('금액은 0원일 수 없습니다!');
  warnings.push({
    id: 'zero_payment',
    severity: 'danger',
    message: '🚨 금액이 0원입니다!',
    // ...
  });
} else {
  // amount > 0 검사들
}
```

### MEDIUM 심각도

#### 4.3 저작권 위험 검사에서 잘못된 결제 금액 사용
- **파일:** `lib/contract/risk-detector.ts` (170, 184행)
- **문제:** "Full Transfer Low Price"와 "Perpetual Low Price"가 `formData.payment?.amount`만 검사, `enhancedPayment` 미확인
- **영향:** 사용자가 고급 결제 세부정보 입력 시 위험 누락
- **수정:**
```typescript
const amount = enhanced.enhancedPayment?.totalAmount ?? formData.payment?.amount;

if (enhanced.copyrightTerms) {
  if (
    enhanced.copyrightTerms.rightsType === 'full_transfer' &&
    (amount || 0) < 1000000
  ) {
    warnings.push({ id: 'full_transfer_low_price', /* ... */ });
  }

  if (
    enhanced.copyrightTerms.usagePeriod?.perpetual &&
    (amount || 0) < 500000
  ) {
    warnings.push({ id: 'perpetual_low_price', /* ... */ });
  }
}
```

### LOW 심각도

#### 4.4 일관성 없는 통화 포맷팅
- **파일:** `lib/contract/generator.ts` (`generateArticle6_Payment` 내 ~193행)
- **문제:** 고급 섹션에서 `toLocaleString()` 사용, 다른 곳에서 `formatCurrency` 사용
- **영향:** 최종 계약서에서 일관성 없는 포맷
- **수정:**
```typescript
// 수정 전
content += `   - **총 금액**: 금 ${total.toLocaleString()}원 정 (₩${total.toLocaleString()})\n\n`;

// 수정 후
content += `   - **총 금액**: ${formatCurrency(total)}\n\n`;

// 이 함수의 모든 통화 값에 적용
```

#### 4.5 기본 계약서 템플릿의 잠재적 포맷 깨짐
- **파일:** `lib/contract/generator.ts` (`replaceVariables` 내 ~510행)
- **문제:** `{work_type}`이 잠재적으로 여러 줄인 `workSummary`로 교체됨
- **영향:** 한 줄 템플릿 레이아웃 깨질 수 있음
- **수정:**
```typescript
// 수정 전
result = result.replace(/{work_type}/g, primaryWorkType || workSummary || '[작업 내용 미정]');

// 수정 후
result = result.replace(/{work_type}/g, primaryWorkType || '[작업 내용 미정]');
```

---

## 우선순위별 실행 계획

### Phase 1: 긴급 수정 (프로덕션 전 필수)
1. ✅ **4.1** - 저작권 기본값을 양도에서 이용허락으로 변경
2. ✅ **4.2** - 위험 감지기의 결제 로직 수정
3. ✅ **1.2** - 날짜 처리의 타임존 버그 수정
4. ✅ **1.1** - Step06b와 Step08의 상태 손실 수정
5. ✅ **3.1** - 분산 속도 제한 구현 (Vercel KV)

### Phase 2: 높은 영향 수정 (곧 수정해야 함)
6. ✅ **2.1** - 프로액티브 알림 중복 제거 수정
7. ✅ **1.3** - 계약서 생성 버튼 로직 수정
8. ✅ **3.4** - 위저드 초기화 로직 수정
9. ✅ **3.3** - 소수점용 통화 파싱 수정
10. ✅ **4.3** - 고급 결제용 저작권 위험 검사 수정

### Phase 3: 안정성 개선 (가능할 때 수정)
11. ✅ **2.2** - 대화 히스토리 제한 추가
12. ✅ **2.3/3.2** - useAIAssistant 상태 패턴 리팩토링
13. ✅ **1.4** - 위저드 단계의 상태 업데이트 최적화
14. ✅ **3.5** - 마감일 일수 계산 수정

### Phase 4: 품질 & 성능 (있으면 좋음)
15. ✅ **2.4** - useProactiveAlerts useEffect 분할
16. ✅ **2.5** - 속도 제한 패턴 통일
17. ✅ **1.5-1.7** - UX 개선 항목들
18. ✅ **2.6-2.7** - 사소한 API 개선
19. ✅ **3.6** - FAQ 키워드 매칭 개선
20. ✅ **4.4-4.5** - 계약서 포맷팅 일관성

---

## 테스트 권장사항

### 긴급 수정 후
1. 여러 타임존(UTC-12 ~ UTC+14)에서 날짜 입력 테스트
2. amount = 0, undefined, 다양한 양수 값으로 계약서 생성 테스트
3. "적용" 클릭 없이 Step06b/Step08 네비게이션 테스트
4. 생성된 기본 계약서의 저작권 조항 확인
5. 여러 동시 요청으로 속도 제한 테스트

### 모든 수정 후
1. 위저드 흐름 전체 회귀 테스트
2. AI 어시스턴트 대화 흐름 테스트
3. 모든 엣지 케이스로 계약서 생성
4. 크로스 브라우저 테스트 (Chrome, Safari, Firefox)
5. 모바일 반응형 확인

---

## 배포 후 모니터링 메트릭

1. **Rate Limiter Hit Rate**: 사용자가 제한에 걸리는 빈도 추적
2. **Contract Generation Success Rate**: 결제 로직 수정 후 증가해야 함
3. **Step Completion Rates**: 상태 수정 후 Step06b와 Step08 모니터링
4. **AI Response Quality**: 중복 제거 수정 후 사용자 만족도 추적
5. **Error Rates**: 모든 수정 후 크게 감소해야 함

---

## 요약

이 Gemini CLI 리뷰는 코드베이스 전체에서 **23개의 이슈**를 발견했으며, 데이터 손실, 잘못된 계약서, 보안 취약점을 일으킬 수 있는 **5개의 중요한 HIGH 심각도 버그**가 있습니다. 가장 중요한 발견은 작가가 충분히 이해하지 못한 채 모든 권리를 양도하는 위험한 저작권 기본값입니다.

**권장 우선순위:**
- 모든 HIGH 심각도 이슈 즉시 수정 (5개)
- 다음 스프린트에서 MEDIUM 심각도 이슈 처리 (5개)
- LOW 심각도 개선사항 점진적으로 일정 잡기 (13개)

**예상 소요 시간:**
- Phase 1 (긴급): 2-3일
- Phase 2 (높은 영향): 2-3일
- Phase 3 (안정성): 1-2일
- Phase 4 (품질): 1-2일
- **총계**: 모든 수정 약 1-2주

코드베이스는 전반적으로 잘 구조화되어 있지만, 이러한 수정사항들은 프로덕션 신뢰성과 사용자의 법적 안전을 위해 필수적입니다.
