'use client';

import { useState, useCallback, useEffect } from 'react';
import { ContractFormData, EnhancedContractFormData } from '@/types/contract';
import { WizardState } from '@/types/wizard';
import { calculateCompleteness, assessRiskLevel, generateWarnings } from '@/lib/contract/validator';
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

      // 완성도 계산
      const completeness = calculateCompleteness(newFormData);

      // 위험 수준 평가 (기존 + Enhanced)
      const basicRiskLevel = assessRiskLevel(newFormData);
      const enhancedRiskDetection = detectContractRisks(newFormData);

      // Enhanced 위험 수준이 더 높으면 사용
      const riskLevel =
        enhancedRiskDetection.riskLevel === 'critical' ? 'high' :
        enhancedRiskDetection.riskLevel === 'high' ? 'high' :
        enhancedRiskDetection.riskLevel === 'medium' ? 'medium' :
        basicRiskLevel;

      // 경고 생성 (기존 + Enhanced)
      const basicWarnings = generateWarnings(newFormData);
      const enhancedWarnings = enhancedRiskDetection.warnings;
      const warnings = [...basicWarnings, ...enhancedWarnings];

      // canGoNext 계산
      let canGoNext = false;
      switch (prev.currentStep) {
        case 0: // Step0: 작가 정보
          canGoNext = !!(newFormData.artistName && newFormData.artistContact);
          break;
        case 1: // Step1: 작업 분야
          canGoNext = !!newFormData.field;
          break;
        case 2: // Step2: 작업 상세
          canGoNext = !!newFormData.workDescription;
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
  const prevStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep <= 1) return prev;

      const prevStep = prev.currentStep - 1;

      return {
        ...prev,
        currentStep: prevStep,
        canGoPrev: prevStep > 1,
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
    if (step < 1 || step > TOTAL_STEPS) return;

    setState((prev) => {
      const visitedSteps = prev.visitedSteps.includes(step)
        ? prev.visitedSteps
        : [...prev.visitedSteps, step];

      return {
        ...prev,
        currentStep: step,
        canGoPrev: step > 1,
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

  // 리셋
  const reset = useCallback(() => {
    setState({
      currentStep: 1,
      formData: initialFormData,
      isComplete: false,
      canGoNext: true,
      canGoPrev: false,
      completeness: 0,
      visitedSteps: [1],
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
    reset,
  };
}
