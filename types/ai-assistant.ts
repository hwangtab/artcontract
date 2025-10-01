import { ContractFormData } from './contract';

// AI 메시지 타입
export type MessageType = 'text' | 'warning' | 'suggestion' | 'example' | 'proactive';

// AI 메시지 역할
export type MessageRole = 'user' | 'assistant' | 'system';

// AI 메시지
export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  type?: MessageType;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  relatedStep?: number;
  actionButtons?: ActionButton[];
  sourceType?: 'faq' | 'ai';
  responseTime?: number;
  formDataSnapshot?: Partial<ContractFormData>;
}

// 액션 버튼
export type ActionType = 'fill_field' | 'go_to_step' | 'show_example' | 'open_modal' | 'dismiss';

export interface ActionButton {
  label: string;
  action: ActionType;
  value?: any;
  style?: 'primary' | 'secondary' | 'danger';
}

// AI 컨텍스트
export interface AIContext {
  currentStep: number;
  formData: ContractFormData;
  incompletedFields: string[];
  riskLevel: 'low' | 'medium' | 'high';
  userIntent?: string;
  conversationHistory: AIMessage[];
}

// 빠른 질문
export interface QuickQuestion {
  id: string;
  text: string;
  category: string;
  relevantSteps: number[];
  priority?: number;
}

// FAQ 항목
export interface FAQItem {
  id: string;
  question: string[];
  answer: string;
  keywords: string[];
  category: string;
  examples?: string[];
  relatedQuestions?: string[];
}

// AI 응답
export interface AIResponse {
  message: string;
  actionButtons?: ActionButton[];
  suggestedValues?: Record<string, any>;
  formUpdates?: Partial<ContractFormData>;  // AI가 추천하는 폼 데이터 자동 입력
  warnings?: string[];
  confidence?: number;
}

// 프로액티브 트리거
export interface ProactiveTrigger {
  id: string;
  condition: (context: AIContext) => boolean;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  priority: number;
  dismissible: boolean;
  actions?: ActionButton[];
}
