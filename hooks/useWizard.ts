'use client';

import { useState, useCallback, useEffect } from 'react';
import { ContractFormData, EnhancedContractFormData } from '@/types/contract';
import { WizardState } from '@/types/wizard';
import { detectContractRisks } from '@/lib/contract/risk-detector';

const TOTAL_STEPS = 11;  // Step0 + 10단계 (저작권, 보호 조항 추가)

const initialFormData: EnhancedContractFormData = {
  currentStep: 0,  // Step0부터 시작
  completeness: 0,
  riskLevel: 'low',
  warnings: [],
  payment: {
    currency: 'KRW',
  },
};

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

      // 위험 감지 시스템 (통합) - currentStep 전달하여 단계별 경고 제어
      const detection = detectContractRisks(newFormData, prev.currentStep);

      // completeness, riskLevel, warnings 모두 한 번에 계산
      const completeness = detection.completeness;
      const riskLevel = detection.riskLevel === 'critical' ? 'high' : detection.riskLevel;
      const warnings = detection.warnings;

      // canGoNext 계산
      let canGoNext = false;
      switch (prev.currentStep) {
        case 0: // Step0: 작가 정보
          canGoNext = !!(newFormData.artistName && newFormData.artistContact);
          break;
        case 1: // Step1: 작업 분야
          // 새 방식: selectedSubFields가 있으면 그것 확인, 없으면 레거시 field 확인
          canGoNext = newFormData.selectedSubFields && newFormData.selectedSubFields.length > 0
            ? true
            : !!newFormData.field;
          break;
        case 2: // Step2: 작업 상세
          canGoNext = !!(
            newFormData.workDescription ||
            (newFormData.workItems && newFormData.workItems.length > 0)
          );
          break;
        case 3: // Step3: 클라이언트 정보
          canGoNext = !!newFormData.clientName;
          break;
        case 4: // Step4: 일정
          canGoNext = !!newFormData.timeline?.deadline;
          break;
        case 5: // Step5: 금액
          canGoNext = !!(newFormData.payment?.amount && newFormData.payment.amount > 0);
          break;
        case 6: // Step6: 수정 횟수
          canGoNext = newFormData.revisions !== null && newFormData.revisions !== undefined;
          break;
        case 7: // Step7: 저작권 (선택사항)
          canGoNext = true; // 선택사항이므로 항상 통과
          break;
        case 8: // Step8: 사용 범위
          canGoNext = !!(newFormData.usageScope && newFormData.usageScope.length > 0);
          break;
        case 9: // Step9: 보호 조항 (선택사항)
          canGoNext = true; // 선택사항이므로 항상 통과
          break;
        case 10: // Step10: 최종 확인
          canGoNext = true;
          break;
        default:
          canGoNext = false;
      }

      return {
        ...prev,
        formData: {
          ...newFormData,
          completeness,
          riskLevel,
          warnings,
        },
        completeness,
        canGoNext,
      };
    });
  }, []);

  // 다음 단계
  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= TOTAL_STEPS) return prev;

      const nextStep = prev.currentStep + 1;
      const visitedSteps = prev.visitedSteps.includes(nextStep)
        ? prev.visitedSteps
        : [...prev.visitedSteps, nextStep];

      return {
        ...prev,
        currentStep: nextStep,
        canGoPrev: true,
        canGoNext: nextStep < TOTAL_STEPS,
        isComplete: nextStep === TOTAL_STEPS,
        visitedSteps,
        formData: {
          ...prev.formData,
          currentStep: nextStep,
        },
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

      return {
        ...prev,
        currentStep: prevStep,
        canGoPrev: prevStep > 0,  // ✅ 이전 단계가 0보다 크면 true
        canGoNext: true,
        isComplete: false,
        formData: {
          ...prev.formData,
          currentStep: prevStep,
        },
      };
    });
  }, []);

  // 특정 단계로 이동
  const goToStep = useCallback((step: number) => {
    if (step < 0 || step > TOTAL_STEPS) return;

    setState((prev) => {
      const visitedSteps = prev.visitedSteps.includes(step)
        ? prev.visitedSteps
        : [...prev.visitedSteps, step];

      return {
        ...prev,
        currentStep: step,
        canGoPrev: step > 0,
        canGoNext: step < TOTAL_STEPS,
        isComplete: step === TOTAL_STEPS,
        visitedSteps,
        formData: {
          ...prev.formData,
          currentStep: step,
        },
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
