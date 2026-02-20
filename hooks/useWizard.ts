'use client';

import { useState, useCallback, useEffect } from 'react';
import { ContractFormData, EnhancedContractFormData } from '@/types/contract';
import { WizardState } from '@/types/wizard';
import { detectContractRisks } from '@/lib/contract/risk-detector';
import { TOTAL_STEPS } from '@/app/components/wizard/wizardConfig';

const initialFormData: EnhancedContractFormData = {
  currentStep: 0,  // Step0부터 시작
  completeness: 0,
  riskLevel: 'low',
  warnings: [],
  payment: {
    currency: 'KRW',
  },
};

function normalizeRiskLevel(level: 'low' | 'medium' | 'high' | 'critical'): 'low' | 'medium' | 'high' {
  return level === 'critical' ? 'high' : level;
}

function getCanGoNext(step: number, formData: EnhancedContractFormData): boolean {
  switch (step) {
    case 0: // Step0: 작가 정보
      return !!(formData.artistName && formData.artistContact);
    case 1: // Step1: 작업 분야
      return formData.selectedSubFields && formData.selectedSubFields.length > 0
        ? true
        : !!formData.field;
    case 2: // Step2: 작업 상세
      return !!(
        formData.workDescription ||
        (formData.workItems && formData.workItems.length > 0)
      );
    case 3: // Step3: 클라이언트 정보
      return !!formData.clientName;
    case 4: // Step4: 일정
      return !!formData.timeline?.deadline;
    case 5: // Step5: 금액
      return !!(formData.payment?.amount && formData.payment.amount > 0);
    case 6: // Step6: 수정 횟수
      return formData.revisions !== null && formData.revisions !== undefined;
    case 7: // Step7: 저작권 (선택사항)
      return true;
    case 8: // Step8: 사용 범위
      return !!(formData.usageScope && formData.usageScope.length > 0);
    case 9: // Step9: 보호 조항 (선택사항)
      return true;
    case 10: // Step10: 최종 확인
      return true;
    default:
      return false;
  }
}

function deriveFormState(formData: EnhancedContractFormData, currentStep: number) {
  const detection = detectContractRisks(formData, currentStep);
  const completeness = detection.completeness;
  const riskLevel = normalizeRiskLevel(detection.riskLevel);
  const warnings = detection.warnings;

  const nextFormData: EnhancedContractFormData = {
    ...formData,
    currentStep,
    completeness,
    riskLevel,
    warnings,
  };

  return {
    formData: nextFormData,
    completeness,
    canGoNext: getCanGoNext(currentStep, nextFormData),
  };
}

export function useWizard() {
  const [state, setState] = useState<WizardState>({
    currentStep: 0,  // Step0부터 시작
    formData: initialFormData,
    isComplete: false,
    canGoNext: false,  // 작가 정보 입력 전까지 진행 불가
    canGoPrev: false,
    completeness: 0,
    visitedSteps: [0],  // Step0부터
  });

  // 폼 데이터 업데이트
  const updateFormData = useCallback((updates: Partial<EnhancedContractFormData>) => {
    setState((prev) => {
      const newFormData = { ...prev.formData, ...updates } as EnhancedContractFormData;
      const derived = deriveFormState(newFormData, prev.currentStep);

      return {
        ...prev,
        formData: derived.formData,
        completeness: derived.completeness,
        canGoNext: derived.canGoNext,
      };
    });
  }, []);

  // 다음 단계
  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= TOTAL_STEPS - 1) return prev;

      const nextStep = prev.currentStep + 1;
      const visitedSteps = prev.visitedSteps.includes(nextStep)
        ? prev.visitedSteps
        : [...prev.visitedSteps, nextStep];
      const derived = deriveFormState(prev.formData as EnhancedContractFormData, nextStep);

      return {
        ...prev,
        currentStep: nextStep,
        canGoPrev: true,
        canGoNext: derived.canGoNext,
        isComplete: nextStep === TOTAL_STEPS - 1,
        visitedSteps,
        formData: derived.formData,
        completeness: derived.completeness,
      };
    });
  }, []);

  // 이전 단계
  const prevStep = useCallback((onRequestReset?: () => void) => {
    setState((prev) => {
      // ✅ Step0에서는 아무 동작도 하지 않음 (버튼이 비활성화되어 있어야 함)
      if (prev.currentStep === 0) {
        return prev;
      }

      if (prev.currentStep < 1) return prev;

      const prevStep = prev.currentStep - 1;
      const derived = deriveFormState(prev.formData as EnhancedContractFormData, prevStep);

      return {
        ...prev,
        currentStep: prevStep,
        canGoPrev: prevStep > 0,  // ✅ 이전 단계가 0보다 크면 true
        canGoNext: derived.canGoNext,
        isComplete: prevStep === TOTAL_STEPS - 1,
        formData: derived.formData,
        completeness: derived.completeness,
      };
    });
  }, []);

  // 특정 단계로 이동
  const goToStep = useCallback((step: number) => {
    if (step < 0 || step >= TOTAL_STEPS) return;

    setState((prev) => {
      const visitedSteps = prev.visitedSteps.includes(step)
        ? prev.visitedSteps
        : [...prev.visitedSteps, step];
      const derived = deriveFormState(prev.formData as EnhancedContractFormData, step);

      return {
        ...prev,
        currentStep: step,
        canGoPrev: step > 0,
        canGoNext: derived.canGoNext,
        isComplete: step === TOTAL_STEPS - 1,
        visitedSteps,
        formData: derived.formData,
        completeness: derived.completeness,
      };
    });
  }, []);

  // 리셋 (모달 확인 후 호출)
  const reset = useCallback(() => {
    setState({
      currentStep: 0,
      formData: initialFormData,
      isComplete: false,
      canGoNext: false,
      canGoPrev: false,
      completeness: 0,
      visitedSteps: [0],
    });
  }, []);

  return {
    currentStep: state.currentStep,
    formData: state.formData,
    isComplete: state.isComplete,
    canGoNext: state.canGoNext,
    canGoPrev: state.canGoPrev,
    completeness: state.completeness,
    visitedSteps: state.visitedSteps,
    totalSteps: TOTAL_STEPS,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    reset, // 모달 확인 후 호출할 함수
  };
}
