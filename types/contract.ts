// 예술 분야
export type ArtField = 'design' | 'photography' | 'writing' | 'music' | 'video' | 'voice' | 'translation' | 'other';

// 클라이언트 유형
export type ClientType = 'individual' | 'small_business' | 'enterprise' | 'unknown';

// 사용 범위
export type UsageScope = 'personal' | 'commercial' | 'online' | 'print' | 'unlimited';

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  deliverables?: string;
  quantity?: number;
  unitPrice?: number;
  subtotal?: number;
  // 향후 기능: 항목별 개별 일정 관리 (현재 미사용)
  // Step02 또는 Step04와 연동하여 항목별 마일스톤 설정 가능하도록 확장 예정
  timeline?: {
    startDate?: Date;
    deadline?: Date;
  };
}

// 위험 수준
export type RiskLevel = 'low' | 'medium' | 'high';

// 복잡도
export type Complexity = 'simple' | 'medium' | 'complex';

// 계약서 폼 데이터
export interface ContractFormData {
  workItems?: WorkItem[];
  // Step 0: 작가 정보 (을)
  artistName?: string;
  artistContact?: string;
  artistIdNumber?: string;  // 주민번호 뒷자리 또는 사업자번호
  artistAddress?: string;

  // Step 1: 작업 분야
  field?: ArtField;
  subField?: string;  // 세부 장르

  // Step 2: 작업 상세
  workType?: string;
  workDescription?: string;
  aiAnalysis?: WorkAnalysis | null;

  // Step 3: 클라이언트 정보 (갑)
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

  // Step 6.5: 저작권 (선택사항)
  copyrightTerms?: CopyrightTerms;

  // Step 8: 보호 조항 (선택사항)
  protectionClauses?: ProtectionClauses;

  // Step 9: 추가 조항
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
  workItems?: Array<{  // ✅ 여러 작업으로 나누기 위한 배열
    title: string;
    description?: string;
    estimatedPrice?: number;
    quantity?: number;  // ✅ 수량 (예: 영상 5개)
  }>;
  clientName?: string;  // ✅ AI가 추출한 클라이언트 이름
  clientType: ClientType;
  totalAmount?: number;  // ✅ 사용자가 명시한 총 금액
  commercialUse: boolean;
  usageScope: UsageScope[];
  complexity: Complexity;
  riskFactors: string[];
  suggestedPriceRange: {
    min: number;
    max: number;
    currency: string;
  };
  estimatedDays?: number;  // AI 추천 예상 작업 기간 (일)
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

// ========== Phase 1: 표준계약서 기반 확장 타입 ==========

// 저작권 관리
export interface CopyrightTerms {
  // 저작재산권 (Economic Rights) - 양도/이용허락 가능
  economicRights: {
    reproduction: boolean;      // 복제권
    distribution: boolean;       // 배포권
    publicPerformance: boolean;  // 공연권
    publicTransmission: boolean; // 공중송신권
    exhibition: boolean;         // 전시권
    rental: boolean;            // 대여권
  };

  // 저작인격권 (Moral Rights) - 항상 창작자 보유, 양도 불가
  moralRights: {
    attribution: true;           // 성명표시권
    integrity: true;             // 동일성유지권
    disclosure: true;            // 공표권
  };

  // 2차적저작물작성권 (Derivative Works)
  derivativeWorks: {
    included: boolean;           // 포함 여부
    separateNegotiation: boolean; // 별도 협의 여부
    additionalFee?: number;      // 추가 대금
  };

  // 권리 형태
  rightsType: 'full_transfer' | 'partial_transfer' | 'exclusive_license' | 'non_exclusive_license';

  // 이용 기간
  usagePeriod?: {
    start: Date;
    end: Date;
    perpetual: boolean;
  };

  // 이용 지역
  usageRegion?: string; // '대한민국', '전세계' 등

  // 이용 매체
  usageMedia?: string[]; // ['온라인', '인쇄물', 'SNS'] 등
}

// 3단계 지급 구조
export interface EnhancedPaymentTerms {
  totalAmount: number;
  currency: 'KRW' | 'USD';

  // 분할 지급
  installments?: {
    downPayment?: {
      percentage: number;      // 계약금 비율 (10-30%)
      amount: number;
      dueDate: 'immediately';  // 계약 즉시
    };

    midPayment?: {
      percentage: number;      // 중도금 비율 (30-50%)
      amount: number;
      milestone: string;       // 지급 조건
      dueDate: Date;
    };

    finalPayment: {
      percentage: number;      // 잔금 비율 (20-60%)
      amount: number;
      dueDate: number;         // 완료 후 N일 이내
    };
  };

  // 지급 정보
  bankAccount?: {
    bank: string;
    accountNumber: string;
    accountHolder: string;
  };

  // 지연이자
  lateInterest?: {
    enabled: boolean;
    annualRate: number;        // 연 6-12%
  };

  // 지급보증보험 (고액 계약)
  paymentGuarantee?: {
    required: boolean;
    amount: number;
    provider: string;
  };
}

// 크레딧 명기 조항
export interface CreditTerms {
  displayMethod: 'text' | 'image' | 'both';
  displayPosition: 'start' | 'end' | 'separate_credit';
  displayContent: string; // "작업 분야: 이름"
  onlineDisplay: boolean;
  penaltyForOmission: boolean;
}

// 수정 권리 조항
export interface ModificationTerms {
  minorModifications: {
    count: number;
    free: boolean;
  };
  additionalModifications: {
    pricePerModification: number;
  };
  substantialChanges: {
    requiresConsent: boolean;
    definition: string[];
  };
}

// 비밀유지 조항
export interface ConfidentialityTerms {
  scope: string[];             // 비밀 범위
  duration: number;            // 유지 기간 (년)
  exceptions: string[];        // 예외 사항
}

// 안전 배려 조항
export interface SafetyTerms {
  insuranceRequired: boolean;
  safetyEquipment: boolean;
  riskDisclosure: boolean;
}

// 해제/해지 조항
export interface TerminationTerms {
  normalTermination: {
    mutualAgreement: boolean;
    forceMajeure: boolean;
  };
  breachTermination: {
    notificationPeriod: number;  // 통지 기간 (일)
    remedyPeriod: number;        // 시정 기간 (일)
  };
  immediateTermination: string[]; // 즉시 해제 사유
}

// 분쟁 해결 조항
export interface DisputeResolutionTerms {
  negotiationPeriod: number;    // 협의 기간 (일)
  mediationOrganizations: string[]; // 조정 기관
  jurisdiction: string;         // 관할 법원
}

// 보호 조항 묶음
export interface ProtectionClauses {
  creditAttribution?: CreditTerms;
  modificationRights?: ModificationTerms;
  confidentiality?: ConfidentialityTerms;
  safetyObligations?: SafetyTerms;
}

// 확장된 계약서 폼 데이터
export interface EnhancedContractFormData extends ContractFormData {
  // 저작권 관리
  copyrightTerms?: CopyrightTerms;

  // 향상된 지급 조건 (기존 payment 대체 가능)
  enhancedPayment?: EnhancedPaymentTerms;

  // 보호 조항
  protectionClauses?: ProtectionClauses;

  // 해제 조건
  terminationTerms?: TerminationTerms;

  // 분쟁 해결
  disputeResolution?: DisputeResolutionTerms;

  // 분야별 특수 조항 (Phase 3에서 확장)
  fieldSpecificClauses?: any;
}
