// API 경로 상수
export const API_PATHS = {
  CHAT: '/api/chat',
  ANALYZE_WORK: '/api/analyze-work',
  TEMPLATES: '/api/templates',
} as const;

// AI 모델 상수
export const AI_MODELS = {
  DEFAULT: 'google/gemini-2.0-flash-exp:free',
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
} as const;

// 경고 ID 상수
export const WARNING_IDS = {
  // 금액 관련
  PAYMENT_ZERO: 'payment_zero',
  PAYMENT_LOW: 'payment_low',
  PAYMENT_HIGH: 'payment_high',

  // 수정 횟수 관련
  REVISIONS_ZERO: 'revisions_zero',
  REVISIONS_HIGH: 'revisions_high',
  REVISIONS_UNLIMITED: 'revisions_unlimited',

  // 마감일 관련
  DEADLINE_URGENT: 'deadline_urgent',
  DEADLINE_SOON: 'deadline_soon',

  // 사용 범위 관련
  COMMERCIAL_LOW: 'commercial_low',
  EXCLUSIVE_LOW: 'exclusive_low',
} as const;

// 타임아웃 설정 (밀리초)
export const TIMEOUTS = {
  API_CHAT: 15000,        // 15초
  API_TEMPLATE: 10000,    // 10초
  API_ANALYZE: 15000,     // 15초
} as const;

// 금액 임계값
export const PAYMENT_THRESHOLDS = {
  ZERO: 0,
  LOW: 50000,           // 5만원
  HIGH: 1000000,        // 100만원
  DEPOSIT_MIN: 100000,  // 계약금 권장 최소 금액
} as const;

// 수정 횟수 임계값
export const REVISION_THRESHOLDS = {
  ZERO: 0,
  NORMAL_MAX: 5,
  HIGH: 10,
} as const;

// 마감일 임계값 (일)
export const DEADLINE_THRESHOLDS = {
  URGENT: 1,   // 오늘/내일
  SOON: 3,     // 3일 이내
  NORMAL: 7,   // 1주일
  LONG: 30,    // 1개월
} as const;

// 화폐 포맷
export const CURRENCY = {
  KRW: 'KRW',
  SYMBOL: '₩',
} as const;

// 마법사 단계 번호
export const WIZARD_STEP_NUMBERS = {
  ARTIST_INFO: 0,
  FIELD_SELECTION: 1,
  WORK_DETAIL: 2,
  CLIENT_INFO: 3,
  TIMELINE: 4,
  PAYMENT: 5,
  REVISIONS: 6,
  COPYRIGHT: 7,
  USAGE_SCOPE: 8,
  PROTECTION: 9,
  FINAL_CHECK: 10,
} as const;
