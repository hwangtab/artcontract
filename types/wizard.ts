import { ContractFormData } from './contract';

// 마법사 단계
export interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: string;
  requiredFields: string[];
  optional?: boolean;
}

// 마법사 상태
export interface WizardState {
  currentStep: number;
  formData: ContractFormData;
  isComplete: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  completeness: number;
  visitedSteps: number[];
}

// 마법사 액션
export type WizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: any } }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<ContractFormData> }
  | { type: 'RESET' }
  | { type: 'SET_COMPLETENESS'; payload: number };

// 검증 결과
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'out_of_range';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

// 선택 카드 옵션
export interface SelectionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  recommended?: boolean;
  value: any;
}
