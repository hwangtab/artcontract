'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Button from '../../shared/Button';
import Input from '../../shared/Input';
import LoadingSpinner from '../../shared/LoadingSpinner';
import ErrorBanner from '../../shared/ErrorBanner';
import ConfirmModal from '../../shared/ConfirmModal';
import { ArtField, WorkAnalysis, WorkItem } from '@/types/contract';
import { Sparkles, Check, AlertTriangle, Plus, Trash2 } from 'lucide-react';

interface Step02Props {
  field: ArtField;
  workType?: string;
  workDescription?: string;
  workItems?: WorkItem[];
  aiAnalysis?: WorkAnalysis | null;
  onUpdate: (data: {
    workType?: string;
    workDescription?: string;
    aiAnalysis?: WorkAnalysis | null;
    workItems?: WorkItem[];
  }) => void;
}

interface WorkItemDraft extends WorkItem {
  id: string;
  title: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  deliverables?: string;
}

const presetTasks: Array<{ id: string; title: string; description: string }> = [
  { id: 'compose', title: '작곡', description: '메인 테마/멜로디 작곡' },
  { id: 'arrange', title: '편곡', description: '악기 구성 및 편곡 작업' },
  { id: 'record', title: '녹음', description: '보컬/악기 녹음 진행' },
  { id: 'mix', title: '믹싱', description: '트랙 밸런스 및 이펙트 조정' },
  { id: 'master', title: '마스터링', description: '최종 음압/톤 조정' },
];

const quickExamples: Record<ArtField, string[]> = {
  design: ['브랜드 로고 디자인', '전시 포스터 제작'],
  photography: ['앨범 재킷 촬영', '행사 사진 풀 패키지'],
  video: ['뮤직비디오 제작', 'SNS 하이라이트 영상 편집'],
  writing: ['프로젝트 소개 카피 작성', '앨범 릴리즈 보도자료 작성'],
  music: ['작곡 + 편곡 + 믹싱 풀 패키지', '게임 BGM 3트랙 제작'],
  voice: ['광고 내레이션 녹음', '게임 캐릭터 보이스 패키지'],
  translation: ['가사 번역 + 현지화', '영상 자막 번역 (10분 분량)'],
  other: ['작업 내용을 자유롭게 입력하세요'],
};

function createEmptyItem(title = ''): WorkItemDraft {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    description: '',
    quantity: undefined,
    unitPrice: undefined,
    deliverables: '',
  };
}

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;

  // 쉼표 제거 후 parseFloat
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);

  // NaN 체크 + 유효한 숫자인지 확인
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

