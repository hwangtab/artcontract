'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Button from '../../shared/Button';
import Input from '../../shared/Input';
import LoadingSpinner from '../../shared/LoadingSpinner';
import ErrorBanner from '../../shared/ErrorBanner';
import ConfirmModal from '../../shared/ConfirmModal';
import { ArtField, WorkAnalysis, WorkItem, EnhancedContractFormData } from '@/types/contract';
import { Sparkles, Check, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useWorkAnalysis } from '@/hooks/useWorkAnalysis';
import { parseKoreanCurrency } from '@/lib/utils/currency-format';

interface Step02Props {
  field: ArtField;
  workType?: string;
  workDescription?: string;
  workItems?: WorkItem[];
  aiAnalysis?: WorkAnalysis | null;
  selectedSubFields?: string[];  // Step 1에서 선택한 작업들
  subField?: string;  // "기타" 선택 시 사용자가 입력한 실제 내용
  onUpdate: (data: Partial<EnhancedContractFormData>) => void;
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

export default function Step02WorkDetail({
  field,
  workType,
  workDescription,
  workItems,
  aiAnalysis,
  selectedSubFields,
  subField,
  onUpdate,
}: Step02Props) {
  // ✅ useWorkAnalysis 훅 사용
  const { isAnalyzing, error: analysisError, analysisResult, analyze, clearError } = useWorkAnalysis(field);

  const [descriptionInput, setDescriptionInput] = useState(workDescription || '');
  const [items, setItems] = useState<WorkItemDraft[]>(() =>
    (workItems || []).map((item) => ({ ...item }))
  );
  const [isAnalysisOutdated, setIsAnalysisOutdated] = useState(false); // ✅ 분석 결과 만료 상태
  const [isAnalysisApplied, setIsAnalysisApplied] = useState(false); // ✅ AI 결과 적용 여부
  const [showQuickOptions, setShowQuickOptions] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // ConfirmModal 상태
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingDuplicateItem, setPendingDuplicateItem] = useState<WorkItemDraft | null>(null);
  const [duplicateItemTitle, setDuplicateItemTitle] = useState('');

  // ✅ AI 분석 결과 자동 스크롤을 위한 ref
  const analysisResultRef = React.useRef<HTMLDivElement>(null);

  // ✅ Step 1에서 선택한 작업들을 자동 로드 + 작업 설명 자동 생성
  useEffect(() => {
    if (!initialLoadDone) {
      let fieldsToProcess: string[] = [];

      // Case 1: 복수 선택 (selectedSubFields 사용)
      if (selectedSubFields && selectedSubFields.length > 0) {
        // "기타"가 있으면 실제 subField 값으로 교체
        fieldsToProcess = selectedSubFields.map(field =>
          field === '기타' && subField ? subField : field
        );
      }
      // Case 2: "기타" 분야 단일 입력 (subField만 있음)
      else if (subField && subField.trim()) {
        fieldsToProcess = [subField];
      }

      // 작업 항목이 없으면 생성하지 않음
      if (fieldsToProcess.length === 0) {
        return;
      }

      const autoLoadedItems = fieldsToProcess.map((subFieldTitle) =>
        createEmptyItem(subFieldTitle)
      );
      setItems(autoLoadedItems);
      setInitialLoadDone(true);

      // ✅ 작업 설명 자동 생성 (처리된 필드명 사용)
      const autoDescription = `${fieldsToProcess.join(', ')} 작업을 진행합니다.`;
      setDescriptionInput(autoDescription);

      // 즉시 동기화
      const normalizedItems = autoLoadedItems.map((item) => ({
        ...item,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: undefined,
      }));

      const primaryTitle = normalizedItems[0]?.title;

      onUpdate({
        workItems: normalizedItems,
        workType: primaryTitle || undefined,
        workDescription: autoDescription,
      });
    }
  }, [selectedSubFields, initialLoadDone, subField, onUpdate]);

  useEffect(() => {
    setDescriptionInput(workDescription || '');
  }, [workDescription]);

