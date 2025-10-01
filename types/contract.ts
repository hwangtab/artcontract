// 예술 분야
export type ArtField = 'design' | 'photography' | 'writing' | 'music';

// 클라이언트 유형
export type ClientType = 'individual' | 'small_business' | 'enterprise' | 'unknown';

// 사용 범위
export type UsageScope = 'personal' | 'commercial' | 'online' | 'print' | 'unlimited';

// 위험 수준
export type RiskLevel = 'low' | 'medium' | 'high';

// 복잡도
export type Complexity = 'simple' | 'medium' | 'complex';

// 계약서 폼 데이터
export interface ContractFormData {
  // Step 1: 작업 분야
  field?: ArtField;

  // Step 2: 작업 상세
  workType?: string;
  workDescription?: string;
  aiAnalysis?: WorkAnalysis;

  // Step 3: 클라이언트 정보
  clientType?: ClientType;
  clientName?: string;
  clientContact?: string;

  // Step 4: 일정
  timeline?: {
    startDate?: Date;
    deadline?: Date;
    estimatedDays?: number;
  };

  // Step 5: 금액
  payment?: {
    amount?: number;
    currency: 'KRW';
    deposit?: number;
    depositPercentage?: number;
    paymentMethod?: string;
    paymentSchedule?: string;
  };

  // Step 6: 수정 횟수
  revisions?: number | 'unlimited' | null;
  additionalRevisionFee?: number;

  // Step 7: 사용 범위
  usageScope?: UsageScope[];
  commercialUse?: boolean;
  exclusiveRights?: boolean;

  // Step 8: 추가 조항
  additionalClauses?: string[];
  specialConditions?: string;

  // 메타 데이터
  currentStep: number;
  completeness: number;
  riskLevel: RiskLevel;
  warnings: Warning[];
}

// AI 분석 결과
export interface WorkAnalysis {
  workType: string;
  clientType: ClientType;
  commercialUse: boolean;
  usageScope: UsageScope[];
  complexity: Complexity;
  riskFactors: string[];
  suggestedPriceRange: {
    min: number;
    max: number;
    currency: string;
  };
  additionalClauses: string[];
  confidence: number;
}

// 경고 시스템
export interface Warning {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
  suggestion: string;
  autoTrigger: boolean;
  dismissible: boolean;
  relatedField?: string;
}

// 계약서 템플릿
export interface ContractTemplate {
  template_id: string;
  name: string;
  description: string;
  target_field: ArtField;
  target_work_types: string[];
  sections: {
    [key: string]: TemplateSection;
  };
  conditional_clauses?: ConditionalClause[];
  risk_warnings?: RiskWarning[];
  legal_disclaimer: string;
}

export interface TemplateSection {
  title: string;
  template: string;
  required: boolean;
  order: number;
}

export interface ConditionalClause {
  condition: string;
  additional_text?: string;
  warning?: string;
}

export interface RiskWarning {
  condition: string;
  message: string;
  level: 'info' | 'warning' | 'danger';
}

// 생성된 계약서
export interface GeneratedContract {
  id: string;
  formData: ContractFormData;
  template: ContractTemplate;
  content: string;
  createdAt: Date;
  completeness: number;
  warnings: Warning[];
}
