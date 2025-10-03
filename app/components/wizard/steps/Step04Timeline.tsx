'use client';

import React, { useState, useEffect } from 'react';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import WarningBanner from '../../shared/WarningBanner';
import { Calendar, Sparkles } from 'lucide-react';
import { isToday, isTomorrow, calculateDaysBetween } from '@/lib/utils/date-helpers';
import { WorkAnalysis } from '@/types/contract';

interface Step04Props {
  startDate?: Date;
  deadline?: Date;
  aiAnalysis?: WorkAnalysis | null;
  onUpdate: (startDate?: Date, deadline?: Date) => void;
  onAICoach?: (message: string) => void;
}

export default function Step04Timeline({ startDate, deadline, aiAnalysis, onUpdate, onAICoach }: Step04Props) {
  const [startInput, setStartInput] = useState(
    startDate ? startDate.toISOString().split('T')[0] : ''
  );
  const [deadlineInput, setDeadlineInput] = useState(
    deadline ? deadline.toISOString().split('T')[0] : ''
  );
  const [hasCoached, setHasCoached] = useState(false);

  useEffect(() => {
    setStartInput(startDate ? startDate.toISOString().split('T')[0] : '');
  }, [startDate]);

  useEffect(() => {
    setDeadlineInput(deadline ? deadline.toISOString().split('T')[0] : '');
  }, [deadline]);

  // AI 추천 마감일 계산
  const getRecommendedDeadline = () => {
    if (!aiAnalysis?.estimatedDays) return null;
    const recommended = new Date();
    recommended.setDate(recommended.getDate() + aiAnalysis.estimatedDays);
    return recommended;
  };

  const recommendedDeadline = getRecommendedDeadline();

  const handleAutoFillDeadline = () => {
    if (!recommendedDeadline) return;
    const dateString = recommendedDeadline.toISOString().split('T')[0];
    setDeadlineInput(dateString);
    onUpdate(startDate, recommendedDeadline);
  };

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

  const handleDeadlineBlur = () => {
    if (!deadline || hasCoached || !onAICoach) return;

    const today = new Date();
    const days = calculateDaysBetween(today, deadline);
    let coachMessage = '';

    if (isToday(deadline)) {
      coachMessage = '🚨 오늘 마감이요?! 정말 촉박해요! 이런 긴급 작업은 러시 비용(기본 금액의 50% 이상)을 꼭 받으세요. 건강도 챙기면서 일하세요!';
    } else if (isTomorrow(deadline)) {
      coachMessage = '⚠️ 내일 마감! 매우 촉박한 일정이에요. 러시 비용(30-50% 추가)을 받거나 기한 연장을 요청하세요!';
    } else if (days <= 3) {
      coachMessage = `⏰ ${days}일 안에 마감이에요! 촉박한 일정이니 러시 비용(20-30% 추가)을 받는 걸 추천해요.`;
    } else if (days <= 7) {
      coachMessage = `📅 일주일 이내 마감이군요. 약간 촉박한 일정이에요. 러시 비용(10-20% 추가)을 고려해보세요.`;
    } else if (days >= 30) {
      coachMessage = `📆 ${days}일간 진행되는 장기 프로젝트네요! 2주마다 중간 점검 일정을 넣고, 중도금을 받는 걸 추천해요.`;
    } else {
      coachMessage = `✅ ${days}일! 적정한 작업 기간이에요. 예상치 못한 문제를 고려해서 여유있게 일정을 잡으셨네요!`;
    }

    if (coachMessage) {
      onAICoach(coachMessage);
      setHasCoached(true);
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
        {/* AI 추천 마감일 배너 */}
        {aiAnalysis?.estimatedDays && recommendedDeadline && (
          <div className="p-5 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Sparkles className="text-primary-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">💡 AI 추천 마감일</h3>
                <p className="text-sm text-gray-700 mb-3">
                  작업 예상 소요 시간이 <strong className="text-primary-600">약 {aiAnalysis.estimatedDays}일</strong>이므로,
                  <strong className="text-primary-600 text-lg"> {recommendedDeadline.toLocaleDateString('ko-KR')}</strong> 마감을 추천드려요.
                </p>
                <Button
                  size="small"
                  onClick={handleAutoFillDeadline}
                  disabled={deadline?.toDateString() === recommendedDeadline.toDateString()}
                >
                  {deadline?.toDateString() === recommendedDeadline.toDateString()
                    ? '✓ 적용됨'
                    : `${recommendedDeadline.toLocaleDateString('ko-KR')}로 자동 채우기`}
                </Button>
              </div>
            </div>
          </div>
        )}

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
              onBlur={handleDeadlineBlur}
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
