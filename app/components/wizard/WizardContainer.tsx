'use client';

import React, { useState } from 'react';
import { useWizard } from '@/hooks/useWizard';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useProactiveAlerts } from '@/hooks/useProactiveAlerts';
import Button from '../shared/Button';
import Step00ArtistInfo from './steps/Step00ArtistInfo';
import Step01FieldSelection from './steps/Step01FieldSelection';
import Step02WorkDetail from './steps/Step02WorkDetail';
import Step03ClientType from './steps/Step03ClientType';
import Step04Timeline from './steps/Step04Timeline';
import Step05Payment from './steps/Step05Payment';
import Step06Revisions from './steps/Step06Revisions';
import Step06bCopyright from './steps/Step06bCopyright';
import Step07UsageScope from './steps/Step07UsageScope';
import Step08Protection from './steps/Step08Protection';
import Step08FinalCheck from './steps/Step08FinalCheck';
import ContractResult from '../contract/ContractResult';
import AssistantButton from '../ai-assistant/AssistantButton';
import AssistantWindow from '../ai-assistant/AssistantWindow';
import ConfirmModal from '../shared/ConfirmModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateContract } from '@/lib/contract/generator';
import { GeneratedContract, ContractTemplate } from '@/types/contract';

export default function WizardContainer() {
  const {
    currentStep,
    formData,
    completeness,
    canGoNext,
    canGoPrev,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    reset,
  } = useWizard();

  const {
    isOpen,
    messages,
    isLoading,
    toggleAssistant,
    sendMessage,
    addProactiveMessage,
  } = useAIAssistant();

  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // ✅ AI 챗봇 열렸을 때 배경 스크롤 방지
  React.useEffect(() => {
    if (isOpen) {
      // 원래 overflow 값 저장
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        // 원래 값으로 복원
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useProactiveAlerts({ currentStep, formData, addProactiveMessage });

  const handleGenerateContract = async () => {
    // 템플릿 가져오기
    try {
      // ✅ 타임아웃 설정 (10초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/templates?field=${formData.field}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.template) {
        const contract = generateContract(formData, data.data.template);
        setGeneratedContract(contract);
      } else {
        throw new Error('Template API returned an invalid response');
      }
    } catch (error) {
      console.error('Contract generation failed:', error);

      // ✅ 타임아웃 에러 처리
      let errorMsg = '계약서 템플릿을 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
      if (error instanceof Error && error.name === 'AbortError') {
        errorMsg = '⏱️ 템플릿 로딩 시간이 초과되었어요. 네트워크를 확인하고 다시 시도해주세요.';
      }

      addProactiveMessage(errorMsg, 'danger');
    }
  };

  const handleEditContract = () => {
    setGeneratedContract(null);
    goToStep(10);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message, formData, currentStep, updateFormData);
  };

  const handleRequestReset = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setShowResetModal(false);
    reset();
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step00ArtistInfo
            artistName={formData.artistName}
            artistContact={formData.artistContact}
            artistIdNumber={formData.artistIdNumber}
            artistAddress={formData.artistAddress}
            onUpdate={(data) => updateFormData(data)}
          />
        );
      case 1:
        return (
          <Step01FieldSelection
            selectedField={formData.field}
            subField={formData.subField}
            selectedSubFields={formData.selectedSubFields}
            onSelect={(field) => updateFormData({ field })}
            onSubFieldChange={(subField) => updateFormData({ subField })}
            onSubFieldsChange={(selectedSubFields) => updateFormData({ selectedSubFields })}
          />
        );
      case 2:
        return (
          <Step02WorkDetail
            field={formData.field!}
            workType={formData.workType}
            workDescription={formData.workDescription}
            workItems={formData.workItems}
            aiAnalysis={formData.aiAnalysis}
            selectedSubFields={formData.selectedSubFields}
            subField={formData.subField}
            onUpdate={(data) => updateFormData(data)}
          />
        );
      case 3:
        return (
          <Step03ClientType
            clientType={formData.clientType}
            clientName={formData.clientName}
            clientContact={formData.clientContact}
            aiAnalysis={formData.aiAnalysis}
            onUpdate={(data) => updateFormData(data)}
          />
        );
      case 4:
        return (
          <Step04Timeline
            startDate={formData.timeline?.startDate}
            deadline={formData.timeline?.deadline}
            aiAnalysis={formData.aiAnalysis}
            onUpdate={(startDate, deadline) =>
              updateFormData({ timeline: { startDate, deadline } })
            }
            onAICoach={(message) => addProactiveMessage(message, 'info')}
          />
        );
      case 5:
        return (
          <Step05Payment
            amount={formData.payment?.amount}
            deposit={formData.payment?.deposit}
            onUpdate={(amount, deposit) =>
              updateFormData({
                payment: { ...formData.payment!, amount, deposit },
              })
            }
            suggestedPriceRange={formData.aiAnalysis?.suggestedPriceRange}
            onAICoach={(message) => addProactiveMessage(message, 'info')}
            workItems={formData.workItems}
          />
        );
      case 6:
        return (
          <Step06Revisions
            revisions={formData.revisions}
            additionalRevisionFee={formData.additionalRevisionFee}
            aiAnalysis={formData.aiAnalysis}
            onUpdate={(revisions, additionalFee) =>
              updateFormData({ revisions, additionalRevisionFee: additionalFee })
            }
            onAICoach={(message) => addProactiveMessage(message, 'info')}
          />
        );
      case 7:
        return (
          <Step06bCopyright
            copyrightTerms={formData.copyrightTerms}
            onUpdate={(data) => updateFormData(data)}
          />
        );
      case 8:
        return (
          <Step07UsageScope
            usageScope={formData.usageScope}
            commercialUse={formData.commercialUse}
            exclusiveRights={formData.exclusiveRights}
            aiAnalysis={formData.aiAnalysis}
            onUpdate={(data) => updateFormData(data)}
          />
        );
      case 9:
        return (
          <Step08Protection
            protectionClauses={formData.protectionClauses}
            artistName={formData.artistName}
            field={formData.field}
            revisions={formData.revisions}
            additionalRevisionFee={formData.additionalRevisionFee}
            onUpdate={(data) => updateFormData(data)}
          />
        );
      case 10:
        return (
          <Step08FinalCheck
            formData={formData}
            onEdit={goToStep}
            onGenerate={handleGenerateContract}
          />
        );
      default:
        return (
          <div className="text-center p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step {currentStep}
            </h2>
            <p className="text-gray-600">잘못된 단계입니다</p>
          </div>
        );
    }
  };

  // 계약서 생성 완료되면 결과 화면 보여주기
  if (generatedContract) {
    return <ContractResult contract={generatedContract} onEdit={handleEditContract} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              진행률: {completeness}%
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.min(currentStep + 1, totalSteps)} / {totalSteps}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={0}
            aria-valuemax={totalSteps}
            aria-valuetext={`진행률: ${completeness}%, ${currentStep}단계 / ${totalSteps}단계`}
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep !== 10 && (
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => prevStep(handleRequestReset)}
              disabled={!canGoPrev}
            >
              <ChevronLeft size={20} />
              이전
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentStep
                      ? 'bg-primary-500'
                      : idx < currentStep
                      ? 'bg-primary-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button onClick={nextStep} disabled={!canGoNext}>
              다음
              <ChevronRight size={20} />
            </Button>
          </div>
        )}

        {/* Warnings */}
        {formData.warnings && formData.warnings.length > 0 && currentStep !== 10 && (
          <div className="mt-6 space-y-3">
            {formData.warnings.slice(0, 2).map((warning) => (
              <div
                key={warning.id}
                className={`p-4 rounded-lg border-l-4 ${
                  warning.severity === 'danger'
                    ? 'bg-danger/10 border-danger'
                    : warning.severity === 'warning'
                    ? 'bg-warning/10 border-warning'
                    : 'bg-info/10 border-info'
                }`}
              >
                <p className="font-medium text-gray-900">{warning.message}</p>
                <p className="text-sm text-gray-600 mt-1">{warning.suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <AssistantButton isOpen={isOpen} onClick={toggleAssistant} />
      {isOpen && (
        <AssistantWindow
          messages={messages}
          isLoading={isLoading}
          currentStep={currentStep}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="계약서 초기화"
        message={
          <>
            처음부터 다시 시작하시겠어요?
            <br />
            <br />
            입력한 모든 정보가 삭제됩니다.
          </>
        }
        confirmLabel="초기화"
        cancelLabel="취소"
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </div>
  );
}
