'use client';

import React, { useState } from 'react';
import Card from '../../shared/Card';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import LoadingSpinner from '../../shared/LoadingSpinner';
import Toast from '../../shared/Toast';
import ErrorBanner from '../../shared/ErrorBanner';
import { ArtField, WorkAnalysis } from '@/types/contract';
import { Sparkles, Check, AlertTriangle } from 'lucide-react';

interface Step02Props {
  field: ArtField;
  workType?: string;
  workDescription?: string;
  aiAnalysis?: WorkAnalysis;
  onSelect: (workType: string, description?: string, analysis?: WorkAnalysis) => void;
}

export default function Step02WorkDetail({
  field,
  workType,
  workDescription,
  aiAnalysis,
  onSelect,
}: Step02Props) {
  const [userInput, setUserInput] = useState(workDescription || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WorkAnalysis | null>(aiAnalysis || null);
  const [showQuickOptions, setShowQuickOptions] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const quickExamples: Record<ArtField, string[]> = {
    design: ['카페 로고 디자인', '웨딩 초대장 디자인', 'SNS 홍보 이미지', '명함 디자인'],
    photography: ['프로필 사진 촬영', '제품 촬영', '웨딩 스냅', '행사 사진'],
    video: ['유튜브 영상 편집', '제품 홍보 영상', '웨딩 영상', '모션그래픽 제작'],
    writing: ['블로그 포스팅', '광고 카피', 'SNS 콘텐츠', '보도자료 작성'],
    music: ['카페 배경음악', '유튜브 인트로 음악', '광고 배경음악', '게임 BGM'],
    voice: ['광고 내레이션', '유튜브 영상 성우', '오디오북 녹음', '캐릭터 더빙'],
    translation: ['웹사이트 한영 번역', '영상 자막 번역', '제품 설명서 번역', '문서 통번역'],
    other: ['작업 내용을 자유롭게 입력하세요'],
  };

  const handleAIAnalysis = async () => {
    if (!userInput.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          userInput: userInput.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const result: WorkAnalysis = data.data;
        setAnalysisResult(result);
        setShowErrorBanner(false);
        onSelect(result.workType || userInput.trim(), userInput.trim(), result);
      } else {
        // AI 실패 시 ErrorBanner 표시
        setErrorMessage('AI 분석에 실패했어요. 네트워크 상태를 확인하고 다시 시도해주세요.');
        setShowErrorBanner(true);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      // AI 실패 시 ErrorBanner 표시
      setErrorMessage('AI 분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
      setShowErrorBanner(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickSelect = (example: string) => {
    setUserInput(example);
    setShowQuickOptions(false);
  };

  const fieldLabels: Record<ArtField, string> = {
    design: '그림/디자인',
    photography: '사진',
    video: '영상',
    writing: '글쓰기',
    music: '음악',
    voice: '성우/더빙',
    translation: '번역',
    other: '기타',
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">정확히 어떤 작업을 하시나요?</h2>
        <p className="text-gray-600">
          ✓ 선택하신 분야: <strong>{fieldLabels[field]}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          🤖 AI가 자동으로 분석해서 계약서를 도와드릴게요!
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* 자유 입력 영역 */}
        <div className="bg-white p-6 rounded-xl border-2 border-primary-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary-500" size={24} />
            <h3 className="font-semibold text-lg">작업을 설명해주세요</h3>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="예: 카페 로고를 만들어주세요. 인스타그램에 올릴 거고, 따뜻하고 아늑한 느낌으로 부탁드려요."
            className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
            disabled={isAnalyzing}
          />

          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleAIAnalysis}
              disabled={!userInput.trim() || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">AI 분석 중...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span className="ml-2">🤖 AI 분석하기</span>
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowQuickOptions(!showQuickOptions)}
            >
              예시 보기
            </Button>
          </div>

          {/* 빠른 예시 */}
          {showQuickOptions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">빠른 예시:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickExamples[field].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickSelect(example)}
                    className="text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI 분석 결과 */}
        {analysisResult && (
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-xl border-2 border-primary-300">
            <div className="flex items-center gap-2 mb-4">
              <Check className="text-success" size={24} />
              <h3 className="font-semibold text-lg">💡 AI 분석 결과</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">작업 분류</p>
                <p className="font-semibold text-gray-900">{analysisResult.workType}</p>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">클라이언트 유형</p>
                <p className="font-semibold text-gray-900">
                  {analysisResult.clientType === 'individual' ? '👤 개인' :
                   analysisResult.clientType === 'small_business' ? '🏪 소상공인' :
                   analysisResult.clientType === 'enterprise' ? '🏢 기업' : '❓ 미정'}
                </p>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">사용 범위</p>
                <p className="font-semibold text-gray-900">
                  {analysisResult.commercialUse ? '💼 상업적 사용' : '👤 개인 사용'}
                </p>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">복잡도</p>
                <p className="font-semibold text-gray-900">
                  {analysisResult.complexity === 'simple' ? '⭐ 단순' :
                   analysisResult.complexity === 'medium' ? '⭐⭐ 중간' : '⭐⭐⭐ 복잡'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">💰 AI 추천 금액</p>
                <p className="text-2xl font-bold text-primary-600">
                  {analysisResult.suggestedPriceRange.min.toLocaleString()}원 ~ {analysisResult.suggestedPriceRange.max.toLocaleString()}원
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  시장 가격 기준 AI 추천 범위
                </p>
              </div>
              {analysisResult.estimatedDays && (
                <div className="bg-white/80 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">⏱️ 예상 작업 기간</p>
                  <p className="text-2xl font-bold text-primary-600">
                    약 {analysisResult.estimatedDays}일
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    복잡도 기준 예상 소요 시간
                  </p>
                </div>
              )}
            </div>

            {analysisResult.riskFactors && analysisResult.riskFactors.length > 0 && (
              <div className="bg-warning/10 border border-warning p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-warning mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-warning-dark mb-2">⚠️ 주의사항</p>
                    <ul className="space-y-1">
                      {analysisResult.riskFactors.map((risk, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="bg-success/10 border border-success p-4 rounded-lg">
                <p className="text-success-dark font-semibold flex items-center gap-2">
                  <Check size={20} />
                  AI 분석이 완료되었어요!
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  아래 <strong>"다음"</strong> 버튼을 눌러 진행하세요.
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => {
                  setAnalysisResult(null);
                  setUserInput('');
                }}
                className="w-full"
              >
                다시 설명하기
              </Button>
            </div>
          </div>
        )}

        {/* AI 분석 실패 ErrorBanner */}
        {showErrorBanner && (
          <ErrorBanner
            message={errorMessage}
            onRetry={handleAIAnalysis}
            retryLabel="다시 분석하기"
          />
        )}

        {/* 도움말 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>팁:</strong> 작업을 자세히 설명할수록 AI가 더 정확하게 분석해요!
            "누가, 어디에, 어떻게 사용할지"를 포함하면 좋아요.
          </p>
        </div>
      </div>
    </div>
  );
}
