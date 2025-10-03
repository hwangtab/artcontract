'use client';

import React, { useState } from 'react';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import AIRecommendationBanner from '../../shared/AIRecommendationBanner';
import { formatCurrency } from '@/lib/utils/currency-format';

interface Step05Props {
  amount?: number;
  deposit?: number;
  onUpdate: (amount?: number, deposit?: number) => void;
  suggestedPriceRange?: { min: number; max: number };
  onAICoach?: (message: string) => void;
}

export default function Step05Payment({
  amount,
  deposit,
  onUpdate,
  suggestedPriceRange,
  onAICoach,
}: Step05Props) {
  const [amountInput, setAmountInput] = useState(amount ? amount.toString() : '');
  const [depositInput, setDepositInput] = useState(deposit ? deposit.toString() : '');
  const [hasCoached, setHasCoached] = useState(false);

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    const numValue = parseInt(value.replace(/[^\d]/g, ''), 10);
    if (!isNaN(numValue)) {
      onUpdate(numValue, deposit);
    } else {
      onUpdate(undefined, deposit);
    }
  };

  const handleDepositChange = (value: string) => {
    setDepositInput(value);
    const numValue = parseInt(value.replace(/[^\d]/g, ''), 10);
    if (!isNaN(numValue)) {
      onUpdate(amount, numValue);
    } else {
      onUpdate(amount, undefined);
    }
  };

  const setSuggestedAmount = (value: number) => {
    setAmountInput(value.toString());
    onUpdate(value, deposit);
  };

  const handleAmountBlur = () => {
    if (!amount || hasCoached || !onAICoach) return;

    let coachMessage = '';

    if (amount === 0) {
      coachMessage = '💰 0원은 안 돼요! 무료 작업이더라도 최소 금액(1만원)을 명시해야 법적 보호를 받을 수 있어요.';
    } else if (amount > 0 && amount < 50000) {
      coachMessage = `💡 ${formatCurrency(amount)}은 조금 낮은 금액이에요. 시간과 노력을 고려하면 최소 5만원 이상 받으시는 걸 추천해요.`;
    } else if (amount >= 50000 && amount < 100000) {
      coachMessage = `👍 ${formatCurrency(amount)}이시군요! 적정한 금액이에요. 작업 시작 전에 일부를 선금으로 받으면 더 안전해요.`;
    } else if (amount >= 100000 && amount < 1000000) {
      const recommendedDeposit = Math.floor(amount * 0.3);
      coachMessage = `💼 ${formatCurrency(amount)}! 계약금 ${formatCurrency(recommendedDeposit)}(30%)를 먼저 받으시는 걸 추천해요. 계약 이행을 보증하는 역할을 해요.`;
    } else if (amount >= 1000000) {
      coachMessage = `🏆 ${formatCurrency(amount)}! 고액 계약이에요. 법률 전문가 검토를 받는 걸 강력히 추천해요. 한국저작권위원회(02-2669-0100)에 무료 상담을 신청하세요!`;
    }

    if (coachMessage) {
      onAICoach(coachMessage);
      setHasCoached(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">얼마 받기로 하셨나요?</h2>
        <p className="text-gray-600">금액은 계약서에서 가장 중요한 부분이에요</p>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <Input
            label="💰 작업 금액"
            type="number"
            value={amountInput}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            placeholder="500000"
            helper="원 단위로 입력하세요"
            required
          />
        </div>

        {suggestedPriceRange && (
          <AIRecommendationBanner
            title="💡 AI 추천 금액"
            description={
              <>
                비슷한 작업은 보통 <strong className="text-primary-600">{formatCurrency(suggestedPriceRange.min)} ~ {formatCurrency(suggestedPriceRange.max)}</strong>이에요.
                <br />
                <strong className="text-primary-600 text-lg">{formatCurrency(Math.floor((suggestedPriceRange.min + suggestedPriceRange.max) / 2))}</strong> (중간값)를 추천드려요.
              </>
            }
            actionLabel={`${formatCurrency(Math.floor((suggestedPriceRange.min + suggestedPriceRange.max) / 2))}로 자동 채우기`}
            onApply={() => setSuggestedAmount(Math.floor((suggestedPriceRange.min + suggestedPriceRange.max) / 2))}
            isApplied={amount === Math.floor((suggestedPriceRange.min + suggestedPriceRange.max) / 2)}
          />
        )}

        {amount && amount >= 100000 && (
          <div>
            <Input
              label="계약금 (선금)"
              type="number"
              value={depositInput}
              onChange={handleDepositChange}
              placeholder="30-50% 추천"
              helper={`${formatCurrency(Math.floor(amount * 0.3))} ~ ${formatCurrency(Math.floor(amount * 0.5))} 추천`}
            />
          </div>
        )}

        {!amount && amountInput === '' && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>팁:</strong> 금액은 계약서에서 가장 중요한 부분이에요. 시장 가격을 참고해서 적정한 금액을 정하세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
