import { WorkAnalysis, ContractFormData } from './contract';
import { AIResponse } from './ai-assistant';

// API 공통 응답
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 작업 분석 API
export interface AnalyzeWorkRequest {
  field: string;
  userInput: string;
}

export interface AnalyzeWorkResponse extends ApiResponse<WorkAnalysis> {}

// AI 대화 API
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: {
    type?: 'proactive' | 'response' | 'error';
    severity?: 'info' | 'warning' | 'danger';
  };
}

export interface ChatRequest {
  message: string;
  context: {
    currentStep: number;
    formData: ContractFormData;
    conversationHistory: ChatMessage[];
  };
}

export interface ChatResponse extends ApiResponse<AIResponse> {}

// 템플릿 API
export interface GetTemplateRequest {
  field: string;
  workType?: string;
}

export interface GetTemplateResponse extends ApiResponse<{
  template: any;
}> {}
