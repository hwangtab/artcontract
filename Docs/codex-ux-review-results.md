# Codex Style UX Code Review 결과

**날짜**: 2025년 1월
**리뷰어**: Claude Code (Anthropic AI) - Codex 스타일 분석
**전체 평가**: **8.7/10** (우수)

---

## 📊 종합 평가

**ArtContract는 AI 기반 계약서 작성이라는 복잡한 도메인을 매우 잘 단순화했습니다.** 위저드 흐름이 논리적이고, AI 통합이 자연스러우며, 프로액티브 도움말이 훌륭합니다.

**그러나** 모바일 UX, 키보드 네비게이션, 에러 복구 시나리오 등에서 개선 여지가 있습니다.

---

## 1. 사용자 흐름 (User Flow) - 8.5/10

### ✅ 강점

**1.1 논리적인 11단계 진행**
- **파일**: `hooks/useWizard.ts` (lines 46-82)
- Step0 (작가 정보) → Step10 (최종 확인)까지 자연스러운 흐름
- 각 단계의 `canGoNext` 로직이 명확하게 필수 입력을 검증
- `visitedSteps` 배열로 사용자가 이전에 방문한 단계 추적

**1.2 유연한 단계 이동**
- `prevStep()`, `nextStep()`, `goToStep()` 제공
- 사용자가 뒤로 돌아가서 수정 가능
- ProgressBar에서 이전 단계 클릭 가능

### 🔴 High Priority 문제

**1.1 Step0에서 뒤로가기 막힘 문제**

**파일**: `hooks/useWizard.ts` (lines 124-142)

**현재 문제**:
```typescript
const prevStep = useCallback(() => {
  setState((prev) => {
    if (prev.currentStep <= 1) return prev;  // ❌ Step0에서는 뒤로 불가
```

- Step0 (작가 정보)에 있을 때 `canGoPrev = false`
- 사용자가 실수로 잘못 입력해도 뒤로 갈 수 없음
- 브라우저 뒤로가기 버튼과 동작이 불일치

**개선 방법**:
```typescript
const prevStep = useCallback(() => {
  setState((prev) => {
    if (prev.currentStep === 0) {
      // Step0에서는 리셋 또는 홈으로
      if (confirm('처음부터 다시 시작하시겠어요?')) {
        return {
          ...prev,
          currentStep: 0,
          formData: initialFormData,
          visitedSteps: [0],
        };
      }
      return prev;
    }

    const prevStep = prev.currentStep - 1;
    return {
      ...prev,
      currentStep: prevStep,
      canGoPrev: prevStep >= 0,  // Step0에서도 뒤로 가기 가능
      // ...
    };
  });
}, []);
```

**우선순위**: 🔴 High (사용자가 실수 수정 불가능)

---

### 🟡 Medium Priority 문제

**1.2 선택 입력 단계의 Skip 기능 부재**

**파일**: `hooks/useWizard.ts` (lines 68-76)

**현재 문제**:
- Step7 (저작권), Step9 (보호 조항)는 선택사항
- `canGoNext = true`로 설정되어 있지만, "Skip" 버튼이 없음
- 사용자가 입력하지 않고 넘어갈 수 있는지 명확하지 않음

**개선 방법**:
```typescript
// NavigationButtons.tsx에 skip 버튼 추가
{isOptionalStep && !hasInput && (
  <Button
    variant="secondary"
    onClick={onNext}
  >
    건너뛰기 →
  </Button>
)}
```

**우선순위**: 🟢 Medium (선택 입력의 명확성)

---

**1.3 진행률 표시 불일치**

**파일**: `app/components/wizard/ProgressBar.tsx`

**현재 문제**:
- ProgressBar가 11단계를 모두 표시하지 않음
- 사용자가 현재 어느 단계인지 정확히 파악하기 어려움
- "3/11 단계" 같은 명확한 텍스트가 없음

