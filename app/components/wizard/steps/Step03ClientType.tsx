'use client';

import React from 'react';
import Card from '../../shared/Card';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import { Users, Building2, Store, Sparkles } from 'lucide-react';
import { ClientType, WorkAnalysis } from '@/types/contract';

interface Step03Props {
  clientType?: ClientType;
  clientName?: string;
  clientContact?: string;
  aiAnalysis?: WorkAnalysis;
  onUpdate: (data: { clientType?: ClientType; clientName?: string; clientContact?: string }) => void;
}

const clientTypes = [
  {
    id: 'individual' as ClientType,
    label: '👤 개인',
    description: '개인 고객, 프리랜서',
    icon: Users,
  },
  {
    id: 'small_business' as ClientType,
    label: '🏪 소상공인',
    description: '카페, 미용실, 작은 가게',
    icon: Store,
  },
  {
    id: 'enterprise' as ClientType,
    label: '🏢 기업',
    description: '중소기업, 대기업',
    icon: Building2,
  },
];

export default function Step03ClientType({
  clientType,
  clientName,
  clientContact,
  aiAnalysis,
  onUpdate,
}: Step03Props) {
  const getClientTypeLabel = (type?: ClientType) => {
    switch (type) {
      case 'individual':
        return '👤 개인';
      case 'small_business':
        return '🏪 소상공인';
      case 'enterprise':
        return '🏢 기업';
      default:
        return '미정';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">클라이언트는 누구신가요?</h2>
        <p className="text-gray-600">클라이언트 유형에 따라 계약 조건이 달라질 수 있어요</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* AI 추천 배너 */}
        {aiAnalysis && aiAnalysis.clientType && aiAnalysis.clientType !== 'unknown' && (
          <div className="p-5 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Sparkles className="text-primary-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">💡 AI 추천</h3>
                <p className="text-sm text-gray-700 mb-3">
                  분석 결과 <strong className="text-primary-600">{getClientTypeLabel(aiAnalysis.clientType)}</strong>로 보입니다.
                </p>
                <Button
                  size="small"
                  onClick={() => onUpdate({ clientType: aiAnalysis.clientType, clientName, clientContact })}
                  disabled={clientType === aiAnalysis.clientType}
                >
                  {clientType === aiAnalysis.clientType ? '✓ 적용됨' : '이 정보로 자동 채우기'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clientTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                selected={clientType === type.id}
                onClick={() => onUpdate({ clientType: type.id, clientName, clientContact })}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={`p-4 rounded-full ${
                      clientType === type.id ? 'bg-primary-100' : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={28}
                      className={clientType === type.id ? 'text-primary-500' : 'text-gray-600'}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {clientType && (
          <div className="space-y-4 mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">
              클라이언트 정보 <span className="text-danger">*</span>
            </h3>

            <Input
              label="클라이언트 이름/상호"
              value={clientName || ''}
              onChange={(value) => onUpdate({ clientType, clientName: value, clientContact })}
              placeholder="예: 홍길동, 카페모카"
              helper="계약서에 표시될 이름입니다 (필수)"
              required
            />

            <Input
              label="연락처 (선택)"
              value={clientContact || ''}
              onChange={(value) => onUpdate({ clientType, clientName, clientContact: value })}
              placeholder="010-1234-5678 또는 email@example.com"
              helper="전화번호 또는 이메일 주소"
            />
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>팁:</strong> 클라이언트 이름은 필수예요. 연락처는 선택사항이지만 입력하면 더 안전한 계약서가 돼요!
          </p>
        </div>
      </div>
    </div>
  );
}
