'use client';

import React, { useState } from 'react';
import Card from '../../shared/Card';
import Button from '../../shared/Button';
import { Globe, Printer, ShoppingBag, Users, Lock, Sparkles } from 'lucide-react';
import { UsageScope, WorkAnalysis } from '@/types/contract';

interface Step07Props {
  usageScope?: UsageScope[];
  commercialUse?: boolean;
  exclusiveRights?: boolean;
  aiAnalysis?: WorkAnalysis | null;
  onUpdate: (data: { usageScope?: UsageScope[]; commercialUse?: boolean; exclusiveRights?: boolean }) => void;
}

const usageOptions = [
  {
    id: 'personal' as UsageScope,
    label: '👤 개인적 사용',
    description: '비상업적, 개인 용도',
    icon: Users,
    price: 'low',
  },
  {
    id: 'commercial' as UsageScope,
    label: '💼 상업적 사용',
    description: '광고, 판매, 수익 창출',
    icon: ShoppingBag,
    price: 'high',
  },
  {
    id: 'online' as UsageScope,
    label: '🌐 온라인 사용',
    description: '웹사이트, SNS, 디지털',
    icon: Globe,
    price: 'medium',
  },
  {
    id: 'print' as UsageScope,
    label: '🖨️ 인쇄물 사용',
    description: '전단지, 명함, 포스터',
    icon: Printer,
    price: 'medium',
  },
];

export default function Step07UsageScope({
  usageScope = [],
  commercialUse = false,
  exclusiveRights = false,
  aiAnalysis,
  onUpdate,
}: Step07Props) {
  const areScopesEqual = (a: UsageScope[], b: UsageScope[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((value, idx) => value === sortedB[idx]);
  };

  const getUsageScopeLabel = (scope: UsageScope) => {
    switch (scope) {
      case 'personal':
        return '👤 개인적 사용';
      case 'commercial':
        return '💼 상업적 사용';
      case 'online':
        return '🌐 온라인 사용';
      case 'print':
        return '🖨️ 인쇄물 사용';
      default:
        return scope;
    }
  };

  const toggleScope = (scopeId: UsageScope) => {
    let newScope: UsageScope[];

    if (usageScope.includes(scopeId)) {
      newScope = usageScope.filter((s) => s !== scopeId);
    } else {
      newScope = [...usageScope, scopeId];
    }

    // 상업적 사용 자동 감지
    const isCommercial = newScope.includes('commercial');

    onUpdate({
      usageScope: newScope,
      commercialUse: isCommercial,
      exclusiveRights,
    });
  };

  const toggleCommercial = () => {
    let newScope: UsageScope[];

    if (!commercialUse) {
      // ✅ 불변성 유지: push 대신 spread 사용
      if (!usageScope.includes('commercial')) {
        newScope = [...usageScope, 'commercial'];
      } else {
        newScope = usageScope;
      }
      onUpdate({ usageScope: newScope, commercialUse: true, exclusiveRights });
    } else {
      newScope = usageScope.filter((s) => s !== 'commercial');
      onUpdate({ usageScope: newScope, commercialUse: false, exclusiveRights });
    }
  };

  const toggleExclusive = () => {
    onUpdate({ usageScope, commercialUse, exclusiveRights: !exclusiveRights });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          작품을 어떻게 사용하시나요?
        </h2>
        <p className="text-gray-600">사용 범위를 명확히 하면 저작권을 보호할 수 있어요</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* AI 추천 배너 */}
        {aiAnalysis && aiAnalysis.usageScope && aiAnalysis.usageScope.length > 0 && (
          <div className="p-5 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Sparkles className="text-primary-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">💡 AI 추천 사용 범위</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {aiAnalysis.usageScope.map((scope) => (
                    <span key={scope} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-primary-600 border border-primary-200">
                      {getUsageScopeLabel(scope)}
                    </span>
                  ))}
                </div>
                <Button
                  size="small"
                  onClick={() => {
                    const isCommercial = aiAnalysis.usageScope.includes('commercial');
                    onUpdate({
                      usageScope: aiAnalysis.usageScope,
                      commercialUse: isCommercial,
                      exclusiveRights
                    });
                  }}
                  disabled={areScopesEqual(usageScope, aiAnalysis.usageScope)}
                >
                  {areScopesEqual(usageScope, aiAnalysis.usageScope) ? '✓ 적용됨' : '이 정보로 자동 채우기'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Scope Selection */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">사용 범위 선택 (복수 선택 가능)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usageOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = usageScope.includes(option.id);

              return (
                <Card
                  key={option.id}
                  selected={isSelected}
                  onClick={() => toggleScope(option.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        isSelected ? 'bg-primary-100' : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        size={24}
                        className={isSelected ? 'text-primary-500' : 'text-gray-600'}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                      {option.price === 'high' && (
                        <p className="text-xs text-warning mt-1">💰 비용이 더 높아야 해요</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Commercial Use Warning */}
        {commercialUse && (
          <div className="p-4 bg-warning/10 rounded-lg border border-warning">
            <p className="font-medium text-warning-dark">
              💼 <strong>상업적 사용:</strong> 광고나 판매 목적이면 기본 금액보다 2-3배 높게 책정하세요!
            </p>
            <p className="text-sm text-gray-700 mt-2">
              상업적 사용권은 개인 사용보다 훨씬 가치가 높아요. 클라이언트가 수익을 창출하는 만큼, 더 많은 대가를 받을 권리가 있어요.
            </p>
          </div>
        )}

        {/* Additional Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">추가 옵션</h3>

          {/* Exclusive Rights */}
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              exclusiveRights
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
            onClick={toggleExclusive}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={exclusiveRights}
                onChange={() => {}}
                className="mt-1 w-5 h-5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Lock size={18} className={exclusiveRights ? 'text-primary-500' : 'text-gray-600'} />
                  <h4 className="font-semibold">독점 사용권</h4>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  클라이언트만 사용할 수 있어요. 다른 곳에서는 사용할 수 없어요.
                </p>
                {exclusiveRights && (
                  <p className="text-sm text-warning mt-2">
                    💰 독점권은 금액을 2-5배 높게 책정해야 해요!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Portfolio Rights */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">✅ 포트폴리오 사용권</h4>
            <p className="text-sm text-blue-800">
              여러분의 포트폴리오에 사용할 권리는 반드시 계약서에 포함하세요!
              "작가는 본 작업물을 자신의 포트폴리오로 사용할 수 있다"는 조항이 필요해요.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>팁:</strong> 저작권은 기본적으로 창작자(여러분)에게 있어요.
            클라이언트는 계약서에 명시된 범위 내에서만 사용할 수 있어요.
            저작권 양도는 신중하게 결정하세요!
          </p>
        </div>
      </div>
    </div>
  );
}