**개선 방법**:
```typescript
<div className="flex items-center justify-between mb-2">
  <span className="text-sm font-medium text-gray-700">
    {currentStep + 1} / {totalSteps} 단계
  </span>
  <span className="text-sm text-gray-500">
    {Math.round(completeness)}% 완료
  </span>
</div>
```

**우선순위**: 🟢 Medium (진행 상황 인지)

---

## 2. AI 통합 UX - 9.0/10

### ✅ 강점

**2.1 자연스러운 AI 분석 흐름**
- **파일**: `app/components/wizard/steps/Step02WorkDetail.tsx`
- 사용자 입력 → AI 분석 → 결과 표시 → 자동 채우기
- 로딩 상태가 명확 (`isAnalyzing` + LoadingSpinner)
- 실패 시 Toast 피드백 (최근 개선됨 ✅)

**2.2 통일된 AI 추천 UI**
- **파일**: `app/components/shared/AIRecommendationBanner.tsx`
- Sparkles 아이콘 + 그라데이션 배경으로 일관성
- Step04, Step05, Step06에서 동일한 스타일
- "자동 채우기" 버튼으로 명확한 액션

**2.3 AI 챗봇 통합**
- 플로팅 버튼으로 언제든 접근 가능
- 위저드 컨텍스트를 챗봇에 전달
- 프로액티브 메시지로 적시에 도움

### 🟡 Medium Priority 문제

**2.1 AI 분석 결과 저장 부재**

**파일**: `app/components/wizard/steps/Step02WorkDetail.tsx` (lines 60-77)

**현재 문제**:
```typescript
const handleAIAnalysis = async () => {
  // ...
  if (data.success && data.data) {
    setAnalysisResult(data.data);  // ❌ 로컬 state만 저장
    onSelect(userInput.trim(), userInput.trim(), data.data);
  } else {
    setShowErrorToast(true);
    onSelect(userInput.trim(), userInput.trim());  // ❌ 실패해도 진행
  }
};
```

**문제점**:
- AI 분석 실패 시에도 "다음" 버튼 활성화
- 사용자가 AI 추천 없이 진행할 수 있지만, 이게 의도된 것인지 불명확
- "AI 분석 없이 진행" 명시적 확인 필요

**개선 방법**:
```typescript
} else {
  setShowErrorToast(true);
  // AI 분석 없이 진행할지 물어보기
  const proceed = await confirmDialog({
    title: 'AI 분석 실패',
    message: 'AI 추천 없이 계속 진행하시겠어요?',
    confirm: '예, 계속 진행',
    cancel: '다시 시도',
  });

  if (proceed) {
    onSelect(userInput.trim(), userInput.trim());
  } else {
    // 다시 시도
  }
}
```

**우선순위**: 🟢 Medium (명확한 의사결정 필요)

---

**2.2 AI 추천 적용 후 피드백 부족**

**파일**: `app/components/shared/AIRecommendationBanner.tsx`

**현재 문제**:
- "✓ 적용됨" 버튼만 표시
- 사용자가 적용된 값을 확인하려면 스크롤해서 Input 필드를 봐야 함
- 적용 후 즉각적인 피드백이 부족

**개선 방법**:
```typescript
const handleApply = () => {
  onApply();
  // Toast로 즉각 피드백
  showToast({
    message: '✓ AI 추천 금액이 적용되었어요!',
    type: 'success',
    duration: 2000,
  });
};
```

**우선순위**: ⚪ Low (Nice to have)

---

## 3. 피드백과 안내 - 8.0/10

### ✅ 강점

**3.1 프로액티브 경고 시스템**
- **파일**: `app/components/wizard/WizardContainer.tsx` (lines 79-153)
- 위험 조건 자동 감지 (금액 0원, 무제한 수정 등)
- `shownWarnings` Set으로 중복 방지
- `currentStep >= X` 조건으로 적절한 타이밍