export default function Step02WorkDetail({
  field,
  workType,
  workDescription,
  workItems,
  aiAnalysis,
  onUpdate,
}: Step02Props) {
  const [descriptionInput, setDescriptionInput] = useState(workDescription || '');
  const [items, setItems] = useState<WorkItemDraft[]>(() =>
    (workItems || []).map((item) => ({ ...item }))
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WorkAnalysis | null>(aiAnalysis || null);
  const [showQuickOptions, setShowQuickOptions] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ConfirmModal 상태
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingDuplicateItem, setPendingDuplicateItem] = useState<WorkItemDraft | null>(null);
  const [duplicateItemTitle, setDuplicateItemTitle] = useState('');

  useEffect(() => {
    setDescriptionInput(workDescription || '');
  }, [workDescription]);

  useEffect(() => {
    setItems((workItems || []).map((item) => ({ ...item })));
  }, [workItems]);

  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.subtotal !== undefined) {
        return sum + item.subtotal;
      }
      if (item.unitPrice !== undefined && item.quantity !== undefined) {
        return sum + item.unitPrice * item.quantity;
      }
      return sum;
    }, 0);
  }, [items]);

  const syncItems = useCallback(
    (nextItems: WorkItemDraft[]) => {
      setItems(nextItems);
      const normalizedItems = nextItems.map((item) => ({
        ...item,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal:
          item.subtotal ??
          (item.unitPrice !== undefined && item.quantity !== undefined
            ? item.unitPrice * item.quantity
            : undefined),
      }));

      const primaryTitle = normalizedItems[0]?.title;

      onUpdate({
        workItems: normalizedItems,
        workType: primaryTitle || (descriptionInput.trim() || undefined),
      });
    },
    [descriptionInput, onUpdate]
  );

  const handleDescriptionChange = (value: string) => {
    setDescriptionInput(value);
    const trimmed = value.trim();

    if (analysisResult) {
      setAnalysisResult(null);
      onUpdate({ aiAnalysis: null });
    }

    onUpdate({
      workDescription: trimmed || undefined,
      workType: items[0]?.title || (trimmed || undefined),
    });
  };

  const handleAddItem = (initial?: { title?: string; description?: string }) => {
    const next = [...items, { ...createEmptyItem(initial?.title), description: initial?.description }];
    syncItems(next);
  };

  const handleUpdateItem = (id: string, updates: Partial<WorkItemDraft>) => {
    const next = items.map((item) =>
      item.id === id
        ? {
            ...item,
            ...updates,
            quantity: updates.quantity === undefined ? item.quantity : updates.quantity,
            unitPrice: updates.unitPrice === undefined ? item.unitPrice : updates.unitPrice,
          }
        : item
    );
    syncItems(next);
  };

  const handleRemoveItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    syncItems(next);
  };

  const handleAIAnalysis = async () => {
    if (!descriptionInput.trim()) return;

    // 중복 체크: 동일한 description을 가진 항목이 이미 있는지 확인
    const duplicateItem = items.find(
      (item) => item.description?.trim().toLowerCase() === descriptionInput.trim().toLowerCase()
    );

    if (duplicateItem) {
      // 중복 항목 발견 시 모달 표시
      setDuplicateItemTitle(duplicateItem.title);
      setShowDuplicateModal(true);
      return;
    }

    // 중복이 아니면 바로 분석 진행
    await performAIAnalysis();
  };

  const performAIAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          userInput: descriptionInput.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const result: WorkAnalysis = data.data;
        const newItem: WorkItemDraft = {
          ...createEmptyItem(result.workType || 'AI 추천 작업'),
          title: result.workType || 'AI 추천 작업',
          description: descriptionInput.trim(),
        };
        const nextItems = [...items, newItem];
        setAnalysisResult(result);
        setShowErrorBanner(false);
        syncItems(nextItems);
        onUpdate({
          aiAnalysis: result,
          workDescription: descriptionInput.trim(),
        });
        // 성공 후 입력창 초기화 (중복 방지)
        setDescriptionInput('');
      } else {
        setErrorMessage('AI 분석에 실패했어요. 네트워크 상태를 확인하고 다시 시도해주세요.');
        setShowErrorBanner(true);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setErrorMessage('AI 분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
      setShowErrorBanner(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmDuplicate = () => {
    setShowDuplicateModal(false);
    performAIAnalysis();
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setDuplicateItemTitle('');
  };

  const fieldLabels: Record<ArtField, string> = {
    design: '그림/디자인',
    photography: '사진/영상',
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">어떤 작업들을 맡으셨나요?</h2>
        <p className="text-gray-600">
          ✓ 선택하신 분야: <strong>{fieldLabels[field]}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          여러 작업을 동시에 진행하신다면 각각의 항목을 추가해 주세요.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {/* 자유 입력 영역 */}
        <div className="bg-white p-6 rounded-xl border-2 border-primary-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary-500" size={24} />
            <h3 className="font-semibold text-lg">작업 설명 또는 AI 분석 요청</h3>
          </div>

          <textarea
            value={descriptionInput}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="예: 싱글 앨범 제작을 맡았어요. 작곡, 편곡, 녹음, 믹싱, 마스터링까지 진행합니다."
            className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
            disabled={isAnalyzing}
          />

          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleAIAnalysis}
              disabled={!descriptionInput.trim() || isAnalyzing}
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
                  <span className="ml-2">🤖 AI로 작업 나누기</span>
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setShowQuickOptions((prev) => !prev)}>
              예시 보기
            </Button>
          </div>

          {showQuickOptions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">빠른 예시:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickExamples[field].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowQuickOptions(false);
                      handleDescriptionChange(example);
                    }}
                    className="text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showErrorBanner && (
            <div className="mt-4">
              <ErrorBanner
                message={errorMessage}
                onRetry={handleAIAnalysis}
                retryLabel="다시 분석하기"
              />
            </div>
          )}
        </div>

        {/* 작업 항목 관리 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">작업 항목 목록</h3>
              <p className="text-sm text-gray-500">
                각 단계별 작업을 추가하고 상세 내용을 입력하세요. 금액을 입력하면 총합이 자동 계산됩니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {presetTasks.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleAddItem({ title: preset.title, description: preset.description })}
                  className="px-3 py-2 text-sm bg-primary-50 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  + {preset.title}
                </button>
              ))}
              <Button variant="secondary" onClick={() => handleAddItem()}>
                <Plus size={16} />
                <span className="ml-1">항목 추가</span>
              </Button>
            </div>
          </div>

          {items.length === 0 && (
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500">
              아직 추가된 작업이 없어요. 위의 예시 버튼을 누르거나 항목을 직접 추가해 주세요.
            </div>
          )}

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <Input
                      label={`작업 ${index + 1} 제목`}
                      value={item.title}
                      onChange={(value) => handleUpdateItem(item.id, { title: value })}
                      placeholder="예: 작곡"
                      required
                    />
                    <textarea
                      value={item.description || ''}
                      onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                      placeholder="작업 상세 내용을 적어주세요"
                      className="w-full h-24 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                    />
                    <Input
                      label="납품물 (선택)"
                      value={item.deliverables || ''}
                      onChange={(value) => handleUpdateItem(item.id, { deliverables: value })}
                      placeholder="예: WAV, MP3, 프로젝트 파일"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="수량"
                        type="number"
                        value={item.quantity?.toString() || ''}
                        onChange={(value) => handleUpdateItem(item.id, { quantity: toNumber(value) })}
                      />
                      <Input
                        label="단가 (원)"
                        type="number"
                        value={item.unitPrice?.toString() || ''}
                        onChange={(value) => handleUpdateItem(item.id, { unitPrice: toNumber(value) })}
                      />
                      <Input
                        label="소계 (자동 계산 가능)"
                        type="number"
                        value={item.subtotal?.toString() || ''}
                        onChange={(value) => handleUpdateItem(item.id, { subtotal: toNumber(value) })}
                        helper="단가 × 수량 입력 시 자동 계산"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-danger hover:text-danger/80"
                    aria-label={`작업 ${index + 1} 삭제`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <span className="font-medium text-gray-700">예상 총 금액</span>
              <span className="text-xl font-semibold text-primary-600">
                {totalCost > 0 ? totalCost.toLocaleString() + '원' : '금액 미정'}
              </span>
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
                <p className="text-sm text-gray-600 mb-1">추천 작업 분류</p>
                <p className="font-semibold text-gray-900">{analysisResult.workType}</p>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">클라이언트 유형</p>
                <p className="font-semibold text-gray-900">
                  {analysisResult.clientType === 'individual'
                    ? '👤 개인'
                    : analysisResult.clientType === 'small_business'
                    ? '🏪 소상공인'
                    : analysisResult.clientType === 'enterprise'
                    ? '🏢 기업'
                    : '❓ 미정'}
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
                  {analysisResult.complexity === 'simple'
                    ? '⭐ 단순'
                    : analysisResult.complexity === 'medium'
                    ? '⭐⭐ 중간'
                    : '⭐⭐⭐ 복잡'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">💰 AI 추천 금액</p>
                <p className="text-2xl font-bold text-primary-600">
                  {analysisResult.suggestedPriceRange.min.toLocaleString()}원 ~{' '}
                  {analysisResult.suggestedPriceRange.max.toLocaleString()}원
                </p>
                <p className="text-xs text-gray-500 mt-1">시장 가격 기준 AI 추천 범위</p>
              </div>
              {analysisResult.estimatedDays && (
                <div className="bg-white/80 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">⏱️ 예상 작업 기간</p>
                  <p className="text-2xl font-bold text-primary-600">
                    약 {analysisResult.estimatedDays}일
                  </p>
                  <p className="text-xs text-gray-500 mt-1">복잡도 기준 예상 소요 시간</p>
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
                        <li key={idx} className="text-sm text-gray-700">
                          • {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 중복 항목 확인 모달 */}
      <ConfirmModal
        isOpen={showDuplicateModal}
        title="중복 항목 감지"
        message={
          <>
            <strong>"{duplicateItemTitle}"</strong> 항목이 이미 존재합니다.
            <br />
            <br />
            같은 내용으로 새 항목을 추가하시겠어요?
          </>
        }
        confirmLabel="추가하기"
        cancelLabel="취소"
        onConfirm={handleConfirmDuplicate}
        onCancel={handleCancelDuplicate}
      />
    </div>
  );
}
