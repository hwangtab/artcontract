'use client';

import { useState, useCallback, useEffect } from 'react';
import { ContractFormData } from '@/types/contract';
import { WizardState } from '@/types/wizard';
import { calculateCompleteness, assessRiskLevel, generateWarnings } from '@/lib/contract/validator';

const TOTAL_STEPS = 8;

const initialFormData: ContractFormData = {
  currentStep: 1,
  completeness: 0,
  riskLevel: 'low',
  warnings: [],
  payment: {
    currency: 'KRW',
  },
};

export function useWizard() {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    formData: initialFormData,
    isComplete: false,
    canGoNext: true,
    canGoPrev: false,
    completeness: 0,
    visitedSteps: [1],
  });

  // 폼 데이터 업데이트
  const updateFormData = useCallback((updates: Partial<ContractFormData>) => {
    setState((prev) => {
      const newFormData = { ...prev.formData, ...updates };

      // 완성도 계산
      const completeness = calculateCompleteness(newFormData);

      // 위험 수준 평가
      const riskLevel = assessRiskLevel(newFormData);

      // 경고 생성
      const warnings = generateWarnings(newFormData);

      return {
        ...prev,
        formData: {
          ...newFormData,
          completeness,
          riskLevel,
          warnings,
        },
        completeness,
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