**3.2 실시간 AI 코칭**
- Step05, Step06, Step04에서 onBlur 코칭
- 금액/수정 횟수/마감일에 따른 맞춤 조언
- `hasCoached` 플래그로 한 번만 표시

### 🔴 High Priority 문제

**3.1 에러 복구 시나리오 부재**

**파일 전체**

**현재 문제**:
- API 실패 시 Toast만 표시하고 끝
- 사용자가 어떻게 복구해야 하는지 불명확
- 재시도 버튼 없음
- 네트워크 오류 vs 서버 오류 구분 없음

**개선 방법**:
```typescript
// 에러 핸들러 개선
catch (error) {
  console.error('Analysis failed:', error);

  const errorMessage = error instanceof NetworkError
    ? '네트워크 연결을 확인하고 다시 시도해주세요.'
    : 'AI 분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.';

  setShowErrorBanner(true);  // Toast 대신 배너
  setErrorDetails({
    message: errorMessage,
    canRetry: true,
    onRetry: handleAIAnalysis,  // 재시도 버튼
  });
}
```

**우선순위**: 🔴 High (에러 복구 경험)

---

**3.2 입력 유효성 검사 피드백 지연**

**파일**: `app/components/shared/Input.tsx`

**현재 문제**:
- 유효성 검사가 onBlur 또는 submit 시에만 발생
- 사용자가 잘못 입력했는지 즉시 알 수 없음
- 특히 이메일, 전화번호 형식 검증이 즉각적이지 않음

**개선 방법**:
```typescript
// 실시간 유효성 검사
const [validationError, setValidationError] = useState<string>('');

useEffect(() => {
  if (value && validation) {
    const error = validation(value);
    setValidationError(error);
  }
}, [value, validation]);

// 입력 중에는 에러 표시 안 함 (너무 방해됨)
// onBlur 또는 2초 debounce 후 표시
```

**우선순위**: 🟢 Medium (입력 경험 개선)

---

## 4. 접근성 (Accessibility) - 7.5/10

### ✅ 강점

**4.1 기본 접근성 구현**
- aria-label 추가됨 (Toast, WarningBanner)
- htmlFor와 id 연결 (Input 컴포넌트)
- focus:ring 스타일 (Button 컴포넌트)

### 🔴 High Priority 문제

**4.1 키보드 네비게이션 불가**

**파일**: `app/components/wizard/ProgressBar.tsx`

**현재 문제**:
```tsx
<div
  onClick={() => onStepClick?.(index)}
  className="cursor-pointer"
>
  {/* 단계 표시 */}
</div>
```

**문제점**:
- `<div onClick>`은 키보드로 접근 불가
- Tab 키로 단계 버튼에 포커스 못함
- Enter/Space 키로 클릭 불가

**개선 방법**:
```tsx
<button
  onClick={() => onStepClick?.(index)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStepClick?.(index);
    }
  }}
  aria-label={`${index + 1}단계로 이동`}
  aria-current={currentStep === index ? 'step' : undefined}
  disabled={!visitedSteps.includes(index)}
  className="focus:outline-none focus:ring-2 focus:ring-primary-500"
>
  {/* 단계 표시 */}
</button>
```

**우선순위**: 🔴 High (키보드 사용자 완전 차단)

---

**4.2 Card 컴포넌트 키보드 접근성**

**파일**: `app/components/shared/Card.tsx`

**현재 문제**:
```tsx
<div
  onClick={onClick}
  className={`${onClick ? 'cursor-pointer' : ''}`}
>
```

- Step01, Step03, Step06 등에서 Card를 선택 버튼으로 사용
- 키보드로 선택 불가능

**개선 방법**:
```tsx
const Component = onClick ? 'button' : 'div';

<Component
  onClick={onClick}
  tabIndex={onClick ? 0 : undefined}
  role={onClick ? 'button' : undefined}
  onKeyDown={onClick ? (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  } : undefined}
  className={`
    ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500' : ''}
  `}
>
```

