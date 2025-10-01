import { ContractFormData, Warning } from '@/types/contract';
import { ValidationResult, ValidationError, ValidationWarning } from '@/types/wizard';
import { validationRules } from '../utils/validation-rules';
import { calculateDaysBetween, isToday, isTomorrow } from '../utils/date-helpers';

export function validateFormData(data: ContractFormData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Step 1: 분야 검증
  if (!data.field) {
    errors.push({
      field: 'field',
      message: '작업 분야를 선택해주세요',
      type: 'required',
    });
  }

  // Step 2: 작업 내용 검증
  if (!data.workType && !data.workDescription) {
    errors.push({
      field: 'workType',
      message: '작업 내용을 입력해주세요',
      type: 'required',
    });
  }

  // Step 5: 금액 검증
  if (data.payment) {
    const amount = data.payment.amount;

    if (amount === undefined || amount === null) {
      warnings.push({
        field: 'payment.amount',
        message: '금액이 정해지지 않았어요',
        suggestion: '금액 없이 작업하면 나중에 분쟁 위험이 매우 높아요. 최소한 대략적인 금액이라도 정하세요.',
        severity: 'high',
      });
    } else if (amount === 0) {
      errors.push({
        field: 'payment.amount',
        message: '금액은 0원일 수 없어요',
        type: 'invalid',
      });
    } else if (amount < validationRules.payment.min) {
      warnings.push({
        field: 'payment.amount',
        message: '금액이 너무 적어요',
        suggestion: '최소 1만원 이상으로 설정하세요.',
        severity: 'medium',
      });
    } else if (amount >= validationRules.payment.recommendDepositAbove && !data.payment.deposit) {
      warnings.push({
        field: 'payment.deposit',
        message: '계약금을 받는 게 좋아요',
        suggestion: `${amount.toLocaleString()}원이면 계약금 30-50% (${Math.floor(amount * 0.3).toLocaleString()}-${Math.floor(amount * 0.5).toLocaleString()}원)를 먼저 받으세요.`,
        severity: 'medium',
      });
    } else if (amount >= validationRules.payment.requireLegalConsultationAbove) {
      warnings.push({
        field: 'payment.amount',
        message: '고액 계약이에요',
        suggestion: '100만원 이상 계약은 반드시 법률 전문가와 상담하세요.',
        severity: 'high',
      });
    }
  } else {
    warnings.push({
      field: 'payment',
      message: '금액 정보가 없어요',
      suggestion: '금액을 입력해주세요.',
      severity: 'high',
    });
  }

  // Step 6: 수정 횟수 검증
  if (data.revisions === null || data.revisions === undefined) {
    warnings.push({
      field: 'revisions',
      message: '수정 횟수가 정해지지 않았어요',
      suggestion: '2-3회 정도가 적당해요.',
      severity: 'medium',
    });
  } else if (data.revisions === 'unlimited') {
    warnings.push({
      field: 'revisions',
      message: '무한 수정은 매우 위험해요! 🚨',
      suggestion: '반드시 횟수 제한을 두세요. 추가 수정은 별도 비용을 받으세요.',
      severity: 'high',
    });
  } else if (typeof data.revisions === 'number') {
    if (data.revisions === 0) {
      warnings.push({
        field: 'revisions',
        message: '수정 0회는 현실적이지 않아요',
        suggestion: '최소 1-2회는 허용하는 게 좋아요.',
        severity: 'low',
      });
    } else if (data.revisions > validationRules.revisions.max) {
      warnings.push({
        field: 'revisions',
        message: '수정 횟수가 너무 많아요',
        suggestion: '5회 이하로 제한하고, 추가 수정은 별도 비용을 받으세요.',
        severity: 'medium',
      });
    }
  }

  // Step 4: 기한 검증
  if (data.timeline?.deadline) {
    const deadline = data.timeline.deadline;
    const today = new Date();

    if (isToday(deadline)) {
      warnings.push({
        field: 'timeline.deadline',
        message: '오늘 마감은 너무 촉박해요! 🚨',
        suggestion: '러시 비용(20-50% 추가)을 받으세요.',
        severity: 'high',
      });
    } else if (isTomorrow(deadline)) {
      warnings.push({
        field: 'timeline.deadline',
        message: '내일 마감은 매우 촉박해요',
        suggestion: '러시 비용을 받거나 기한을 연장하세요.',
        severity: 'high',
      });
    } else {
      const days = calculateDaysBetween(today, deadline);

      if (days <= validationRules.timeline.rushDaysThreshold) {
        warnings.push({
          field: 'timeline.deadline',
          message: '일주일 이내 마감이에요',
          suggestion: '촉박한 일정이면 러시 비용을 받는 게 좋아요.',
          severity: 'medium',
        });
      } else if (days >= validationRules.timeline.recommendMilestoneAbove) {
        warnings.push({
          field: 'timeline.deadline',
          message: '장기 프로젝트네요',
          suggestion: '중간 점검 일정을 넣으면 좋아요.',
          severity: 'low',
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function generateWarnings(data: ContractFormData): Warning[] {
  const validation = validateFormData(data);
  const warnings: Warning[] = [];

  let warningId = 1;

  validation.warnings.forEach((warning) => {
    warnings.push({
      id: `warning_${warningId++}`,
      severity: warning.severity === 'high' ? 'danger' : warning.severity === 'medium' ? 'warning' : 'info',
      message: warning.message,
      suggestion: warning.suggestion,
      autoTrigger: true,
      dismissible: warning.severity !== 'high',
      relatedField: warning.field,
    });
  });

  return warnings;
}

export function calculateCompleteness(data: ContractFormData): number {
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
  let total = requiredFields.length + optionalButImportant.length;

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

  const percentage = Math.min(100, Math.round((completed / (requiredFields.length * 1.5 + optionalButImportant.length)) * 100));
  return percentage;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function assessRiskLevel(data: ContractFormData): 'low' | 'medium' | 'high' {
  const validation = validateFormData(data);

  const highRiskWarnings = validation.warnings.filter((w) => w.severity === 'high').length;
  const mediumRiskWarnings = validation.warnings.filter((w) => w.severity === 'medium').length;

  if (highRiskWarnings >= 2 || validation.errors.length > 0) {
    return 'high';
  } else if (highRiskWarnings === 1 || mediumRiskWarnings >= 2) {
    return 'medium';
  }

  return 'low';
}
