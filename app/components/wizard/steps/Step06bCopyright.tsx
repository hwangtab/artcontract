'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card from '../../shared/Card';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { CopyrightTerms } from '@/types/contract';

interface Step06bCopyrightProps {
  copyrightTerms?: CopyrightTerms;
  onUpdate: (data: { copyrightTerms: CopyrightTerms }) => void;
}

// ✅ 기본 저작권 조건 (함수로 변경하여 매번 새 Date 객체 생성)
const getDefaultCopyrightTerms = (): CopyrightTerms => ({
  rightsType: 'non_exclusive_license',
  economicRights: {
    reproduction: true,
    distribution: true,
    publicPerformance: false,
    publicTransmission: false,
    exhibition: false,
    rental: false,
  },
  moralRights: {
    attribution: true,
    integrity: true,
    disclosure: true,
  },
  derivativeWorks: {
    included: false,
    separateNegotiation: true,
    additionalFee: undefined,
  },
  usagePeriod: {
    start: new Date(),
    end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 후
    perpetual: false,
  },
  usageRegion: '대한민국',
  usageMedia: ['온라인', '인쇄물'],
});

export default function Step06bCopyright({ copyrightTerms, onUpdate }: Step06bCopyrightProps) {
  // ✅ 로컬 상태로 관리 (성능 개선)
  const [localCopyright, setLocalCopyright] = useState<CopyrightTerms>(
    () => copyrightTerms || getDefaultCopyrightTerms()
  );

  // ✅ 최신 localCopyright 값을 추적 (cleanup에서 사용)
  const localCopyrightRef = useRef(localCopyright);
  useEffect(() => {
    localCopyrightRef.current = localCopyright;
  }, [localCopyright]);

  // ✅ props 변경 시 로컬 상태 동기화
  useEffect(() => {
    if (copyrightTerms) {
      setLocalCopyright(copyrightTerms);
    }
  }, [copyrightTerms]);

  // ✅ 컴포넌트 unmount 시에만 변경사항 일괄 저장
  useEffect(() => {
    return () => {
      onUpdate({ copyrightTerms: localCopyrightRef.current });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ 빈 배열: unmount 시에만 실행

  const defaultTerms = getDefaultCopyrightTerms();
  const selectedRightsType = localCopyright.rightsType;
  const economicRights = localCopyright.economicRights;
  const derivativeWorks = localCopyright.derivativeWorks;
  const usagePeriod = localCopyright.usagePeriod || defaultTerms.usagePeriod!;
  const usageRegion = localCopyright.usageRegion || defaultTerms.usageRegion!;

  const rightsTypes = [
    {
      id: 'non_exclusive_license' as const,
      label: '비독점적 이용허락',
      description: '여러 곳에 동시 허락 가능, 창작자도 자유롭게 사용',
      price: '낮음',
      safety: 'high',
      emoji: '✅',
      recommended: true,
    },
    {
      id: 'exclusive_license' as const,
      label: '독점적 이용허락',
      description: '특정 기간/지역 동안 독점 사용, 창작자는 해당 기간 중 사용 불가',
      price: '높음',
      safety: 'medium',
      emoji: '⚠️',
    },
    {
      id: 'partial_transfer' as const,
      label: '일부 양도',
      description: '특정 권리만 양도, 나머지 권리는 창작자 보유',
      price: '중간',
      safety: 'medium',
      emoji: '📝',
    },
    {
      id: 'full_transfer' as const,
      label: '전부 양도',
      description: '모든 권리 양도, 창작자는 더 이상 사용 불가',
      price: '매우 높음',
      safety: 'low',
      emoji: '🚨',
      warning: true,
    },
  ];

  // ✅ 로컬 상태만 업데이트 (unmount 시 일괄 저장)
  const updateCopyright = (updates: Partial<CopyrightTerms>) => {
    setLocalCopyright(prev => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">저작권 관리</h2>
        <p className="text-gray-600">작품의 권리를 명확히 정해요 (선택사항)</p>
      </div>

      {/* 저작인격권 안내 (항상 표시) */}
      <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-300">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🛡️ 저작인격권은 항상 창작자 보유</h3>
            <p className="text-sm text-gray-700">
              저작권법에 따라 <strong>저작인격권은 양도할 수 없습니다.</strong> 다음 권리는 항상 창작자에게 있어요:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• <strong>성명표시권</strong>: 이름을 표시할 권리</li>
              <li>• <strong>동일성유지권</strong>: 작품이 훼손되지 않을 권리</li>
              <li>• <strong>공표권</strong>: 작품 공개 여부를 결정할 권리</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 권리 형태 선택 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">1. 권리 형태 선택</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rightsTypes.map((type) => (
            <Card
              key={type.id}
              selected={selectedRightsType === type.id}
              onClick={() => updateCopyright({ rightsType: type.id })}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{type.emoji}</span>
                  {type.recommended && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      권장
                    </span>
                  )}
                  {type.warning && (
                    <span className="text-xs bg-danger/10 text-danger px-2 py-1 rounded">
                      신중히
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900">{type.label}</h4>
                <p className="text-sm text-gray-600">{type.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    type.safety === 'high' ? 'bg-success/10 text-success' :
                    type.safety === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-danger/10 text-danger'
                  }`}>
                    대금 수준: {type.price}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 저작재산권 체크박스 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">2. 저작재산권 범위</h3>
        <p className="text-sm text-gray-600">클라이언트가 사용할 수 있는 권리를 선택하세요</p>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={economicRights.reproduction}
              onChange={(e) => updateCopyright({ economicRights: { ...economicRights, reproduction: e.target.checked } })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">복제권</div>
              <div className="text-xs text-gray-500">복사, 인쇄</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={economicRights.distribution}
              onChange={(e) => updateCopyright({ economicRights: { ...economicRights, distribution: e.target.checked } })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">배포권</div>
              <div className="text-xs text-gray-500">판매, 대여, 배포</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={economicRights.publicPerformance}
              onChange={(e) => updateCopyright({ economicRights: { ...economicRights, publicPerformance: e.target.checked } })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">공연권</div>
              <div className="text-xs text-gray-500">공개 공연</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={economicRights.publicTransmission}
              onChange={(e) => updateCopyright({ economicRights: { ...economicRights, publicTransmission: e.target.checked } })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">공중송신권</div>
              <div className="text-xs text-gray-500">방송, 인터넷 전송</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={economicRights.exhibition}
              onChange={(e) => updateCopyright({ economicRights: { ...economicRights, exhibition: e.target.checked } })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">전시권</div>
              <div className="text-xs text-gray-500">전시</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={economicRights.rental}
              onChange={(e) => updateCopyright({ economicRights: { ...economicRights, rental: e.target.checked } })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">대여권</div>
              <div className="text-xs text-gray-500">대여</div>
            </div>
          </label>
        </div>
      </div>

      {/* 2차적저작물작성권 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">3. 2차적저작물작성권</h3>

        <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-warning flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-gray-700">
              <strong>2차적저작물작성권</strong>은 번역, 각색, 변형, 영상화 등을 할 수 있는 권리입니다.
              <strong className="text-warning"> 반드시 별도 대금을 받고 협의하세요!</strong>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={derivativeWorks.separateNegotiation && !derivativeWorks.included}
              onChange={() => updateCopyright({ derivativeWorks: { included: false, separateNegotiation: true } })}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">별도 협의 (권장) ✅</div>
              <div className="text-sm text-gray-500">본 계약에 포함하지 않고 나중에 별도 협의</div>
            </div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={derivativeWorks.included}
              onChange={() => updateCopyright({ derivativeWorks: { ...derivativeWorks, included: true, separateNegotiation: false } })}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">본 계약에 포함 (추가 대금 필요)</div>
              <div className="text-sm text-gray-500">추가 대금을 받고 포함</div>
            </div>
          </label>

          {derivativeWorks.included && (
            <div className="ml-6 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                추가 대금 (원) *
              </label>
              <input
                type="number"
                value={derivativeWorks.additionalFee || ''}
                onChange={(e) => updateCopyright({ derivativeWorks: { ...derivativeWorks, additionalFee: Number(e.target.value) } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="예: 500000"
              />
            </div>
          )}
        </div>
      </div>

      {/* 사용 기간 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">4. 사용 기간</h3>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={usagePeriod.perpetual}
            onChange={(e) => updateCopyright({ usagePeriod: { ...usagePeriod, perpetual: e.target.checked } })}
            className="w-4 h-4"
          />
          <span className="font-medium">무기한 사용</span>
        </label>

        {!usagePeriod.perpetual && (
          <div className="grid grid-cols-2 gap-4 ml-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
              <input
                type="date"
                value={usagePeriod.start.toISOString().split('T')[0]}
                onChange={(e) => updateCopyright({ usagePeriod: { ...usagePeriod, start: new Date(e.target.value + 'T00:00:00') } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
              <input
                type="date"
                value={usagePeriod.end.toISOString().split('T')[0]}
                onChange={(e) => updateCopyright({ usagePeriod: { ...usagePeriod, end: new Date(e.target.value + 'T00:00:00') } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* 사용 지역 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">5. 사용 지역</h3>
        <select
          value={usageRegion}
          onChange={(e) => updateCopyright({ usageRegion: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="대한민국">대한민국</option>
          <option value="아시아">아시아</option>
          <option value="전세계">전세계</option>
        </select>
      </div>

      {/* 안내 메시지 */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-blue-800">
            💡 <strong>팁:</strong> 저작권 관리가 복잡하다면 이 단계를 건너뛰어도 돼요.
            기본적인 권리 조항이 자동으로 포함됩니다.
            고액 계약(100만원 이상)은 반드시 법률 전문가와 상담하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