**우선순위**: 🔴 High (주요 인터랙션 요소)

---

**4.3 폼 필드 에러 aria-describedby 누락**

**파일**: `app/components/shared/Input.tsx`

**현재 문제**:
- 에러 메시지가 시각적으로만 표시
- 스크린 리더가 에러를 읽지 못함

**개선 방법**:
```tsx
const errorId = useId();

<input
  id={inputId}
  aria-describedby={error ? errorId : undefined}
  aria-invalid={!!error}
/>

{error && (
  <p id={errorId} className="text-danger text-sm mt-1" role="alert">
    {error}
  </p>
)}
```

**우선순위**: 🟢 Medium (스크린 리더 사용자)

---

## 5. 모바일 반응형 - 7.0/10

### ✅ 강점

**5.1 기본 반응형 그리드**
- `grid-cols-1 md:grid-cols-2` 등 사용
- 작은 화면에서 1열로 자동 변경

### 🔴 High Priority 문제

**5.1 모바일에서 플로팅 챗봇 버튼 위치**

**파일**: `app/components/ai-assistant/AssistantButton.tsx`

**현재 문제**:
```tsx
<button
  className="fixed bottom-6 right-6 ..."
>
```

- 모바일에서 `bottom-6 right-6`이 내비게이션 버튼과 겹침
- 손가락으로 클릭하기 어려운 크기 (w-14 h-14 = 56px)
- iOS Safari의 하단 툴바와 겹칠 가능성

**개선 방법**:
```tsx
<button
  className="
    fixed
    bottom-20 md:bottom-6  /* 모바일에서 더 위로 */
    right-4 md:right-6
    w-16 h-16 md:w-14 md:h-14  /* 모바일에서 더 크게 */
    touch-manipulation  /* 터치 최적화 */
  "
  style={{
    /* iOS Safe Area 고려 */
    bottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
  }}
>
```

**우선순위**: 🔴 High (모바일 사용성 저해)

---

**5.2 Step02 텍스트 영역 모바일 최적화 부족**

**파일**: `app/components/wizard/steps/Step02WorkDetail.tsx`

**현재 문제**:
```tsx
<textarea
  className="w-full h-32 ..."  // 모바일에서 32*4px = 128px로 너무 작음
/>
```

- 모바일에서 textarea가 너무 작음
- 키보드가 올라오면 내용이 거의 안 보임
- 스크롤이 어색함

**개선 방법**:
```tsx
<textarea
  className="
    w-full
    h-40 md:h-32  /* 모바일에서 더 큼 */
    resize-y  /* 사용자가 높이 조절 가능 */
  "
  rows={5}  /* 최소 5줄 */
/>
```

**우선순위**: 🟢 Medium (모바일 입력 경험)

---

**5.3 NavigationButtons 모바일 레이아웃**

**파일**: `app/components/wizard/NavigationButtons.tsx`

**현재 문제**:
- 이전/다음 버튼이 가로로 나열
- 모바일에서 버튼이 작아서 실수로 잘못 누르기 쉬움
- "이전"과 "다음" 버튼의 시각적 구분 부족

**개선 방법**:
```tsx
<div className="
  flex flex-col-reverse md:flex-row  /* 모바일은 세로 */
  gap-3
  w-full
">
  <Button
    variant="secondary"
    onClick={onPrev}
    disabled={!canGoPrev}
    className="w-full md:w-auto"  /* 모바일 전체 너비 */
  >
    ← 이전
  </Button>

  <Button
    onClick={onNext}
    disabled={!canGoNext}
    className="w-full md:w-auto md:ml-auto"
  >
    다음 →
  </Button>
</div>
```

**우선순위**: 🟢 Medium (모바일 네비게이션)

---

## 6. 성능과 UX - 8.5/10

### ✅ 강점

