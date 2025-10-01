'use client';

import React, { useState, useEffect } from 'react';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import WarningBanner from '../../shared/WarningBanner';
import { formatCurrency } from '@/lib/utils/currency-format';

interface Step05Props {
  amount?: number;
  deposit?: number;
  onUpdate: (amount?: number, deposit?: number) => void;
  suggestedPriceRange?: { min: number; max: number };
}

export default function Step05Payment({
  amount,
  deposit,
  onUpdate,
  suggestedPriceRange,
}: Step05Props) {
  const [amountInput, setAmountInput] = useState(amount ? amount.toString() : '');
  const [depositInput, setDepositInput] = useState(deposit ? deposit.toString() : '');
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!amount || amount === 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [amount]);

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
    }
  };

  const setSuggestedAmount = (value: number) => {
    setAmountInput(value.toString());
    onUpdate(value, deposit);
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
            placeholder="500000"
            helper="원 단위로 입력하세요"
            required
          />
        </div>

        {suggestedPriceRange && (
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="font-medium text-primary-900 mb-3">💡 AI 추천 금액</p>
            <p className="text-sm text-primary-800 mb-3">
              비슷한 작업은 보통 {formatCurrency(suggestedPriceRange.min)} ~ {formatCurrency(suggestedPriceRange.max)}이에요
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="small"
                variant="secondary"
                onClick={() => setSuggestedAmount(suggestedPriceRange.min)}
              >
                {formatCurrency(suggestedPriceRange.min)}로 채우기
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setSuggestedAmount(Math.floor((suggestedPriceRange.min + suggestedPriceRange.max) / 2))}
              >
                {formatCurrency(Math.floor((suggestedPriceRange.min + suggestedPriceRange.max) / 2))}로 채우기
              </Button>
            </div>
          </div>
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

        {showWarning && (
          <WarningBanner
            severity="danger"
            message="금액이 정해지지 않았어요!"
            suggestion="금액 없이 일을 시작하면 나중에 분쟁 위험이 정말 높아요. 최소한 대략적인 금액이라도 정하세요."
            dismissible={false}
          />
        )}
      </div>
    </div>
  );
}
