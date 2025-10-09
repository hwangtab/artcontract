# Gemini 코드 리뷰 (2025-10-10)

## 1. 개요

ArtContract 코드베이스 전체에 대한 리뷰를 진행했습니다. 전반적으로 잘 구조화되어 있으며, 특히 `useWizard` 훅을 중심으로 상태 관리가 효율적으로 이루어지고 있습니다. 본 리뷰에서는 코드의 유지보수성, 안정성, 성능을 더욱 향상시키기 위한 몇 가지 주요 개선점을 제안합니다.

**주요 개선 영역:**

1.  **하드코딩된 값 및 매직 스트링 (Hardcoded Values & Magic Strings)**
2.  **API 호출 안정성 (API Call Stability)**
3.  **타입 안정성 강화 (Type Safety)**
4.  **서버리스 환경에서의 속도 제한 문제 (Rate Limiting in Serverless)**
5.  **컴포넌트 설계 및 리팩토링 (Component Design & Refactoring)**

---

## 2. 상세 리뷰 및 제안

### 2.1. 하드코딩된 값 및 매직 스트링

코드 전반에 걸쳐 API 경로, AI 모델명, 경고 메시지, 각종 임계값 등이 하드코딩되어 있습니다. 이는 향후 변경이 필요할 때 여러 파일을 수정해야 하는 번거로움을 유발하고, 오류의 원인이 될 수 있습니다.

**문제 코드 예시:**

- `lib/ai/openrouter-client.ts`:
  ```typescript
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';
  ```
- `hooks/useProactiveAlerts.ts`:
  ```typescript
  if (amount >= 1000000) {
    registerWarning(
      'payment_high',
      '💼 100만원 이상 고액 계약이에요! ...',
      'warning'
    );
  }
  ```

**개선 제안:**

모든 상수를 `lib/constants.ts` 파일로 중앙화하여 관리합니다.

**`lib/constants.ts` (신규 또는 수정):**

```typescript
// API 경로
export const API_PATHS = {
  CHAT: '/api/chat',
  ANALYZE_WORK: '/api/analyze-work',
  TEMPLATES: '/api/templates',
} as const;

// AI 모델
export const AI_MODELS = {
  DEFAULT: 'google/gemini-2.0-flash-exp:free',
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
} as const;

// 경고 ID
export const WARNING_IDS = {
  PAYMENT_HIGH: 'payment_high',
  // ... 기타 ID
} as const;

// 타임아웃 (밀리초)
export const TIMEOUTS = {
  API_CHAT: 15000,
  API_ANALYZE: 15000,
} as const;

// 금액 임계값
export const PAYMENT_THRESHOLDS = {
  HIGH: 1000000, // 100만원
  // ... 기타 임계값
} as const;
```

**적용 예시 (`hooks/useProactiveAlerts.ts`):**

```typescript
import { PAYMENT_THRESHOLDS, WARNING_IDS } from '@/lib/constants';

// ...
if (amount >= PAYMENT_THRESHOLDS.HIGH) {
  registerWarning(
    WARNING_IDS.PAYMENT_HIGH,
    `💼 ${PAYMENT_THRESHOLDS.HIGH.toLocaleString()}원 이상 고액 계약이에요! ...`,
    'warning'
  );
}
```

### 2.2. API 호출 안정성

현재 `fetch`를 사용하는 API 호출에 타임아웃이 설정되어 있지 않아, 네트워크 문제나 외부 API 지연 시 시스템이 무한정 대기 상태에 빠질 수 있습니다.

**문제 코드 예시 (`WizardContainer.tsx`):**

```typescript
const response = await fetch(`/api/templates?field=${formData.field}`);
// 타임아웃 없음
```

**개선 제안:**

`AbortController`를 사용하여 모든 `fetch` 호출에 타임아웃을 설정하고, 타임아웃 발생 시 사용자에게 명확한 피드백을 제공합니다.

**`WizardContainer.tsx` 수정 예시:**

