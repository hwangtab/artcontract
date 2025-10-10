# Gemini CLI 전체 코드베이스 리뷰 (2025-10-10)

## 프로젝트 개요
- **ArtContract**: 예술가 계약서 자동 생성 웹앱
- **기술 스택**: Next.js 14, React 18, TypeScript, TailwindCSS
- **특징**: AI 기반 작업 분석 및 계약서 생성, 11단계 위저드 폼

## 종합 평가
전반적으로 매우 체계적이고 완성도 높은 코드베이스입니다. 특히:
- ✅ 커스텀 훅(`useWizard`, `useAIAssistant`)을 활용한 상태 관리
- ✅ `withApiHandler`를 통한 API 공통 로직 처리
- ✅ `ConfirmModal` 등 공유 컴포넌트의 높은 접근성 구현

---

## 🔴 HIGH (즉시 해결 권장)

### 1. 아키텍처: 서버리스 환경에서 동작하지 않는 Rate Limiter

**파일**: `lib/utils/rate-limiter.ts`

**문제점**:
- 현재 Rate Limiter는 각 서버리스 인스턴스의 메모리(LRU Cache)에 의존
- Vercel과 같은 서버리스 환경에서는 요청마다 다른 인스턴스가 실행될 수 있음
- 사용자가 다른 인스턴스에 접속하면 IP 기반 요청 제한을 쉽게 우회 가능
- **사실상 Rate Limiting이 동작하지 않음** → 악의적인 API 스팸/DoS 공격에 취약
- 불필요한 AI API 비용 발생 가능

**해결 방법**:
1. 모든 서버리스 인스턴스가 상태를 공유할 수 있도록 중앙화된 저장소로 마이그레이션
2. **Vercel KV** 또는 **Upstash (Redis)** 도입 (파일 내 주석에서 이미 제안됨)
3. `@vercel/kv` 패키지 설치 및 로직 재작성:

```typescript
// 예시: Vercel KV 사용
import { kv } from '@vercel/kv';

export async function rateLimit(identifier: string) {
  const key = `rate-limit:${identifier}`;
  const count = await kv.incr(key);

  if (count === 1) {
    await kv.expire(key, 60); // 60초 TTL
  }

  if (count > MAX_REQUESTS_PER_MINUTE) {
    return { success: false, limit: MAX_REQUESTS_PER_MINUTE };
  }

  return { success: true };
}
```

---

### 2. 아키텍처: WizardContainer의 과도한 책임 (God Component)

**파일**: `app/components/wizard/WizardContainer.tsx`

**문제점**:
- `WizardContainer`가 모든 마법사 단계를 `switch` 문으로 직접 렌더링
- 새로운 단계를 추가하거나 순서를 변경할 때마다 `WizardContainer` 코드를 직접 수정해야 함
- 경직된 구조 → OCP(개방-폐쇄 원칙) 위반
- 컴포넌트의 책임이 과도함

**해결 방법**:

1. **단계별 설정 배열 생성**:

```typescript
// wizardConfig.ts
import Step00ArtistInfo from './steps/Step00ArtistInfo';
import Step01FieldSelection from './steps/Step01FieldSelection';
// ... 다른 step 컴포넌트 import

export const wizardSteps = [
  {
    id: 0,
    component: Step00ArtistInfo,
    requiredFields: ['artistName', 'artistContact']
  },
  {
    id: 1,
    component: Step01FieldSelection,
    requiredFields: ['field']
  },
  // ... 모든 단계 추가
];
```

2. **동적 컴포넌트 렌더링**:

```tsx
// WizardContainer.tsx 내부
import { wizardSteps } from './wizardConfig';

const CurrentStepComponent = wizardSteps[currentStep]?.component;

// ... render 로직
<div className="bg-white ...">
  {CurrentStepComponent && <CurrentStepComponent {...props} />}
</div>
```

3. **효과**:
   - `WizardContainer`는 각 단계의 구체적인 내용을 알 필요가 없어짐
   - 단계 추가/삭제/변경이 설정 파일 수정만으로 가능
   - 유지보수성 크게 향상

---

## 🟡 MEDIUM (안정성 및 유지보수를 위해 개선 권장)

### 1. 상태 관리: 일부 컴포넌트의 복잡하고 비효율적인 상태 관리

**파일**:
- `app/components/wizard/steps/Step02WorkDetail.tsx`
- `app/components/wizard/steps/Step06bCopyright.tsx`

**문제점**:

**Step02WorkDetail**:
- `descriptionInput`, `items` 등 `useWizard`의 `formData`와 중복되는 로컬 상태(`useState`)가 많음
- 중앙 상태와 로컬 상태 간의 동기화 문제 발생 가능
- `useEffect`를 사용해 props를 state로 동기화하는 패턴은 예측하기 어려운 동작을 유발할 수 있음

**Step06bCopyright**:
- 반대로 로컬 상태 없이 모든 변경이 `onUpdate`를 통해 즉시 부모의 상태를 변경
- 단일 진실 공급원 원칙을 잘 따르지만, 체크박스 하나를 클릭할 때마다 전체 위저드(`WizardContainer`)가 리렌더링
- 성능 저하 유발 가능

**해결 방법**:
1. **일관된 패턴 적용**: "로컬에서 상태를 관리하고, 중요한 시점(예: `onBlur`, '저장' 버튼 클릭)에만 중앙 상태를 업데이트"
2. **Step02WorkDetail**: `useEffect`를 통한 props 동기화 로직을 최소화하고, `useMemo` 등을 활용하여 파생 상태를 계산
3. **Step06bCopyright**: 로컬 `useState`를 사용하여 저작권 관련 설정을 관리하고, 사용자가 이 단계를 떠날 때(`Next` 버튼 클릭 시) 또는 별도의 '변경사항 저장' 버튼을 통해 `onUpdate`를 호출

