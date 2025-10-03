'use client';

import React, { useState, useEffect } from 'react';
import { useWizard } from '@/hooks/useWizard';
import { useAIAssistant } from '@/hooks/useAIAssistant';
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
  const [shownWarnings, setShownWarnings] = useState<Set<string>>(new Set());
  const [shownStepTips, setShownStepTips] = useState<Set<number>>(new Set());

  // 프로액티브 메시지: 각 단계 진입 시 팁 제공 (중복 방지)
  useEffect(() => {
    const stepTips: { [key: number]: string } = {
      0: '👤 안녕하세요! 먼저 작가님의 정보를 입력해주세요. 계약서의 "을"이 됩니다.',
      1: '💡 작업 분야를 선택하시면 맞춤형 계약서 템플릿을 제공해드려요!',
      2: '🎨 작업 내용을 자세히 설명할수록 AI가 정확한 금액과 조건을 추천할 수 있어요.',
      3: '👥 클라이언트가 개인인지, 소상공인인지, 기업인지에 따라 계약 조건이 달라져요.',
      4: '📅 마감일이 너무 촉박하면 러시 추가 요금을 받는 것을 추천드려요!',
      5: '💰 금액이 100만원 이상이면 변호사 검토를 추천해요. 계약금은 30-50%가 적당해요.',
      6: '🔄 무제한 수정은 절대 금물! 2-3회가 적당하고, 추가 수정비를 명시하세요.',
      7: '⚖️ 저작권 관리는 선택사항이지만, 고액 계약(100만원 이상)이면 반드시 설정하세요! 저작인격권은 절대 양도할 수 없어요.',
      8: '🌐 상업적 사용권은 개인 사용보다 2-3배 높게 책정하세요. 독점권은 5배까지도 가능해요!',
      9: '🛡️ 보호 조항은 선택사항이지만, 크레딧 명기와 수정 권리는 반드시 추가하세요! 포트폴리오 사용과 저작인격권 보호에 중요합니다.',
      10: '✅ 최종 확인 단계예요. 빠진 내용이 없는지 꼼꼼히 확인하세요!',
    };

    if (stepTips[currentStep] && !shownStepTips.has(currentStep)) {
      // ✅ 즉시 Set에 추가하여 React Strict Mode 2번 마운트 시 중복 방지
      setShownStepTips(prev => new Set(prev).add(currentStep));

      setTimeout(() => {
        addProactiveMessage(stepTips[currentStep], 'info');
      }, 1000);
    }
  }, [currentStep, addProactiveMessage, shownStepTips]);

  // 위험 조건 자동 감지 (중복 방지)
  useEffect(() => {
    // 금액 위험 감지 - Step 5 이상에서만
    if (currentStep >= 5 && formData.payment?.amount !== undefined) {
      const warningId = `payment_${formData.payment.amount}`;

      if (!shownWarnings.has(warningId)) {
        if (formData.payment.amount === 0) {
          addProactiveMessage('⚠️ 위험! 금액이 0원으로 설정되었어요. 무료로 작업하시는 건가요? 최소한 작업 비용은 받으셔야 해요!', 'danger');
        } else if (formData.payment.amount > 0 && formData.payment.amount < 50000) {
          addProactiveMessage('💡 금액이 너무 낮은 것 같아요. 시간과 노력을 고려하면 최소 5만원 이상 받으시는 걸 추천해요.', 'warning');
        } else if (formData.payment.amount >= 1000000) {
          addProactiveMessage('💼 100만원 이상 고액 계약이에요! 법률 전문가의 검토를 받는 것을 강력히 추천드려요.', 'warning');
        }
        setShownWarnings(prev => new Set(prev).add(warningId));
      }
    }

    // 수정 횟수 위험 감지 - Step 6 이상에서만
    if (currentStep >= 6 && formData.revisions !== undefined && formData.revisions !== null) {
      const revisionId = `revisions_${formData.revisions}`;

      if (!shownWarnings.has(revisionId)) {
        if (typeof formData.revisions === 'number') {
          if (formData.revisions === 0) {
            addProactiveMessage('⚠️ 수정 0회는 너무 위험해요! 클라이언트가 결과물에 불만이 있어도 수정할 수 없다는 뜻이에요. 최소 1-2회는 보장하세요.', 'danger');
          } else if (formData.revisions >= 10) {
            addProactiveMessage('⚠️ 위험! 수정 횟수가 너무 많아요. 무제한 작업에 빠질 수 있어요. 2-3회가 적당하고, 추가 수정비를 명시하세요!', 'danger');
          }
        } else if (formData.revisions === 'unlimited') {
          addProactiveMessage('🚨 무제한 수정은 절대 금물! 끝없는 수정 요청에 시달릴 수 있어요. 반드시 횟수를 정하세요!', 'danger');
        }
        setShownWarnings(prev => new Set(prev).add(revisionId));
      }
    }

    // 마감일 위험 감지 - Step 4 이상에서만
    if (currentStep >= 4 && formData.timeline?.deadline) {
      const deadline = new Date(formData.timeline.deadline);
      const today = new Date();
      const daysUntilDeadline = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const deadlineId = `deadline_${daysUntilDeadline}`;

      if (!shownWarnings.has(deadlineId)) {
        if (daysUntilDeadline <= 1) {
          addProactiveMessage('🚨 급함! 마감일이 오늘 또는 내일이에요. 이렇게 촉박한 일정이면 러시 추가 요금(50-100%)을 반드시 받으세요!', 'danger');
          setShownWarnings(prev => new Set(prev).add(deadlineId));
        } else if (daysUntilDeadline <= 3) {
          addProactiveMessage('⚠️ 마감일이 3일 이내예요. 촉박한 일정이면 러시 요금을 청구하는 걸 추천드려요.', 'warning');
          setShownWarnings(prev => new Set(prev).add(deadlineId));
        }
      }
    }

    // 상업적 사용 경고 - Step 8 이상에서만
    if (currentStep >= 8 && formData.commercialUse && formData.payment?.amount) {
      const commercialId = `commercial_${formData.payment.amount}`;
      const suggestedMin = formData.aiAnalysis?.suggestedPriceRange?.min || 0;

      if (!shownWarnings.has(commercialId) && formData.payment.amount < suggestedMin * 1.5) {
        addProactiveMessage('💼 상업적 사용 계약이에요! 개인 사용보다 최소 2배 이상 받으셔야 공정해요.', 'warning');
        setShownWarnings(prev => new Set(prev).add(commercialId));
      }
    }

    // 독점권 경고 - Step 8 이상에서만
    if (currentStep >= 8 && formData.exclusiveRights && formData.payment?.amount) {
      const exclusiveId = `exclusive_${formData.payment.amount}`;
      const suggestedMin = formData.aiAnalysis?.suggestedPriceRange?.min || 0;

      if (!shownWarnings.has(exclusiveId) && formData.payment.amount < suggestedMin * 2) {
        addProactiveMessage('🔒 독점권 계약이에요! 일반 계약보다 3-5배 높게 받으셔야 해요. 다른 곳에서 못 쓰는 만큼 보상받으세요!', 'danger');
        setShownWarnings(prev => new Set(prev).add(exclusiveId));
      }
    }
  }, [formData, addProactiveMessage, shownWarnings, currentStep]);

  const handleGenerateContract = async () => {
    // 템플릿 가져오기
    try {
      const response = await fetch(`/api/templates?field=${formData.field}`);
      const data = await response.json();

      if (data.success) {
        const contract = generateContract(formData, data.data.template);
        setGeneratedContract(contract);
      }
    } catch (error) {
      console.error('Contract generation failed:', error);
    }
  };

  const handleEditContract = () => {
    setGeneratedContract(null);
    goToStep(10);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message, formData, currentStep, updateFormData);
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
            onSelect={(field) => updateFormData({ field })}
            onSubFieldChange={(subField) => updateFormData({ subField })}
          />
        );
      case 2:
        return (
          <Step02WorkDetail
            field={formData.field!}
            workType={formData.workType}
            workDescription={formData.workDescription}
            aiAnalysis={formData.aiAnalysis}
            onSelect={(workType, description, analysis) =>
              updateFormData({
                workType,
                workDescription: description,
                aiAnalysis: analysis,
              })
            }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              진행률: {completeness}%
            </span>
            <span className="text-sm font-medium text-gray-600">
              {currentStep} / {totalSteps}
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
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep !== 10 && (
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={prevStep}
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
                    idx + 1 === currentStep
                      ? 'bg-primary-500'
                      : idx + 1 < currentStep
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
    </div>
  );
}
