import { EnhancedContractFormData, ContractFormData, Warning } from '@/types/contract';

export interface RiskDetectionResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: Warning[];
  suggestions: string[];
  criticalErrors: string[];
  completeness: number; // 0-100 percentage
}

/**
 * 완성도 계산 (0-100%)
 * validator.ts에서 이식
 */
function calculateCompleteness(data: ContractFormData): number {
  const requiredFields = [
    'field',
    'workType',
    'payment.amount',
    'revisions',
  ];

  const optionalButImportant = [
    'clientName',
    'timeline.deadline',
    'usageScope',
  ];

  let completed = 0;
  let total = requiredFields.length * 1.5 + optionalButImportant.length;

  requiredFields.forEach((field) => {
    if (getNestedValue(data, field)) {
      completed += 1.5; // 필수 필드는 가중치 높게
    }
  });

  optionalButImportant.forEach((field) => {
    if (getNestedValue(data, field)) {
      completed += 1;
    }
  });

  // workItems 가중치: 항목이 있을 때만 분모/분자에 동시 추가
  if (Array.isArray((data as any).workItems) && (data as any).workItems.length > 0) {
    total += 1;
    completed += 1;
  }

  return Math.min(100, Math.round((completed / total) * 100));
}

/**
 * 중첩 객체 값 가져오기
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * 계약서 위험 요소 자동 감지 시스템
 * 문화체육관광부 표준계약서 기준 적용
 */
