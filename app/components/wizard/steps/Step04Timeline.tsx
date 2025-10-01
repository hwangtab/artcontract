'use client';

import React, { useState } from 'react';
import Input from '../../shared/Input';
import WarningBanner from '../../shared/WarningBanner';
import { Calendar } from 'lucide-react';
import { isToday, isTomorrow, calculateDaysBetween } from '@/lib/utils/date-helpers';

interface Step04Props {
  startDate?: Date;
  deadline?: Date;
  onUpdate: (startDate?: Date, deadline?: Date) => void;
}

export default function Step04Timeline({ startDate, deadline, onUpdate }: Step04Props) {
  const [startInput, setStartInput] = useState(
    startDate ? startDate.toISOString().split('T')[0] : ''
  );
  const [deadlineInput, setDeadlineInput] = useState(
    deadline ? deadline.toISOString().split('T')[0] : ''
  );

  const handleStartChange = (value: string) => {
    setStartInput(value);
    if (value) {
      const date = new Date(value);
      onUpdate(date, deadline);
    } else {
      onUpdate(undefined, deadline);
    }
  };

  const handleDeadlineChange = (value: string) => {
    setDeadlineInput(value);
    if (value) {
      const date = new Date(value);
      onUpdate(startDate, date);
    } else {
      onUpdate(startDate, undefined);
    }
  };

  const getDeadlineWarning = () => {
    if (!deadline) return null;

    const today = new Date();
    const days = calculateDaysBetween(today, deadline);

    if (isToday(deadline)) {
      return {
        severity: 'danger' as const,
        message: '오늘 마감은 너무 촉박해요! 🚨',
        suggestion: '이런 긴급한 일정에는 러시 비용(기본 금액의 20-50% 추가)을 받으세요.',
      };
    } else if (isTomorrow(deadline)) {
      return {
        severity: 'danger' as const,
        message: '내일 마감은 매우 촉박해요!',
        suggestion: '러시 비용을 받거나 기한을 연장하는 것을 권장해요.',
      };
    } else if (days <= 7) {
      return {
        severity: 'warning' as const,
        message: '일주일 이내 마감이에요',
        suggestion: '촉박한 일정이면 러시 비용(10-30% 추가)을 받는 게 좋아요.',
      };
    } else if (days >= 30) {
      return {
        severity: 'info' as const,
        message: '장기 프로젝트네요',
        suggestion: '중간 점검 일정을 넣으면 좋아요. 예: 2주마다 진행 상황 확인',
      };
    }

    return null;
  };

  const warning = getDeadlineWarning();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">작업 기한은 언제까지인가요?</h2>
        <p className="text-gray-600">충분한 작업 시간을 확보하는 게 중요해요</p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={18} />
              시작일 (선택사항)
            </label>
            <input
              type="date"
              value={startInput}
              onChange={(e) => handleStartChange(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-sm text-gray-500 mt-1">작업을 시작하는 날짜</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={18} />
              마감일 *
            </label>
            <input
              type="date"
              value={deadlineInput}
              onChange={(e) => handleDeadlineChange(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            />
            <p className="text-sm text-gray-500 mt-1">작업 완료 및 납품 날짜</p>
          </div>
        </div>

        {startDate && deadline && (
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="font-medium text-primary-900">
              작업 기간: {calculateDaysBetween(startDate, deadline)}일
            </p>
            <p className="text-sm text-primary-800 mt-1">
              {new Date(startDate).toLocaleDateString('ko-KR')} ~{' '}
              {new Date(deadline).toLocaleDateString('ko-KR')}
            </p>
          </div>
        )}

        {warning && (
          <WarningBanner
            severity={warning.severity}
            message={warning.message}
            suggestion={warning.suggestion}
            dismissible={warning.severity === 'info'}
          />
        )}

        {!deadline && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>주의:</strong> 마감일이 없으면 작업이 무한정 늦어질 수 있어요. 반드시 마감일을 정하세요!
            </p>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>팁:</strong> 예상보다 여유있게 기한을 잡는 게 안전해요. 수정이나 예상치 못한 문제를 고려하세요!
          </p>
        </div>
      </div>
    </div>
  );
}