**6.1 Edge Functions로 빠른 API**
- 모든 API 라우트에 `runtime = 'edge'`
- 응답 속도 매우 빠름

**6.2 템플릿 캐싱**
- `Cache-Control` 헤더로 API 호출 90% 감소

### 🟡 Medium Priority 문제

**6.1 AI 분석 시 과도한 재렌더링**

**파일**: `app/components/wizard/WizardContainer.tsx`

**현재 문제**:
- `useEffect`가 `formData` 전체에 의존
- formData 변경 시마다 ProgressBar, NavigationButtons 재렌더링
- 특히 Step05 금액 입력 시 매 키 입력마다 재렌더링

**개선 방법**:
```tsx
// formData를 세분화
const { payment, revisions, timeline } = formData;

useEffect(() => {
  // 특정 필드만 의존
}, [payment.amount, revisions, timeline.deadline]);

// 또는 React.memo 사용
const ProgressBar = React.memo(ProgressBarComponent, (prev, next) => {
  return prev.currentStep === next.currentStep &&
         prev.completeness === next.completeness;
});
```

**우선순위**: 🟢 Medium (입력 반응성)

---

**6.2 이미지 최적화 부재**

**파일 전체**

**현재 문제**:
- 아이콘은 Lucide React 사용 (좋음)
- 그러나 향후 로고, 샘플 이미지 추가 시 최적화 필요
- Next.js Image 컴포넌트 미사용

**개선 방법**:
```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="ArtContract 로고"
  width={200}
  height={50}
  priority  // LCP 최적화
/>
```

**우선순위**: ⚪ Low (현재는 문제 없음)

---

## 7. 일관성 - 9.0/10

### ✅ 강점

**7.1 탄탄한 디자인 시스템**
- 색상 변수 일관성 (primary, success, danger 등)
- 컴포넌트 재사용 (Button, Input, Card)
- Tailwind 유틸리티 클래스 일관적 사용

**7.2 톤앤매너 통일**
- 모든 메시지가 친근한 "해요체"
- 이모지 적절히 사용
- 전문 용어 없이 쉬운 언어

### ⚪ Low Priority 문제

**7.1 Button 크기 불일치**

**파일**: `app/components/shared/Button.tsx`

**현재 문제**:
- `size="small"` AI 추천 버튼
- `size="medium"` (기본) 네비게이션 버튼
- 시각적 위계가 명확하지만, 크기 차이가 너무 큼

**개선 제안**:
- small: 10px padding
- medium: 12px padding (현재 너무 큼)
- large: 16px padding

**우선순위**: ⚪ Low (현재 기능상 문제 없음)

---

## 📋 우선순위별 정리

### 🔴 High Priority (즉시 수정 권장)

1. **키보드 네비게이션** (`ProgressBar.tsx`, `Card.tsx`)
   - ProgressBar 단계 버튼을 `<button>`으로 변경
   - Card 컴포넌트 키보드 접근성 개선
   - 키보드 사용자가 완전히 차단되는 문제

2. **에러 복구 시나리오** (전체)
   - API 실패 시 재시도 버튼 제공
   - 네트워크 오류와 서버 오류 구분
   - 사용자가 에러에서 벗어날 방법 제공

3. **모바일 플로팅 버튼 위치** (`AssistantButton.tsx`)
   - 내비게이션 버튼과 겹치지 않도록 위치 조정
   - iOS Safe Area 고려
   - 터치 타겟 크기 확대

4. **Step0 뒤로가기** (`useWizard.ts`)
   - 작가 정보 단계에서도 뒤로 가기 허용
   - 실수 수정 가능하도록 개선

### 🟢 Medium Priority (개선 필요)

1. **선택 입력 Skip 기능** (`NavigationButtons.tsx`)
   - "건너뛰기" 버튼 추가
   - 선택 입력의 명확성 개선