export function detectContractRisks(
  formData: EnhancedContractFormData | ContractFormData
): RiskDetectionResult {
  const warnings: Warning[] = [];
  const criticalErrors: string[] = [];
  const suggestions: string[] = [];

  const itemsTotal = (formData.workItems || []).reduce((sum, item) => {
    const subtotal = item.subtotal ??
      (item.unitPrice !== undefined && item.quantity !== undefined
        ? item.unitPrice * item.quantity
        : undefined);
    return subtotal !== undefined ? sum + subtotal : sum;
  }, 0);

  if (formData.workItems && formData.workItems.length > 0) {
    const incompleteItems = formData.workItems.filter((item) => !item.description);
    if (incompleteItems.length > 0) {
      warnings.push({
        id: 'work_items_missing_description',
        severity: 'warning',
        message: '⚠️ 일부 작업 항목에 상세 설명이 없습니다.',
        suggestion: '각 작업별로 어떤 결과물을 제공하는지 구체적으로 적어주세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'workItems',
      });
    }

    const itemsWithoutPricing = formData.workItems.filter(
      (item) =>
        item.subtotal === undefined &&
        !(item.unitPrice !== undefined && item.quantity !== undefined)
    );
    if (itemsWithoutPricing.length > 0) {
      warnings.push({
        id: 'work_items_missing_pricing',
        severity: 'warning',
        message: '⚠️ 일부 작업 항목에 금액 정보가 없습니다.',
        suggestion: '단가 또는 소계를 입력해 각 작업의 가치를 명확히 하세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'workItems',
      });
    }
  }

  // ========== CRITICAL: 법적 오류 감지 ==========

  // 1. 저작인격권 양도 시도 감지 (가장 치명적)
  const enhanced = formData as EnhancedContractFormData;
  if (enhanced.copyrightTerms) {
    // 저작인격권은 항상 창작자 보유 (법적으로 양도 불가)
    // 만약 UI에서 양도 시도가 있다면 즉시 차단
    const moralRights = enhanced.copyrightTerms.moralRights;
    if (
      moralRights.attribution !== true ||
      moralRights.integrity !== true ||
      moralRights.disclosure !== true
    ) {
      criticalErrors.push('저작인격권은 법적으로 양도할 수 없습니다!');
      warnings.push({
        id: 'moral_rights_transfer',
        severity: 'danger',
        message: '🚨 치명적 오류: 저작인격권은 법적으로 양도할 수 없습니다!',
        suggestion:
          '저작인격권(성명표시권, 동일성유지권, 공표권)은 항상 창작자에게 귀속됩니다. 계약서에서 이 조항을 삭제하세요.',
        autoTrigger: true,
        dismissible: false,
        relatedField: 'copyrightTerms.moralRights',
      });
    }

    // 2. 2차적저작물권 무상 포함 감지
    const derivative = enhanced.copyrightTerms.derivativeWorks;
    if (derivative.included && !derivative.additionalFee && !derivative.separateNegotiation) {
      warnings.push({
        id: 'derivative_works_no_fee',
        severity: 'danger',
        message: '⚠️ 매우 위험: 2차적저작물작성권을 무상으로 양도하려 합니다!',
        suggestion:
          '2차적저작물작성권(번역, 각색, 변형, 영상화 등)은 별도 대금을 받고 협의하세요. 무상 포함은 불공정 거래입니다.',
        autoTrigger: true,
        dismissible: false,
        relatedField: 'copyrightTerms.derivativeWorks',
      });
      suggestions.push('2차적저작물작성권은 본 계약에서 제외하고 별도 협의하세요.');
    }

    // 3. 전부 양도 + 저가 계약 감지
    if (
      enhanced.copyrightTerms.rightsType === 'full_transfer' &&
      (formData.payment?.amount || 0) < 1000000
    ) {
      warnings.push({
        id: 'full_transfer_low_price',
        severity: 'danger',
        message: '⚠️ 위험: 모든 권리를 양도하는데 대금이 100만원 미만입니다!',
        suggestion:
          '전부 양도는 창작자가 더 이상 해당 작품을 사용할 수 없다는 뜻입니다. 최소 100만원 이상, 가급적 200만원 이상 받으세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'copyrightTerms.rightsType',
      });
      suggestions.push('전부 양도 대신 "독점적 이용허락" 또는 "일부 양도"를 고려하세요.');
    }

    // 4. 권리 기간 무기한 + 저가
    if (
      enhanced.copyrightTerms.usagePeriod?.perpetual &&
      (formData.payment?.amount || 0) < 500000
    ) {
      warnings.push({
        id: 'perpetual_low_price',
        severity: 'warning',
        message: '⚠️ 주의: 무기한 사용 권리를 50만원 미만에 주려 합니다!',
        suggestion: '무기한 사용권은 높은 가치가 있습니다. 최소 50만원 이상 받으세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'copyrightTerms.usagePeriod',
      });
    }
  }

  // ========== HIGH: 금액 관련 위험 ==========

  const payment = formData.payment;
  const enhancedPay = enhanced.enhancedPayment;

  const amount = enhancedPay?.totalAmount || payment?.amount || 0;

  if (amount === 0 || (!payment && !enhancedPay)) {
    warnings.push({
      id: 'no_payment',
      severity: 'danger',
      message: '🚨 금액이 정해지지 않았습니다!',
      suggestion: '금액 없이 작업하면 나중에 분쟁 위험이 매우 높습니다. 반드시 금액을 정하세요.',
      autoTrigger: true,
      dismissible: false,
      relatedField: 'payment.amount',
    });
  } else {

    // 5. 0원 계약
    if (amount === 0) {
      criticalErrors.push('금액은 0원일 수 없습니다!');
      warnings.push({
        id: 'zero_payment',
        severity: 'danger',
        message: '🚨 금액이 0원입니다!',
        suggestion: '무료 작업이더라도 최소 금액(1만원)을 명시하세요. 법적 보호를 받으려면 금액이 필요합니다.',
        autoTrigger: true,
        dismissible: false,
        relatedField: 'payment.amount',
      });
    }

    // 6. 극저가 계약 (5만원 미만)
    if (amount > 0 && amount < 50000) {
      warnings.push({
        id: 'very_low_payment',
        severity: 'danger',
        message: '⚠️ 금액이 5만원 미만입니다!',
        suggestion:
          '시간과 노력 대비 터무니없이 낮은 금액입니다. 최소 시장 가격을 확인하고 재협의하세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'payment.amount',
      });
    }

    if (itemsTotal > 0 && amount > 0) {
      const diffRatio = Math.abs(amount - itemsTotal) / itemsTotal;
      if (diffRatio >= 0.25) {
        warnings.push({
          id: 'work_items_amount_mismatch',
          severity: 'warning',
          message: '⚠️ 작업 항목 합계와 총 금액이 크게 차이납니다.',
          suggestion: '항목별 금액과 총 계약 금액이 일치하는지 다시 확인하세요.',
          autoTrigger: true,
          dismissible: true,
          relatedField: 'payment.amount',
        });
      }
    }

    // 7. 고액 계약 (100만원 이상) 법률 상담 권장
    if (amount >= 1000000) {
      warnings.push({
        id: 'high_value_legal_consult',
        severity: 'info',
        message: '💡 고액 계약입니다',
        suggestion:
          '100만원 이상 계약은 법률 전문가의 검토를 받는 것을 강력히 권장합니다. 한국저작권위원회(02-2669-0100)에 무료 상담을 신청하세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'payment.amount',
      });
    }

    // 8. 계약금 미설정 (10만원 이상 계약)
    if (
      amount >= 100000 &&
      !payment?.deposit &&
      (!enhancedPay || !enhancedPay.installments?.downPayment)
    ) {
      warnings.push({
        id: 'no_down_payment',
        severity: 'warning',
        message: '⚠️ 계약금이 설정되지 않았습니다!',
        suggestion: `${amount.toLocaleString()}원이면 계약금 20-30% (${Math.floor(amount * 0.2).toLocaleString()}-${Math.floor(amount * 0.3).toLocaleString()}원)를 계약 즉시 받으세요. 계약금은 계약 이행을 보증합니다.`,
        autoTrigger: true,
        dismissible: true,
        relatedField: 'payment.deposit',
      });
      suggestions.push('계약금-중도금-잔금 3단계 지급 구조를 권장합니다.');
    }

    // 9. 계좌 정보 없음
    if (
      enhanced.enhancedPayment &&
      !enhanced.enhancedPayment.bankAccount
    ) {
      warnings.push({
        id: 'no_bank_account',
        severity: 'warning',
        message: '⚠️ 입금 계좌가 명시되지 않았습니다!',
        suggestion: '반드시 은행, 계좌번호, 예금주를 계약서에 명시하세요. 계좌 정보가 없으면 지급이 지연됩니다.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'enhancedPayment.bankAccount',
      });
    }
  }

  if (itemsTotal > 0 && amount === 0) {
    warnings.push({
      id: 'work_items_without_payment',
      severity: 'danger',
      message: '🚨 작업 항목 금액 합계는 있지만 총 계약 금액이 0원입니다.',
      suggestion: 'Step05에서 총 금액을 입력하거나 항목별 금액을 조정해 계약 금액을 확정하세요.',
      autoTrigger: true,
      dismissible: false,
      relatedField: 'payment.amount',
    });
  }

  // ========== HIGH: 수정 횟수 관련 ==========

  // 10. 무제한 수정
  if (formData.revisions === 'unlimited') {
    warnings.push({
      id: 'unlimited_revisions',
      severity: 'danger',
      message: '🚨 무제한 수정은 매우 위험합니다!',
      suggestion:
        '무제한 수정은 착취의 지름길입니다. 반드시 횟수를 제한하세요 (표준: 2-3회). 추가 수정은 회당 비용을 받으세요.',
      autoTrigger: true,
      dismissible: false,
      relatedField: 'revisions',
    });
    suggestions.push('수정 3회 + 추가 수정 시 회당 대금의 10-20% 청구 권장');
  }

  // 11. 수정 0회
  if (formData.revisions === 0) {
    warnings.push({
      id: 'zero_revisions',
      severity: 'warning',
      message: '⚠️ 수정 0회는 현실적이지 않습니다',
      suggestion: '최소 1-2회는 허용하는 것이 일반적입니다. 0회는 클라이언트와 마찰이 생길 수 있습니다.',
      autoTrigger: true,
      dismissible: true,
      relatedField: 'revisions',
    });
  }

  // 12. 수정 횟수 과다 (10회 이상)
  if (typeof formData.revisions === 'number' && formData.revisions >= 10) {
    warnings.push({
      id: 'too_many_revisions',
      severity: 'warning',
      message: '⚠️ 수정 횟수가 너무 많습니다',
      suggestion: '10회 이상 수정은 비현실적입니다. 5회 이하로 제한하고 추가 수정비를 명시하세요.',
      autoTrigger: true,
      dismissible: true,
      relatedField: 'revisions',
    });
  }

  // 13. 추가 수정비 미설정
  if (
    formData.revisions &&
    formData.revisions !== 'unlimited' &&
    !formData.additionalRevisionFee &&
    !enhanced.protectionClauses?.modificationRights
  ) {
    warnings.push({
      id: 'no_additional_fee',
      severity: 'info',
      message: '💡 추가 수정 비용을 명시하는 것을 권장합니다',
      suggestion: '수정 횟수 초과 시 회당 얼마를 받을지 미리 정해두면 분쟁을 예방할 수 있습니다.',
      autoTrigger: true,
      dismissible: true,
      relatedField: 'additionalRevisionFee',
    });
  }

  // ========== MEDIUM: 일정 관련 ==========

  if (formData.timeline?.deadline) {
    const deadline = formData.timeline.deadline;
    const today = new Date();
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // 14. 당일/익일 마감
    if (diffDays <= 1) {
      warnings.push({
        id: 'rush_deadline',
        severity: 'danger',
        message: '🚨 마감일이 너무 촉박합니다!',
        suggestion:
          '당일/익일 마감은 러시 작업입니다. 러시 비용(기본 대금의 30-50% 추가)을 반드시 받으세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'timeline.deadline',
      });
      suggestions.push('러시 작업은 건강을 해칩니다. 가급적 기한 연장을 요청하세요.');
    }

    // 15. 일주일 이내 마감
    if (diffDays > 1 && diffDays <= 7) {
      warnings.push({
        id: 'tight_deadline',
        severity: 'warning',
        message: '⚠️ 일주일 이내 마감입니다',
        suggestion: '촉박한 일정이면 러시 비용(10-20% 추가)을 받는 것을 고려하세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'timeline.deadline',
      });
    }

    // 16. 장기 프로젝트 (30일 이상)
    if (diffDays >= 30) {
      warnings.push({
        id: 'long_term_project',
        severity: 'info',
        message: '💡 장기 프로젝트입니다',
        suggestion: '한 달 이상 프로젝트는 중간 점검 일정과 중도금을 설정하세요.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'timeline.deadline',
      });
    }
  }

  // ========== MEDIUM: 보호 조항 누락 ==========

  // 17. 크레딧 조항 없음
  if (!enhanced.protectionClauses?.creditAttribution) {
    warnings.push({
      id: 'no_credit_clause',
      severity: 'info',
      message: '💡 크레딧 명기 조항을 추가하는 것을 권장합니다',
      suggestion:
        '저작인격권(성명표시권) 보호를 위해 결과물에 이름을 어떻게 표시할지 명시하세요. 포트폴리오 사용에도 중요합니다.',
      autoTrigger: true,
      dismissible: true,
      relatedField: 'protectionClauses.creditAttribution',
    });
  }

  // 18. 사용 범위 미정
  if (!formData.usageScope || formData.usageScope.length === 0) {
    if (!enhanced.copyrightTerms) {
      warnings.push({
        id: 'no_usage_scope',
        severity: 'warning',
        message: '⚠️ 사용 범위가 정해지지 않았습니다',
        suggestion:
          '작품을 어디에 어떻게 사용할 수 있는지 명확히 하세요. 나중에 "계약에 없던 용도"로 사용되는 것을 막을 수 있습니다.',
        autoTrigger: true,
        dismissible: true,
        relatedField: 'usageScope',
      });
    }
  }

  // 19. 사용 범위 무제한
  if (formData.usageScope?.includes('unlimited')) {
    warnings.push({
      id: 'unlimited_usage',
      severity: 'warning',
      message: '⚠️ 무제한 사용 범위는 위험합니다',
      suggestion:
        '무제한 사용은 클라이언트가 어떤 용도로든 사용할 수 있다는 뜻입니다. 구체적으로 범위를 정하세요 (온라인/인쇄물/SNS 등).',
      autoTrigger: true,
      dismissible: true,
      relatedField: 'usageScope',
    });
  }

  // 20. 클라이언트 정보 없음
  if (!formData.clientName) {
    warnings.push({
      id: 'no_client_info',
      severity: 'warning',
      message: '⚠️ 클라이언트 이름이 없습니다',
      suggestion: '계약 당사자 정보는 필수입니다. 클라이언트 이름과 연락처를 반드시 입력하세요.',
      autoTrigger: true,
      dismissible: false,
      relatedField: 'clientName',
    });
  }

  // ========== 위험 수준 계산 ==========

  const criticalCount = warnings.filter((w) => w.severity === 'danger').length;
  const highCount = warnings.filter((w) => w.severity === 'warning').length;

  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    criticalErrors.length > 0 || criticalCount >= 2
      ? 'critical'
      : criticalCount >= 1
        ? 'high'
        : highCount >= 2
          ? 'medium'
          : 'low';

  // 종합 조언 추가
  if (criticalErrors.length > 0) {
    suggestions.push('⚠️ 치명적 오류가 있습니다. 반드시 수정하세요!');
  }
  if (riskLevel === 'high' || riskLevel === 'critical') {
    suggestions.push('한국저작권위원회(www.copyright.or.kr) 또는 예술인신문고(1899-2202)에 상담을 신청하세요.');
  }

  // 완성도 계산
  const completeness = calculateCompleteness(formData);

  return {
    riskLevel,
    warnings,
    suggestions,
    criticalErrors,
    completeness,
  };
}

/**
 * 위험 수준에 따른 색상 반환
 */
export function getRiskLevelColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
  return {
    low: 'text-success',
    medium: 'text-warning',
    high: 'text-danger',
    critical: 'text-danger font-bold',
  }[level];
}

/**
 * 위험 수준 한글 표시
 */
export function getRiskLevelText(level: 'low' | 'medium' | 'high' | 'critical'): string {
  return {
    low: '안전',
    medium: '주의',
    high: '위험',
    critical: '매우 위험',
  }[level];
}
