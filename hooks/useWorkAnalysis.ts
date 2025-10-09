'use client';

import { useState, useCallback } from 'react';
import { WorkAnalysis, ArtField } from '@/types/contract';
import { API_PATHS, TIMEOUTS } from '@/lib/constants';

interface UseWorkAnalysisReturn {
  isAnalyzing: boolean;
  error: string | null;
  analysisResult: WorkAnalysis | null;
  analyze: (description: string) => Promise<WorkAnalysis | null>;
  clearError: () => void;
  clearResult: () => void;
}

export function useWorkAnalysis(field: ArtField): UseWorkAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<WorkAnalysis | null>(null);

  const analyze = useCallback(
    async (description: string): Promise<WorkAnalysis | null> => {
      if (!description.trim()) {
        setError('작업 내용을 입력해주세요.');
        return null;
      }

      setIsAnalyzing(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.API_ANALYZE);

      try {
        const response = await fetch(API_PATHS.ANALYZE_WORK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field,
            userInput: description.trim(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`AI 분석 실패 (${response.status})`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setAnalysisResult(data.data);
          return data.data;
        }

        throw new Error(data.error?.message || 'AI 분석 결과를 처리할 수 없습니다.');
      } catch (err: any) {
        clearTimeout(timeoutId);

        let errorMessage = 'AI 분석 중 오류가 발생했어요. 다시 시도해주세요.';

        if (err.name === 'AbortError') {
          errorMessage = '⏱️ AI 분석 시간이 초과되었어요. 네트워크를 확인하고 다시 시도해주세요.';
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Work analysis error:', err);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [field]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setAnalysisResult(null);
  }, []);

  return {
    isAnalyzing,
    error,
    analysisResult,
    analyze,
    clearError,
    clearResult,
  };
}
