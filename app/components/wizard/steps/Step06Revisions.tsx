'use client';

import React, { useState } from 'react';
import Card from '../../shared/Card';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import WarningBanner from '../../shared/WarningBanner';
import AIRecommendationBanner from '../../shared/AIRecommendationBanner';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { WorkAnalysis } from '@/types/contract';

interface Step06Props {
  revisions?: number | 'unlimited' | null;
  additionalRevisionFee?: number;
  aiAnalysis?: WorkAnalysis | null;
  onUpdate: (revisions?: number | 'unlimited' | null, additionalFee?: number) => void;
  onAICoach?: (message: string) => void;
}

export default function Step06Revisions({
  revisions,
  additionalRevisionFee,
  aiAnalysis,
  onUpdate,
  onAICoach,
}: Step06Props) {
  // AI 추천 수정 횟수 계산
  const getRecommendedRevisions = () => {
    if (!aiAnalysis || !aiAnalysis.complexity) return null;

    switch (aiAnalysis.complexity) {
      case 'simple':
        return 2;
      case 'medium':
        return 3;
      case 'complex':
        return 5;
      default:
        return null;
    }
  };

  const recommendedRevisions = getRecommendedRevisions();
  const complexityLabel = {
    simple: '단순',
    medium: '중간',
    complex: '복잡'
  };
  const [showUnlimited, setShowUnlimited] = useState(revisions === 'unlimited');
  const [showCustomInput, setShowCustomInput] = useState(
    typeof revisions === 'number' && ![2, 3, 5].includes(revisions)
  );
  const [customValue, setCustomValue] = useState(
    typeof revisions === 'number' ? revisions.toString() : ''
  );
  const [feeInput, setFeeInput] = useState(
    additionalRevisionFee ? additionalRevisionFee.toString() : ''
  );

  const presetOptions = [
    { value: 2, label: '✌️ 2회', description: '간단한 작업에 적합' },
    { value: 3, label: '🖐️ 3회', description: '대부분 충분해요' },
    { value: 5, label: '🤚 5회', description: '안전한 범위' },
  ];

  const handlePresetSelect = (value: number) => {
    setShowUnlimited(false);
    setShowCustomInput(false);
    onUpdate(value, additionalRevisionFee);

    // AI 코칭
    if (onAICoach) {
      let coachMessage = '';
      if (value === 2) {
        coachMessage = '✌️ 2회 수정이시군요! 간단한 작업에 적합해요. 대폭 변경이 필요하면 별도 비용을 받으세요!';
      } else if (value === 3) {
        coachMessage = '🖐️ 3회 수정! 완벽한 선택이에요. 대부분의 경우 3회면 충분하고, 추가 수정은 회당 비용을 받으시면 돼요.';
      } else if (value === 5) {
        coachMessage = '🤚 5회 수정이시군요. 넉넉한 범위예요. 추가 수정 비용도 꼭 명시하세요!';
      }
      if (coachMessage) {
        onAICoach(coachMessage);
      }
    }
  };

  const handleCustomInput = () => {
    setShowCustomInput(true);
    setShowUnlimited(false);
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      onUpdate(num, additionalRevisionFee);
    }
  };

  const handleUnlimitedToggle = () => {
    if (showUnlimited) {
      setShowUnlimited(false);
      onUpdate(null, additionalRevisionFee);
    } else {
      setShowUnlimited(true);
      setShowCustomInput(false);
      onUpdate('unlimited', additionalRevisionFee);

      // AI 코칭 - 무제한 선택 시 강력 경고
      if (onAICoach) {
        onAICoach('🚨 무제한 수정은 정말 위험해요! 클라이언트가 끊임없이 수정을 요구해서 시간과 에너지를 다 소진할 수 있어요. 반드시 횟수를 제한하시고, 추가 수정은 별도 비용을 받으세요!');
      }
    }
  };

  const handleFeeChange = (value: string) => {
    setFeeInput(value);
    const num = parseInt(value.replace(/[^\d]/g, ''), 10);
    if (!isNaN(num)) {
      onUpdate(revisions, num);
    } else {
      onUpdate(revisions, undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          몇 번까지 수정해드리기로 하셨나요?
        </h2>
        <p className="text-gray-600">수정 횟수를 명확히 하면 무한 수정에 시달리지 않아요</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* AI 추천 배너 */}
        {recommendedRevisions && aiAnalysis && (
          <AIRecommendationBanner
            title="💡 AI 추천 수정 횟수"
            description={
              <>
                작업 복잡도가 <strong className="text-primary-600">{complexityLabel[aiAnalysis.complexity]}</strong>이므로,
                <strong className="text-primary-600 text-lg"> {recommendedRevisions}회</strong> 수정을 추천드려요.
              </>
            }
            actionLabel={`${recommendedRevisions}회로 자동 채우기`}
            onApply={() => handlePresetSelect(recommendedRevisions)}
            isApplied={revisions === recommendedRevisions}
          />
        )}

        {/* Preset Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presetOptions.map((option) => (
            <Card
              key={option.value}
              selected={revisions === option.value}
              onClick={() => handlePresetSelect(option.value)}
            >
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">
                  {option.label}
                </h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Custom Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card selected={showCustomInput} onClick={handleCustomInput}>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">🔢 직접 입력</h3>
              {showCustomInput && (
                <Input
                  type="number"
                  value={customValue}
                  onChange={handleCustomChange}
                  placeholder="숫자 입력"
                  helper="원하는 수정 횟수를 입력하세요"
                />
              )}
              {!showCustomInput && (
                <p className="text-sm text-gray-600">직접 횟수를 정할게요</p>
              )}
            </div>
          </Card>

          <Card selected={revisions === null} onClick={() => onUpdate(null, additionalRevisionFee)}>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">🤷 정하지 않음</h3>
              <p className="text-sm text-gray-600">나중에 협의할게요</p>
            </div>
          </Card>
        </div>

        {/* Unlimited Option - Danger */}
        <div
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
            showUnlimited
              ? 'border-danger bg-danger/10'
              : 'border-gray-300 hover:border-danger bg-white'
          }`}
          onClick={handleUnlimitedToggle}
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={showUnlimited}
              onChange={() => {}}
              className="mt-1 w-5 h-5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-danger" size={20} />
                <h3 className="text-lg font-semibold text-danger">무제한 수정</h3>
                <span className="text-danger font-bold">⚠️ 위험!</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                절대 추천하지 않아요! 클라이언트가 계속 수정을 요구해서 시간과 에너지를 다 소진할 수 있어요.
              </p>
            </div>
          </div>
        </div>

        {/* Unlimited Warning */}
        {showUnlimited && (
          <WarningBanner
            severity="danger"
            message="무제한 수정은 매우 위험합니다!"
            suggestion="반드시 횟수 제한을 두세요. 추가 수정은 회당 별도 비용을 받는 게 일반적이에요."
            dismissible={false}
          />
        )}

        {/* Additional Fee Input */}
        {typeof revisions === 'number' && revisions > 0 && (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">추가 수정 비용 (선택사항)</h3>
            <Input
              label="추가 수정 시 회당 비용"
              type="number"
              value={feeInput}
              onChange={handleFeeChange}
              placeholder="예: 100000"
              helper="정해진 횟수를 초과할 경우 받을 추가 비용"
            />
            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>팁:</strong> 보통 기본 금액의 10-20%를 추가 수정 비용으로 받아요.
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>실시간 조언:</strong> 로고 디자인은 보통 2-3번이면 충분해요. 대폭 변경이 필요한 경우는 새 작업으로 간주하고 별도 비용을 받으세요!
          </p>
        </div>
      </div>
    </div>
  );
}