  useEffect(() => {
    if (workItems && workItems.length > 0) {
      setItems((workItems || []).map((item) => ({ ...item })));
    }
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

    // ✅ UX 개선: 분석 결과를 즉시 삭제하지 않고 "만료됨" 상태로 표시
    if (analysisResult) {
      if (!isAnalysisOutdated) setIsAnalysisOutdated(true);
      if (isAnalysisApplied) setIsAnalysisApplied(false); // ✅ 적용된 경우만 초기화
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
    // ✅ 간소화: spread operator가 undefined 값도 올바르게 처리
    const next = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    syncItems(next);
  };

  const handleRemoveItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    syncItems(next);
  };

  const handleAIAnalysis = async () => {
    if (!descriptionInput.trim()) return;

    // ✅ 중복 체크: description 또는 title이 유사한 항목 찾기
    const trimmedInput = descriptionInput.trim().toLowerCase();
    const duplicateItem = items.find((item) => {
      const itemDesc = item.description?.trim().toLowerCase() || '';
      const itemTitle = item.title?.trim().toLowerCase() || '';

      // description 완전 일치 또는 title 완전 일치
      return itemDesc === trimmedInput || itemTitle === trimmedInput;
    });

    if (duplicateItem) {
      // 중복 항목 발견 시 모달 표시
      setDuplicateItemTitle(duplicateItem.title);
      setShowDuplicateModal(true);
      return;
    }

    // 중복이 아니면 바로 분석 진행
    await performAIAnalysis();
  };

  // ✅ 함수 분리 2: WorkItems 생성 (기존 항목 채우기 + 추가)
  const populateWorkItems = (result: WorkAnalysis) => {
    if (result.workItems && result.workItems.length > 0) {
      // 여러 작업 항목이 있는 경우
      const updatedItems = [...items];
      const newItems: WorkItemDraft[] = [];

      result.workItems.forEach((aiItem) => {
        // 기존 항목 중 title이 유사한 것 찾기
        const existingIndex = updatedItems.findIndex((item) =>
          item.title.toLowerCase().includes(aiItem.title.toLowerCase()) ||
          aiItem.title.toLowerCase().includes(item.title.toLowerCase())
        );

        if (existingIndex !== -1) {
          // ✅ 기존 항목 채우기 (빈 값만 업데이트)
          const existing = updatedItems[existingIndex];
          updatedItems[existingIndex] = {
            ...existing,
            description: existing.description || aiItem.description || '',
            deliverables: existing.deliverables || aiItem.deliverables || '',
            unitPrice: existing.unitPrice ?? aiItem.estimatedPrice,
            quantity: existing.quantity ?? aiItem.quantity ?? 1,
          };
        } else {
          // ✅ 새 항목 추가 (기존에 없는 작업)
          newItems.push({
            ...createEmptyItem(aiItem.title),
            title: aiItem.title,
            description: aiItem.description || '',
            deliverables: aiItem.deliverables || '',
            unitPrice: aiItem.estimatedPrice,
            quantity: aiItem.quantity || 1,
          });
        }
      });

      const nextItems = [...updatedItems, ...newItems];
      syncItems(nextItems);
    } else {
      // 단일 작업인 경우 - 첫 번째 항목 채우기
      const estimatedPrice = result.totalAmount || result.suggestedPriceRange?.min || undefined;

      if (items.length > 0) {
        // ✅ 기존 첫 항목 채우기
        const updatedItems = [...items];
        updatedItems[0] = {
          ...updatedItems[0],
          description: updatedItems[0].description || descriptionInput.trim(),
          unitPrice: updatedItems[0].unitPrice ?? estimatedPrice,
          quantity: updatedItems[0].quantity ?? 1,
        };
        syncItems(updatedItems);
      } else {
        // 항목이 하나도 없으면 새로 추가
        const newItem: WorkItemDraft = {
          ...createEmptyItem(result.workType || 'AI 추천 작업'),
          title: result.workType || 'AI 추천 작업',
          description: descriptionInput.trim(),
          deliverables: '',
          unitPrice: estimatedPrice,
          quantity: 1,
        };
        syncItems([newItem]);
      }
    }
  };

  // ✅ 함수 분리 3: 다음 단계 자동 채우기
  const populateNextSteps = (result: WorkAnalysis) => {
    const updates: any = {
      aiAnalysis: result,
      workDescription: descriptionInput.trim(),
    };

    // 클라이언트 정보 (Step 3)
    if (result.clientName) {
      updates.clientName = result.clientName;
    }
    if (result.clientType && result.clientType !== 'unknown') {
      updates.clientType = result.clientType;
    }

    // 총 금액 (Step 5)
    if (result.totalAmount) {
      updates.payment = {
        currency: 'KRW',
        amount: result.totalAmount,
      };
    }

    // 일정 (Step 4)
    if (result.estimatedDays) {
      const today = new Date();
      const deadline = new Date(today);
      deadline.setDate(deadline.getDate() + result.estimatedDays);

      updates.timeline = {
        startDate: today,
        deadline: deadline,
        estimatedDays: result.estimatedDays,
      };
    }

    // 사용 범위 (Step 7)
    if (result.usageScope && result.usageScope.length > 0) {
      updates.usageScope = result.usageScope;
    }

    // 상업적 사용 (Step 7)
    if (result.commercialUse !== undefined) {
      updates.commercialUse = result.commercialUse;
    }

    onUpdate(updates);
  };

  // ✅ 메인 함수: useWorkAnalysis 훅 사용
  const performAIAnalysis = async () => {
    setIsAnalysisApplied(false); // ✅ analyze 호출 전에 먼저 초기화 (실패 시에도 보장)

    const result = await analyze(descriptionInput);

    if (result) {
      setIsAnalysisOutdated(false); // ✅ 새로운 분석 결과는 최신 상태

      // ✅ 분석 완료 후 결과로 자동 스크롤
      setTimeout(() => {
        analysisResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  // ✅ 새로운 함수: AI 분석 결과 적용
  const applyAnalysisResults = () => {
    if (!analysisResult || isAnalysisApplied) return; // ✅ 중복 적용 방지

    populateWorkItems(analysisResult);
    populateNextSteps(analysisResult);
    setIsAnalysisApplied(true);
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">작업 내용을 자세히 알려주세요</h2>
        <p className="text-gray-600">
          ✓ 선택하신 분야: <strong>{fieldLabels[field]}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          📝 {fieldLabels[field]} 외에 다른 작업도 있다면 함께 입력해주세요.
          <br />
          💡 AI가 자동으로 여러 작업으로 나눠드려요!
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
            placeholder={
              selectedSubFields && selectedSubFields.length > 0
                ? "위 작업에 대한 상세 내용을 추가하거나 수정하세요 (예: 각 곡당 50만원씩, 총 3곡)"
                : "예: 작곡이 메인이지만 편곡, 믹싱, 마스터링도 함께 진행합니다."
            }
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
                  <span className="ml-2">🤖 AI로 작업 분석하기</span>
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

          {analysisError && (
            <div className="mt-4">
              <ErrorBanner
                message={analysisError}
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
                        onChange={(value) => {
                          const parsed = value ? parseFloat(value.replace(/,/g, '')) : undefined;
                          handleUpdateItem(item.id, { quantity: isNaN(parsed!) ? undefined : parsed });
                        }}
                      />
                      <Input
                        label="단가 (원)"
                        type="text"
                        value={item.unitPrice?.toString() || ''}
                        onChange={(value) => handleUpdateItem(item.id, { unitPrice: parseKoreanCurrency(value) })}
                        placeholder="예: 100만원, 50만, 500000"
                        helper="'만원', '억원' 단위 사용 가능"
                      />
                      <Input
                        label="소계 (자동 계산 가능)"
                        type="text"
                        value={item.subtotal?.toString() || ''}
                        onChange={(value) => handleUpdateItem(item.id, { subtotal: parseKoreanCurrency(value) })}
                        placeholder="예: 100만원"
                        helper="단가 × 수량 입력 시 자동 계산 / '만원', '억원' 사용 가능"
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
          <div
            ref={analysisResultRef}
            className={`p-6 rounded-xl border-2 ${
            isAnalysisOutdated
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-warning'
              : 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {isAnalysisOutdated ? (
                  <AlertTriangle className="text-warning" size={24} />
                ) : (
                  <Check className="text-success" size={24} />
                )}
                <h3 className="font-semibold text-lg">
                  {isAnalysisOutdated ? '⚠️ 내용이 변경되었어요' : '💡 AI 분석 결과'}
                </h3>
              </div>
              {isAnalysisOutdated && (
                <Button
                  variant="primary"
                  size="small"
                  onClick={performAIAnalysis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? '분석 중...' : '🔄 재분석'}
                </Button>
              )}
            </div>

            {isAnalysisOutdated && (
              <div className="mb-4 p-3 bg-white/80 rounded-lg border border-warning/30">
                <p className="text-sm text-gray-700">
                  💡 작업 설명을 수정하셨어요. 다시 분석하면 최신 내용을 반영한 결과를 받을 수 있어요!
                </p>
              </div>
            )}

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

            {/* ✅ AI 추천 적용 버튼 */}
            <div className="mt-4 pt-4 border-t border-primary-200">
              <Button
                variant={isAnalysisApplied ? "secondary" : isAnalysisOutdated ? "secondary" : "primary"}
                size="medium"
                onClick={applyAnalysisResults}
                disabled={isAnalysisApplied}
                className="w-full"
              >
                {isAnalysisApplied
                  ? '✓ AI 추천이 적용되었어요'
                  : isAnalysisOutdated
                  ? '⚠️ 예전 분석 결과 적용 (재분석 권장)'
                  : '🎯 AI 추천으로 적용'
                }
              </Button>
              {!isAnalysisApplied && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  {isAnalysisOutdated
                    ? '⚠️ 작업 설명이 변경되었어요. 재분석 후 적용을 권장해요'
                    : '💡 이 분석 결과를 작업 항목과 다음 단계에 자동으로 채워넣어요'
                  }
                </p>
              )}
            </div>
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
