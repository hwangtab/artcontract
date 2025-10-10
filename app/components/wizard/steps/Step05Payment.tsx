'use client';

import React, { useState, useMemo } from 'react';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import AIRecommendationBanner from '../../shared/AIRecommendationBanner';
import { formatCurrency, parseKoreanCurrency } from '@/lib/utils/currency-format';
import { WorkItem } from '@/types/contract';
import { PAYMENT_THRESHOLDS } from '@/lib/constants';

interface Step05Props {
  amount?: number;
  deposit?: number;
  onUpdate: (amount?: number, deposit?: number) => void;
  suggestedPriceRange?: { min: number; max: number };
  onAICoach?: (message: string) => void;
  workItems?: WorkItem[];
}

export default function Step05Payment({
  amount,
  deposit,
  onUpdate,
  suggestedPriceRange,
  onAICoach,
  workItems,
}: Step05Props) {
  const [amountInput, setAmountInput] = useState(amount ? amount.toString() : '');
  const [depositInput, setDepositInput] = useState(deposit ? deposit.toString() : '');
  const [lastCoachedBand, setLastCoachedBand] = useState<string | null>(null);

  const itemsTotal = useMemo(() => {
    if (!workItems || workItems.length === 0) return 0;
    return workItems.reduce((sum, item) => {
      const subtotal = item.subtotal ??
        (item.unitPrice !== undefined && item.quantity !== undefined
          ? item.unitPrice * item.quantity
          : undefined);
      return subtotal !== undefined ? sum + subtotal : sum;
    }, 0);
  }, [workItems]);

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    const numValue = parseKoreanCurrency(value);
    onUpdate(numValue, deposit);
  };

  const handleDepositChange = (value: string) => {
    setDepositInput(value);
    const numValue = parseKoreanCurrency(value);
    onUpdate(amount, numValue);
  };

  const setSuggestedAmount = (value: number) => {
    setAmountInput(value.toString());
    onUpdate(value, deposit);
  };

  const handleAmountBlur = () => {
    if (!onAICoach) return;

    const parsedAmount = parseInt(amountInput.replace(/[^\d]/g, ''), 10);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    let coachMessage = '';
    let band: string | null = null;

    if (parsedAmount < PAYMENT_THRESHOLDS.LOW) {
      coachMessage = `💡 ${formatCurrency(parsedAmount)}은 조금 낮은 금액이에요. 시간과 노력을 고려하면 최소 ${formatCurrency(PAYMENT_THRESHOLDS.LOW)} 이상 받으시는 걸 추천해요.`;
      band = '<50k';
    } else if (parsedAmount < PAYMENT_THRESHOLDS.DEPOSIT_MIN) {
      coachMessage = `👍 ${formatCurrency(parsedAmount)}이시군요! 적정한 금액이에요. 작업 시작 전에 일부를 선금으로 받으면 더 안전해요.`;
      band = '50-100k';
    } else if (parsedAmount < PAYMENT_THRESHOLDS.HIGH) {
      const recommendedDeposit = Math.floor(parsedAmount * 0.3);
      coachMessage = `💼 ${formatCurrency(parsedAmount)}! 계약금 ${formatCurrency(recommendedDeposit)}(30%)를 먼저 받으시는 걸 추천해요. 계약 이행을 보증하는 역할을 해요.`;
      band = '100k-1m';
    } else {
      coachMessage = `🏆 ${formatCurrency(parsedAmount)}! 고액 계약이에요. 법률 전문가 검토를 받는 걸 강력히 추천해요. 한국저작권위원회(02-2669-0100)에 무료 상담을 신청하세요!`;
      band = '>=1m';
    }

    if (!coachMessage) return;
    if (band && band === lastCoachedBand) return;

    onAICoach(coachMessage);
    setLastCoachedBand(band);
  };

  const handleApplyItemsTotal = () => {
    if (itemsTotal <= 0) return;
    setAmountInput(itemsTotal.toString());
    onUpdate(itemsTotal, deposit);
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
            type="text"
            value={amountInput}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            placeholder="예: 100만원, 50만, 500000"
            helper="'만원', '억원' 단위 사용 가능"
            required
          />
        </div>

        {itemsTotal > 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-primary-50 border border-primary-200 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm text-primary-700 font-medium">작업 항목 합계</p>
              <p className="text-lg font-semibold text-primary-600">{formatCurrency(itemsTotal)}</p>
              <p className="text-xs text-primary-500">Step02에서 입력한 항목 금액 기준</p>
            </div>
            <Button size="small" onClick={handleApplyItemsTotal}>
              합계 금액 적용
              {amount !== itemsTotal && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">변경됨</span>
              )}
            </Button>
          </div>
        )}

        {itemsTotal > 0 && amount !== undefined && amount !== itemsTotal && (
          <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">금액 불일치 경고</p>
                <p className="text-sm text-amber-800 mb-2">
                  현재 총액 <strong>{formatCurrency(amount)}</strong>이(가) 작업 항목 합계 <strong>{formatCurrency(itemsTotal)}</strong>와(과) 다릅니다.
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  항목별 금액이 변경되었다면 총액도 함께 업데이트하는 것을 권장합니다.
                </p>
                <Button
                  size="small"
                  variant="primary"
                  onClick={handleApplyItemsTotal}
                >
                  작업 항목 합계({formatCurrency(itemsTotal)})로 자동 업데이트
                </Button>
              </div>
            </div>
          </div>
        )}

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
              type="text"
              value={depositInput}
              onChange={handleDepositChange}
              placeholder="예: 30만원, 15만"
              helper={`${formatCurrency(Math.floor(amount * 0.3))} ~ ${formatCurrency(Math.floor(amount * 0.5))} 추천 / '만원', '억원' 사용 가능`}
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