```typescript
try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

  const response = await fetch(`/api/templates?field=${formData.field}`, {
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Failed to fetch template: ${response.status}`);
  }
  // ...
} catch (error) {
  console.error('Contract generation failed:', error);
  let errorMsg = '계약서 템플릿을 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
  if (error instanceof Error && error.name === 'AbortError') {
    errorMsg = '⏱️ 템플릿 로딩 시간이 초과되었어요. 네트워크를 확인하고 다시 시도해주세요.';
  }
  addProactiveMessage(errorMsg, 'danger');
}
```

### 2.3. 타입 안정성 강화

AI API 응답과 같이 외부에서 들어오는 데이터에 대해 `zod`와 같은 라이브러리를 사용한 런타임 스키마 검증이 없어, 예기치 않은 데이터 형식으로 인해 런타임 에러가 발생할 수 있습니다.

**문제 코드 예시 (`lib/ai/work-analyzer.ts`):**

```typescript
export async function analyzeWork(
  field: string,
  userInput: string
): Promise<WorkAnalysis> {
  const client = getOpenRouterClient();
  const analysis = await client.analyzeWork(field, userInput);
  // 스키마 검증 없이 바로 반환
  return analysis;
}
```

**개선 제안:**

`zod`를 사용하여 AI 응답의 구조와 타입을 검증하고, 검증 실패 시 안전한 기본값을 반환합니다.

**`lib/ai/work-analyzer.ts` 수정 예시:**

```typescript
import { z } from 'zod';
import { WorkAnalysis } from '@/types/contract';
import { getOpenRouterClient } from './openrouter-client';

// AI 응답 스키마 정의
const WorkAnalysisSchema = z.object({
  workType: z.string().default('작업'),
  // ... 다른 필드들
  suggestedPriceRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }).default({ min: 100000, max: 500000, currency: 'KRW' }),
  confidence: z.number().min(0).max(1).default(0.5),
});

export async function analyzeWork(
  field: string,
  userInput: string
): Promise<WorkAnalysis> {
  const client = getOpenRouterClient();
  try {
    const analysis = await client.analyzeWork(field, userInput);
    const validationResult = WorkAnalysisSchema.safeParse(analysis);

    if (!validationResult.success) {
      console.warn('AI response validation failed:', validationResult.error);
      // 검증 실패 시 안전한 기본값 반환
      return createFallbackAnalysis(userInput, 'Validation failed');
    }
    return validationResult.data;
  } catch (error) {
    console.error('Work analysis API call failed:', error);
    return createFallbackAnalysis(userInput, 'API call failed');
  }
}

function createFallbackAnalysis(userInput: string, reason: string): WorkAnalysis {
  // ... 안전한 기본값을 생성하는 로직
}
```

### 2.4. 서버리스 환경에서의 속도 제한 문제

`lib/utils/rate-limiter.ts`의 `RateLimiter`는 인스턴스별 인메모리 캐시(LRU)를 사용합니다. Vercel과 같은 서버리스 환경에서는 요청마다 다른 인스턴스가 실행될 수 있으므로, 이 방식으로는 효과적인 속도 제한이 불가능합니다.

**문제 인식:**

개발자 스스로 이 문제를 인지하고 있으며, 파일 내에 `TODO` 주석으로 개선 방향을 명시해두었습니다.

```typescript
/**
 * ⚠️ CRITICAL ISSUE: 분산 환경에서 Rate Limiting 우회 가능
 * ...
 * 해결 방법:
 * - Vercel KV (Redis) 또는 Upstash Redis 사용으로 중앙화된 캐시 구현
 */
```

**개선 제안:**

주석에 명시된 대로, Vercel KV 또는 Upstash와 같은 중앙화된 데이터 스토어를 사용하여 모든 서버리스 인스턴스가 속도 제한 상태를 공유하도록 `RateLimiter`를 재구현해야 합니다.

### 2.5. 컴포넌트 설계 및 리팩토링

일부 컴포넌트의 복잡도가 높아 유지보수가 어렵습니다. 특히 `Step02WorkDetail.tsx`는 자유 입력, AI 분석, 작업 항목 관리 등 여러 책임이 혼재되어 있습니다.

**개선 제안:**

- **`Step02WorkDetail.tsx` 분리:**
  - `WorkItemInput`: 개별 작업 항목의 입력을 처리하는 컴포넌트
  - `WorkItemList`: 작업 항목 목록을 관리하는 컴포넌트
  - `AIAnalysisResult`: AI 분석 결과를 표시하는 컴포넌트
- **`Card.tsx` 접근성 개선:**
  - 현재 `onClick`이 있을 때 `button`으로 렌더링되도록 구현되어 있으나, 키보드 네비게이션과 스크린 리더 호환성을 더욱 명확히 개선할 수 있습니다. `aria-pressed` 속성을 사용하는 등 접근성을 강화하는 것이 좋습니다. (현재 코드에 일부 반영되어 있으나, 더 개선될 수 있습니다.)

---

## 3. 결론

ArtContract는 훌륭한 아이디어를 바탕으로 잘 만들어진 애플리케이션입니다. 위에 제안된 개선점들을 반영한다면, 코드의 안정성과 유지보수성이 크게 향상되어 앞으로 기능을 확장하고 관리하기가 더욱 용이해질 것입니다.
