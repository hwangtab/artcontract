'use client';

import React from 'react';
import { ContractFormData } from '@/types/contract';
import { formatCurrency } from '@/lib/utils/currency-format';
import { formatDate } from '@/lib/utils/date-helpers';
import Button from '../../shared/Button';
import { CheckCircle, AlertCircle, Edit } from 'lucide-react';

interface Step08Props {
  formData: ContractFormData;
  onEdit: (step: number) => void;
  onGenerate: () => void;
}

export default function Step08FinalCheck({ formData, onEdit, onGenerate }: Step08Props) {
  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      design: '그림/디자인',
      photography: '사진/영상',
      writing: '글쓰기',
      music: '음악',
    };
    return labels[field] || field;
  };

  const getClientTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: '개인',
      small_business: '소상공인',
      enterprise: '기업',
      unknown: '미정',
    };
    return labels[type] || type;
  };

  const getScopeLabel = (scopes: string[]) => {
    const labels: Record<string, string> = {
      personal: '개인적',
      commercial: '상업적',
      online: '온라인',
      print: '인쇄물',
      unlimited: '무제한',
    };
    return scopes.map((s) => labels[s] || s).join(', ');
  };

  const getWorkItemsLabel = () => {
    if (!formData.workItems || formData.workItems.length === 0) return '단일 작업';
    // ✅ 타이틀이 없는 항목은 "미정"으로 표시
    return formData.workItems.map((item) => item.title || '미정').join(', ');
  };

  const summaryItems = [
    {
      label: '작업 분야',
      value: formData.field ? getFieldLabel(formData.field) : '미정',
      complete: !!formData.field,
      step: 1,
    },
    {
      label: '작업 내용',
      value: formData.workDescription || formData.workType || '미정',
      complete: !!(formData.workType || formData.workDescription),
      step: 2,
      isLongText: !!formData.workDescription && formData.workDescription.length > 50,
    },
    {
      label: '작업 항목',
      value: formData.workItems && formData.workItems.length > 0 ? getWorkItemsLabel() : '단일 작업',
      complete: !formData.workItems || formData.workItems.length > 0,
      step: 2,
      isLongText: !!formData.workItems && formData.workItems.length > 2,
    },
    {
      label: '클라이언트',
      value: formData.clientName || getClientTypeLabel(formData.clientType || 'unknown'),
      complete: !!formData.clientType,
      step: 3,
    },
    {
      label: '작업 기한',
      value: formData.timeline?.deadline ? formatDate(formData.timeline.deadline) : '미정',
      complete: !!formData.timeline?.deadline,
      step: 4,
    },
    {
      label: '금액',
      value: formData.payment?.amount ? formatCurrency(formData.payment.amount) : '미정',
      complete: !!formData.payment?.amount,
      step: 5,
    },
    {
      label: '수정 횟수',
      value:
        formData.revisions === 'unlimited'
          ? '무제한 ⚠️'
          : formData.revisions
          ? `${formData.revisions}회`
          : '미정',
      complete: formData.revisions !== null && formData.revisions !== undefined,
      step: 6,
    },
    {
      label: '사용 범위',
      value: formData.usageScope?.length ? getScopeLabel(formData.usageScope) : '미정',
      complete: formData.usageScope && formData.usageScope.length > 0,
      step: 7,
    },
  ];

  const completedItems = summaryItems.filter((item) => item.complete).length;
  const totalItems = summaryItems.length;
  const isFullyComplete = completedItems === totalItems && formData.riskLevel === 'low';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          마지막으로 확인할게요!
        </h2>
        <p className="text-gray-600">모든 정보가 정확한지 확인해주세요</p>
      </div>

      {/* Completeness Progress */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">🎯 완성도</h3>
          <span className="text-2xl font-bold text-primary-500">
            {Math.round((completedItems / totalItems) * 100)}%
          </span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
            style={{ width: `${(completedItems / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* Summary Items */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 mb-4">📋 입력하신 정보</h3>
        {summaryItems.map((item: any) => (
          <div
            key={item.label}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${
              item.complete ? 'border-gray-200 bg-white' : 'border-warning bg-warning/5'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {item.complete ? (
                <CheckCircle size={20} className="text-success flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-warning flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.label}</p>
                {item.isLongText ? (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {item.value}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{item.value}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onEdit(item.step)}
              className="flex items-center gap-1 text-primary-500 hover:text-primary-700 text-sm font-medium flex-shrink-0 ml-4"
            >
              <Edit size={16} />
              수정
            </button>
          </div>
        ))}
      </div>

      {/* Status Messages */}
      <div className="space-y-3">
        {isFullyComplete ? (
          <>
            <div className="p-4 bg-success/10 rounded-lg border border-success">
              <p className="font-medium text-success flex items-center gap-2">
                <CheckCircle size={20} />
                모든 필수 항목이 입력되었어요!
              </p>
            </div>
            <div className="p-4 bg-success/10 rounded-lg border border-success">
              <p className="font-medium text-success flex items-center gap-2">
                <CheckCircle size={20} />
                위험한 조건이 없어요!
              </p>
            </div>
            <div className="p-4 bg-success/10 rounded-lg border border-success">
              <p className="font-medium text-success flex items-center gap-2">
                <CheckCircle size={20} />
                안전한 계약서가 준비됐어요!
              </p>
            </div>
          </>
        ) : (
          <>
            {completedItems < totalItems && (
              <div className="p-4 bg-warning/10 rounded-lg border border-warning">
                <p className="font-medium text-warning-dark">
                  ⚠️ 아직 입력하지 않은 항목이 있어요
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  모든 항목을 입력하면 더 완성도 높은 계약서가 만들어져요!
                </p>
              </div>
            )}
            {formData.warnings && formData.warnings.length > 0 && (
              <div className="p-4 bg-danger/10 rounded-lg border border-danger">
                <p className="font-medium text-danger-dark">
                  🚨 위험 요소가 감지되었어요
                </p>
                <ul className="text-sm text-gray-700 mt-2 space-y-1">
                  {formData.warnings.slice(0, 3).map((warning) => (
                    <li key={warning.id}>• {warning.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* AI Suggestion (if applicable) */}
      {formData.payment?.amount && formData.payment.amount >= 100000 && !formData.payment?.deposit && (
        <div className="p-6 bg-primary-50 rounded-lg border border-primary-200">
          <h4 className="font-semibold text-primary-900 mb-2">💬 AI 최종 검토</h4>
          <p className="text-sm text-primary-800 mb-4">
            "계약금 30%를 먼저 받는 조항을 추가하시는 게 어떨까요?
            작업을 시작하기 전에 {formatCurrency(Math.floor((formData.payment.amount * 0.3)))}을 받으면 더 안전해요."
          </p>
          <div className="flex gap-3">
            <Button
              size="small"
              onClick={() => onEdit(5)}
            >
              좋아요, 계약금 설정하기
            </Button>
            <Button size="small" variant="secondary">
              괜찮아요
            </Button>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="pt-6 border-t border-gray-200">
        <Button
          fullWidth
          size="large"
          onClick={onGenerate}
          disabled={completedItems < 4}
        >
          {completedItems >= 4 ? '🎉 계약서 만들기' : '최소 4개 항목을 입력하세요'}
        </Button>
        {completedItems < 4 && (
          <p className="text-sm text-gray-600 text-center mt-2">
            분야, 작업내용, 클라이언트, 금액은 필수 항목이에요
          </p>
        )}
      </div>

      {/* Legal Disclaimer */}
      <div className="p-4 bg-gray-100 rounded-lg text-xs text-gray-600 text-center">
        ⚠️ 본 계약서는 참고용이며 법률 자문을 대체하지 않습니다.
        고액 계약(100만원 이상) 시 반드시 전문가와 상담하세요.
      </div>
    </div>
  );
}