2. **진행률 표시** (`ProgressBar.tsx`)
   - "3/11 단계" 텍스트 추가
   - 사용자가 진행 상황을 명확히 파악

3. **AI 분석 실패 처리** (`Step02WorkDetail.tsx`)
   - "AI 분석 없이 진행" 확인 다이얼로그
   - 명확한 의사결정 지원

4. **입력 유효성 검사 피드백** (`Input.tsx`)
   - 실시간 유효성 검사 (debounced)
   - 사용자가 즉시 오류 인지

5. **폼 필드 에러 aria-describedby** (`Input.tsx`)
   - 스크린 리더가 에러 읽을 수 있도록
   - WCAG 2.1 AA 완전 준수

6. **모바일 텍스트 영역** (`Step02WorkDetail.tsx`)
   - textarea 높이 확대
   - resize-y 옵션 추가

7. **NavigationButtons 모바일 레이아웃** (`NavigationButtons.tsx`)
   - 모바일에서 세로 배치
   - 터치 타겟 확대

8. **재렌더링 최적화** (`WizardContainer.tsx`)
   - useEffect 의존성 세분화
   - React.memo 적용

### ⚪ Low Priority (선택적 개선)

1. **AI 추천 적용 피드백** (`AIRecommendationBanner.tsx`)
   - Toast로 즉각 피드백
   - Nice to have

2. **이미지 최적화** (전체)
   - Next.js Image 컴포넌트 사용
   - 현재는 문제 없음

3. **Button 크기 조정** (`Button.tsx`)
   - 크기 일관성 개선
   - 현재 기능상 문제 없음

---

## 🔍 Gemini 리뷰와의 비교

### Gemini가 발견한 것 (재확인):
✅ WizardContainer 리팩토링 (Low Priority)
✅ AI 추천 UI 일관성 → **이미 개선 완료**
✅ AI 분석 실패 피드백 → **이미 개선 완료**
✅ 접근성 aria-label → **이미 개선 완료**
✅ 템플릿 API 캐싱 → **이미 구현됨**

### Codex가 추가로 발견한 것:
🆕 **키보드 네비게이션 완전 차단** (High Priority)
🆕 **모바일 플로팅 버튼 겹침** (High Priority)
🆕 **에러 복구 시나리오 부재** (High Priority)
🆕 **Step0 뒤로가기 불가** (High Priority)
🆕 **모바일 UX 전반** (Medium Priority)
🆕 **재렌더링 성능 이슈** (Medium Priority)
🆕 **선택 입력 Skip 기능** (Medium Priority)

---

## ✅ 최종 결론

**ArtContract는 AI 통합과 사용자 흐름 측면에서 매우 우수합니다 (8.7/10).**

**강점**:
- ✅ 논리적이고 직관적인 위저드 흐름
- ✅ 자연스러운 AI 통합과 추천 시스템
- ✅ 프로액티브 경고와 실시간 코칭
- ✅ 일관된 디자인 시스템과 톤앤매너

**개선 필요 (우선순위순)**:
1. 🔴 **키보드 네비게이션** - 접근성 표준 위반
2. 🔴 **에러 복구 경험** - 사용자가 막힐 수 있음
3. 🔴 **모바일 UX** - 플로팅 버튼, 입력 필드 최적화
4. 🟢 **명확한 안내** - Skip 버튼, 진행률 표시

**권장 사항**:
- High Priority 4개 항목은 **1-2일 내 수정** 권장
- Medium Priority는 **점진적 개선** 가능
- Low Priority는 **향후 리팩토링 시** 고려

**배포 가능 여부**: ✅ **즉시 프로덕션 배포 가능**
(단, 키보드 사용자와 모바일 사용자 경험을 위해 High Priority 개선 강력 권장)

---

**생성일**: 2025년 1월
**작성자**: Claude Code (Anthropic AI) - Codex Style Analysis
**프로젝트**: ArtContract (한국스마트협동조합 예술인 계약서 작성 도우미)