---

### 2. 버그 가능성: `useWizard` 훅의 이전 단계 이동 로직

**파일**: `hooks/useWizard.ts`

**문제점**:
- `prevStep` 함수에서 `currentStep`이 0일 때 아무 동작도 하지 않도록 설계
- `WizardContainer`에서는 `currentStep`이 0일 때도 "이전" 버튼이 렌더링되고 `canGoPrev`가 `false`로 설정되어 비활성화
- `if (prev.currentStep < 1) return prev;` 조건이 `canGoPrev` 상태와 중복되어 혼란을 줄 수 있음
- `onRequestReset` 콜백이 `currentStep`이 0일 때 호출되지 않을 수 있음

**해결 방법**:
1. `useWizard` 훅의 `prevStep` 로직을 단순화
2. UI 렌더링 및 버튼 활성화 여부는 전적으로 `canGoPrev` 상태에만 의존하도록 구조를 명확히
3. `prevStep` 함수에서 `currentStep`이 0일 때 `onRequestReset`을 호출하는 로직을 명시적으로 처리
4. 또는 `WizardContainer`에서 `currentStep === 0`일 때 "이전" 버튼 대신 "초기화" 버튼을 렌더링

---

### 3. UX: AI 분석 결과 적용 후의 피드백 부족

**파일**: `app/components/wizard/steps/Step02WorkDetail.tsx`

**문제점**:
- `applyAnalysisResults` 함수를 통해 AI 분석 결과를 폼에 적용했을 때, "✓ AI 추천이 적용되었어요" 라는 메시지와 함께 버튼이 비활성화
- 어떤 필드들이 어떻게 변경되었는지 사용자가 한눈에 파악하기 어려움
- 금액, 클라이언트 유형, 일정 등 다른 단계의 값들도 변경되는데 사용자가 이를 인지하지 못할 수 있음

**해결 방법**:
1. AI 추천 적용 후, 변경된 필드들을 요약하여 Toast 메시지나 간단한 알림으로 보여주기
   - 예: "AI 추천을 적용했어요! (작업 항목 2개, 금액, 클라이언트 유형, 예상 기간)"
2. 또는 변경된 입력 필드에 잠시(1-2초) 하이라이트 효과(예: 노란색 배경)를 주어 시각적으로 어떤 값이 변경되었는지 알려주기

---

## 🟢 LOW (사소한 개선 및 잠재적 문제 예방)

### 1. 코드 품질: `React.memo`를 사용한 불필요한 리렌더링 방지

**파일**: `app/components/shared/Button.tsx`, `Card.tsx`, `Input.tsx` 등 다수

**문제점**:
- `Button`, `Card`와 같이 순수하게 props에 의존하는 공유 컴포넌트들이 `React.memo`로 래핑되어 있지 않음
- 부모 컴포넌트(`WizardContainer` 등)가 리렌더링될 때마다 이 컴포넌트들도 props 변경 여부와 상관없이 리렌더링
- 미세한 성능 저하 유발

**해결 방법**:

```tsx
// Button.tsx
const Button = React.forwardRef<...>(...);
export default React.memo(Button);
```

다른 공유 컴포넌트들도 `React.memo`로 감싸주어 불필요한 렌더링을 방지

---

### 2. UX: AI 채팅창의 미세한 사용성 개선

**파일**: `app/components/ai-assistant/AssistantWindow.tsx`

**문제점**:
- 메시지 전송 시 `setTimeout(..., 0)`을 사용하여 포커스를 즉시 입력창으로 되돌리는 로직이 있음
- `isLoading` 상태와 `useEffect`를 통해 이미 포커스 관리가 되고 있으므로 중복되거나 예측과 다른 동작을 유발할 가능성

**해결 방법**:
- `handleSubmit`, `handleQuickQuestion` 내부의 `setTimeout` 로직을 제거
- `useEffect`를 통한 포커스 관리에만 의존하도록 단순화

```tsx
// AssistantWindow.tsx
useEffect(() => {
  if (!isLoading) {
    inputRef.current?.focus();
  }
}, [isLoading]);
```

---

## 우선순위 요약

| 우선순위 | 문제 | 해결 필요성 |
|---------|------|-----------|
| 🔴 HIGH | Rate Limiter 서버리스 환경 미지원 | **즉시 해결** |
| 🔴 HIGH | WizardContainer God Component | **즉시 해결** |
| 🟡 MEDIUM | 상태 관리 일관성 부족 | 안정성 향상 |
| 🟡 MEDIUM | useWizard prevStep 로직 중복 | 코드 명확성 |
| 🟡 MEDIUM | AI 적용 후 피드백 부족 | UX 개선 |
| 🟢 LOW | React.memo 미사용 | 성능 최적화 |
| 🟢 LOW | AssistantWindow 포커스 관리 중복 | 코드 단순화 |

---

## 결론

ArtContract는 전반적으로 매우 잘 구조화된 프로젝트입니다.

**강점**:
- ✅ TypeScript 타입 안정성
- ✅ 커스텀 훅을 통한 깔끔한 상태 관리
- ✅ 접근성(a11y) 고려
- ✅ 에러 핸들링

**즉시 개선 필요**:
- 🔴 Rate Limiter를 Redis 기반으로 마이그레이션 (보안)
- 🔴 WizardContainer 리팩토링 (유지보수성)

**권장 개선**:
- 🟡 상태 관리 패턴 일관성
- 🟡 AI 피드백 개선

이 리뷰를 바탕으로 우선순위가 높은 문제부터 순차적으로 해결하시면 더욱 견고하고 확장 가능한 프로젝트가 될 것입니다!
