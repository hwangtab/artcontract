'use client';

import { useEffect, useRef, useCallback } from 'react';
import { EnhancedContractFormData } from '@/types/contract';

type ProactiveSeverity = 'info' | 'warning' | 'danger';

interface UseProactiveAlertsParams {
  currentStep: number;
  formData: EnhancedContractFormData;
  addProactiveMessage: (content: string, severity: ProactiveSeverity) => void;
}

export function useProactiveAlerts({ currentStep, formData, addProactiveMessage }: UseProactiveAlertsParams) {
  const shownStepTipsRef = useRef<Set<number>>(new Set());
  const shownWarningsRef = useRef<Set<string>>(new Set());

  const registerWarning = useCallback(
    (id: string, message: string, severity: ProactiveSeverity) => {
      if (shownWarningsRef.current.has(id)) {
        return;
      }

      addProactiveMessage(message, severity);
      shownWarningsRef.current.add(id);
    },
    [addProactiveMessage]
  );

  useEffect(() => {
    const stepTips: Record<number, string> = {
      0: '👤 안녕하세요! 먼저 작가님의 정보를 입력해주세요. 계약서의 "을"이 됩니다.',
      1: '💡 작업 분야를 선택하시면 맞춤형 계약서 템플릿을 제공해드려요!',
      2: '🎨 작업 내용을 자세히 설명할수록 AI가 정확한 금액과 조건을 추천할 수 있어요.',
      3: '👥 클라이언트가 개인인지, 소상공인인지, 기업인지에 따라 계약 조건이 달라져요.',
      4: '📅 마감일이 너무 촉박하면 러시 추가 요금을 받는 것을 추천드려요!',
      5: '💰 금액이 100만원 이상이면 변호사 검토를 추천해요. 계약금은 30-50%가 적당해요.',
      6: '🔄 무제한 수정은 절대 금물! 2-3회가 적당하고, 추가 수정비를 명시하세요.',
      7: '⚖️ 저작권 관리는 선택사항이지만, 고액 계약(100만원 이상)이면 반드시 설정하세요! 저작인격권은 절대 양도할 수 없어요.',
      8: '🌐 상업적 사용권은 개인 사용보다 2-3배 높게 책정하세요. 독점권은 5배까지도 가능해요!',
      9: '🛡️ 보호 조항은 선택사항이지만, 크레딧 명기와 수정 권리는 반드시 추가하세요! 포트폴리오 사용과 저작인격권 보호에 중요합니다.',
      10: '✅ 최종 확인 단계예요. 빠진 내용이 없는지 꼼꼼히 확인하세요!',
    };

    const tip = stepTips[currentStep];
    if (!tip || shownStepTipsRef.current.has(currentStep)) {
      return;
    }

    const timer = setTimeout(() => {
      addProactiveMessage(tip, 'info');
      shownStepTipsRef.current.add(currentStep);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [currentStep, addProactiveMessage]);

  useEffect(() => {
    const amount = formData.payment?.amount;

    if (currentStep >= 5 && amount !== undefined) {
      if (amount === 0) {
        registerWarning(
          `payment_${amount}`,
          '⚠️ 위험! 금액이 0원으로 설정되었어요. 무료로 작업하시는 건가요? 최소한 작업 비용은 받으셔야 해요!',
          'danger'
        );
      } else if (amount > 0 && amount < 50000) {
        registerWarning(
          `payment_${amount}`,
          '💡 금액이 너무 낮은 것 같아요. 시간과 노력을 고려하면 최소 5만원 이상 받으시는 걸 추천해요.',
          'warning'
        );
      } else if (amount >= 1000000) {
        registerWarning(
          `payment_${amount}`,
          '💼 100만원 이상 고액 계약이에요! 법률 전문가의 검토를 받는 것을 강력히 추천드려요.',
          'warning'
        );
      }
    }

    if (currentStep >= 6 && formData.revisions !== undefined && formData.revisions !== null) {
      if (typeof formData.revisions === 'number') {
        if (formData.revisions === 0) {
          registerWarning(
            `revisions_${formData.revisions}`,
            '⚠️ 수정 0회는 너무 위험해요! 클라이언트가 결과물에 불만이 있어도 수정할 수 없다는 뜻이에요. 최소 1-2회는 보장하세요.',
            'danger'
          );
        } else if (formData.revisions >= 10) {
          registerWarning(
            `revisions_${formData.revisions}`,
            '⚠️ 위험! 수정 횟수가 너무 많아요. 무제한 작업에 빠질 수 있어요. 2-3회가 적당하고, 추가 수정비를 명시하세요!',
            'danger'
          );
        }
      } else if (formData.revisions === 'unlimited') {
        registerWarning(
          'revisions_unlimited',
          '🚨 무제한 수정은 절대 금물! 끝없는 수정 요청에 시달릴 수 있어요. 반드시 횟수를 정하세요!',
          'danger'
        );
      }
    }

    if (currentStep >= 4 && formData.timeline?.deadline) {
      const deadline = new Date(formData.timeline.deadline);
      const today = new Date();
      const daysUntilDeadline = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= 1) {
        registerWarning(
          `deadline_${daysUntilDeadline}`,
          '🚨 급함! 마감일이 오늘 또는 내일이에요. 이렇게 촉박한 일정이면 러시 추가 요금(50-100%)을 반드시 받으세요!',
          'danger'
        );
      } else if (daysUntilDeadline <= 3) {
        registerWarning(
          `deadline_${daysUntilDeadline}`,
          '⚠️ 마감일이 3일 이내예요. 촉박한 일정이면 러시 요금을 청구하는 걸 추천드려요.',
          'warning'
        );
      }
    }

    if (currentStep >= 8 && formData.commercialUse && amount) {
      const suggestedMin = formData.aiAnalysis?.suggestedPriceRange?.min ?? 0;

      if (amount < suggestedMin * 1.5) {
        registerWarning(
          `commercial_${amount}`,
          '💼 상업적 사용 계약이에요! 개인 사용보다 최소 2배 이상 받으셔야 공정해요.',
          'warning'
        );
      }
    }

    if (currentStep >= 8 && formData.exclusiveRights && amount) {
      const suggestedMin = formData.aiAnalysis?.suggestedPriceRange?.min ?? 0;

      if (amount < suggestedMin * 2) {
        registerWarning(
          `exclusive_${amount}`,
          '🔒 독점권 계약이에요! 일반 계약보다 3-5배 높게 받으셔야 해요. 다른 곳에서 못 쓰는 만큼 보상받으세요!',
          'danger'
        );
      }
    }
  }, [currentStep, formData, registerWarning]);

}
