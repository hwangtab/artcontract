'use client';

import React from 'react';
import Card from '../../shared/Card';
import Input from '../../shared/Input';
import { Shield, AlertCircle, Lock, UserCheck } from 'lucide-react';
import { ProtectionClauses, CreditTerms, ModificationTerms, ConfidentialityTerms } from '@/types/contract';

interface Step08ProtectionProps {
  protectionClauses?: ProtectionClauses;
  artistName?: string;
  field?: string;
  revisions?: number | 'unlimited' | null;
  additionalRevisionFee?: number;
  onUpdate: (data: { protectionClauses: ProtectionClauses }) => void;
}

export default function Step08Protection({
  protectionClauses,
  artistName,
  field,
  revisions,
  additionalRevisionFee,
  onUpdate,
}: Step08ProtectionProps) {
  // ✅ 부모로부터 받은 상태 직접 사용 (내부 state 제거)
  const enableCredit = !!protectionClauses?.creditAttribution;
  const credit: CreditTerms = protectionClauses?.creditAttribution || {
    displayMethod: 'text',
    displayPosition: 'end',
    displayContent: `${getFieldName(field)} 작업: ${artistName || '[창작자명]'}`,
    onlineDisplay: true,
    penaltyForOmission: true,
  };

  const enableModification = !!protectionClauses?.modificationRights;
  const modification: ModificationTerms = protectionClauses?.modificationRights || {
    minorModifications: {
      count: revisions && revisions !== 'unlimited' ? revisions : 3,
      free: true,
    },
    additionalModifications: {
      pricePerModification: additionalRevisionFee || 0,
    },
    substantialChanges: {
      requiresConsent: true,
      definition: [
        '작품의 주제, 메시지, 스타일의 근본적 변경',
        '작품 일부의 삭제 또는 추가',
        '기타 저작인격권을 침해할 수 있는 변경',
      ],
    },
  };

  const enableConfidentiality = !!protectionClauses?.confidentiality;
  const confidentiality: ConfidentialityTerms = protectionClauses?.confidentiality || {
    scope: [
      '본 계약의 내용 및 대금',
      '작업 과정에서 알게 된 상대방의 영업 비밀',
      '미공개 작품 및 아이디어',
    ],
    duration: 2,
    exceptions: ['공개된 정보가 된 경우', '법원이나 수사기관의 요청', '당사자의 서면 동의'],
  };

  // ✅ 변경 시 즉시 onUpdate 호출 (데이터 손실 방지)
  const updateProtection = (updates: Partial<ProtectionClauses>) => {
    const newProtectionClauses: ProtectionClauses = {
      creditAttribution: enableCredit ? credit : undefined,
      modificationRights: enableModification ? modification : undefined,
      confidentiality: enableConfidentiality ? confidentiality : undefined,
      ...updates,
    };
    onUpdate({ protectionClauses: newProtectionClauses });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">보호 조항</h2>
        <p className="text-gray-600">창작자의 권리를 보호하는 조항을 추가해요 (선택사항)</p>
      </div>

      {/* 안내 배너 */}
      <div className="p-5 bg-primary-50 rounded-xl border-2 border-primary-300">
        <div className="flex items-start gap-3">
          <Shield className="text-primary-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🛡️ 왜 보호 조항이 필요한가요?</h3>
            <p className="text-sm text-gray-700">
              계약서에 보호 조항을 명시하면 나중에 분쟁을 예방할 수 있어요.
              특히 <strong>크레딧 명기</strong>와 <strong>수정 권리</strong>는 매우 중요합니다!
            </p>
          </div>
        </div>
      </div>

      {/* 1. 크레딧 명기 */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="text-primary-500" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">크레딧 명기</h3>
                <p className="text-sm text-gray-600">결과물에 창작자 이름 표시</p>
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableCredit}
                onChange={(e) => updateProtection({ creditAttribution: e.target.checked ? credit : undefined })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">포함</span>
            </label>
          </div>

          {enableCredit && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">표시 내용</label>
                <Input
                  value={credit.displayContent}
                  onChange={(value) => updateProtection({ creditAttribution: { ...credit, displayContent: value } })}
                  placeholder={`예: ${getFieldName(field)} 작업: ${artistName || '[창작자명]'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">표시 위치</label>
                  <select
                    value={credit.displayPosition}
                    onChange={(e) => updateProtection({ creditAttribution: { ...credit, displayPosition: e.target.value as any } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="start">시작 부분</option>
                    <option value="end">종료 부분</option>
                    <option value="separate_credit">별도 크레딧</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">표시 방법</label>
                  <select
                    value={credit.displayMethod}
                    onChange={(e) => updateProtection({ creditAttribution: { ...credit, displayMethod: e.target.value as any } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="text">텍스트</option>
                    <option value="image">이미지</option>
                    <option value="both">텍스트 + 이미지</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={credit.onlineDisplay}
                  onChange={(e) => updateProtection({ creditAttribution: { ...credit, onlineDisplay: e.target.checked } })}
                  className="w-4 h-4"
                />
                <span className="text-sm">온라인 게시 시에도 동일하게 표시</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={credit.penaltyForOmission}
                  onChange={(e) => updateProtection({ creditAttribution: { ...credit, penaltyForOmission: e.target.checked } })}
                  className="w-4 h-4"
                />
                <span className="text-sm">크레딧 누락 시 손해배상 청구 가능</span>
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* 2. 수정 권리 */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-warning" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">수정 및 변경 권리</h3>
                <p className="text-sm text-gray-600">본질적 변경은 창작자 동의 필요</p>
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableModification}
                onChange={(e) => updateProtection({ modificationRights: e.target.checked ? modification : undefined })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">포함</span>
            </label>
          </div>

          {enableModification && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">경미한 수정 (무상)</label>
                  <input
                    type="number"
                    value={modification.minorModifications.count}
                    onChange={(e) => updateProtection({
                      modificationRights: {
                        ...modification,
                        minorModifications: {
                          ...modification.minorModifications,
                          count: Number(e.target.value),
                        },
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="예: 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">추가 수정비 (회당)</label>
                  <input
                    type="number"
                    value={modification.additionalModifications.pricePerModification}
                    onChange={(e) => updateProtection({
                      modificationRights: {
                        ...modification,
                        additionalModifications: {
                          pricePerModification: Number(e.target.value),
                        },
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="예: 50000"
                  />
                </div>
              </div>

              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={modification.substantialChanges.requiresConsent}
                    onChange={(e) => updateProtection({
                      modificationRights: {
                        ...modification,
                        substantialChanges: {
                          ...modification.substantialChanges,
                          requiresConsent: e.target.checked,
                        },
                      }
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    본질적 변경은 창작자의 서면 동의 필요
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-2 ml-6">
                  작품의 주제/메시지/스타일 변경, 일부 삭제/추가 등은 본질적 변경으로 간주
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 3. 비밀유지 */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="text-info" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">비밀유지</h3>
                <p className="text-sm text-gray-600">계약 내용 및 작업 정보 보호</p>
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableConfidentiality}
                onChange={(e) => updateProtection({ confidentiality: e.target.checked ? confidentiality : undefined })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">포함</span>
            </label>
          </div>

          {enableConfidentiality && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀 유지 기간 (계약 종료 후)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={confidentiality.duration}
                    onChange={(e) => updateProtection({ confidentiality: { ...confidentiality, duration: Number(e.target.value) } })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                    max="10"
                  />
                  <span className="text-sm text-gray-600">년</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀 정보 범위</label>
                <div className="space-y-2">
                  {confidentiality.scope.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-primary-500">•</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 안내 메시지 */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>팁:</strong> 보호 조항은 선택사항이지만, 크레딧 명기와 수정 권리는 반드시 추가하는 것을 권장해요.
          포트폴리오 사용과 저작인격권 보호에 매우 중요합니다!
        </p>
      </div>
    </div>
  );
}

function getFieldName(field?: string): string {
  const map: any = {
    design: '디자인',
    photography: '사진',
    writing: '글',
    music: '음악',
    video: '영상',
    voice: '성우',
    translation: '번역',
    other: '창작',
  };
  return map[field || 'other'] || '창작';
}
