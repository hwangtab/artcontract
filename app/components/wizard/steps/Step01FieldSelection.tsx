'use client';

import React, { useState } from 'react';
import { Palette, Camera, PenTool, Music, Video, Mic, Languages, MoreHorizontal } from 'lucide-react';
import Card from '../../shared/Card';
import Input from '../../shared/Input';
import { ArtField } from '@/types/contract';

interface Step01Props {
  selectedField?: ArtField;
  subField?: string;
  onSelect: (field: ArtField) => void;
  onSubFieldChange?: (subField: string) => void;
}

const fields = [
  {
    id: 'design' as ArtField,
    label: '🎨 그림/디자인',
    description: '일러스트, 웹툰, 로고, 포스터',
    icon: Palette,
    subFields: ['일러스트', '웹툰', '캐릭터 디자인', '로고 디자인', '포스터 디자인', 'UI/UX 디자인', '패키지 디자인', '기타'],
  },
  {
    id: 'photography' as ArtField,
    label: '📸 사진',
    description: '인물, 상품, 행사 촬영',
    icon: Camera,
    subFields: ['인물 사진', '제품 사진', '행사 촬영', '음식 사진', '건축 사진', '패션 사진', '기타'],
  },
  {
    id: 'video' as ArtField,
    label: '🎬 영상',
    description: '촬영, 편집, 애니메이션',
    icon: Video,
    subFields: ['영상 촬영', '영상 편집', '모션그래픽', '애니메이션', '유튜브 영상', '광고 영상', '기타'],
  },
  {
    id: 'writing' as ArtField,
    label: '✍️ 글쓰기',
    description: '카피, 콘텐츠, 시나리오',
    icon: PenTool,
    subFields: ['광고 카피', '블로그 콘텐츠', '시나리오', '웹소설', '칼럼', '기사 작성', '기타'],
  },
  {
    id: 'music' as ArtField,
    label: '🎵 음악',
    description: '작곡, 편곡, 녹음',
    icon: Music,
    subFields: ['작곡', '편곡', '믹싱/마스터링', '악기 연주', 'MR 제작', 'BGM 제작', '기타'],
  },
  {
    id: 'voice' as ArtField,
    label: '🎤 성우/더빙',
    description: '내레이션, 캐릭터 보이스',
    icon: Mic,
    subFields: ['내레이션', '캐릭터 보이스', '광고 성우', '오디오북', '더빙', '기타'],
  },
  {
    id: 'translation' as ArtField,
    label: '🌐 번역',
    description: '문서, 영상, 통번역',
    icon: Languages,
    subFields: ['문서 번역', '영상 자막', '통역', '기술 번역', '문학 번역', '기타'],
  },
  {
    id: 'other' as ArtField,
    label: '📦 기타',
    description: '위 분야에 없는 작업',
    icon: MoreHorizontal,
    subFields: [],
  },
];

export default function Step01FieldSelection({ selectedField, subField, onSelect, onSubFieldChange }: Step01Props) {
  const [customSubField, setCustomSubField] = useState('');
  const selectedFieldData = fields.find(f => f.id === selectedField);

  const handleSubFieldSelect = (value: string) => {
    if (value === '기타') {
      // "기타" 선택 시 직접 입력 모드
      setCustomSubField('');
      onSubFieldChange?.('');
    } else {
      setCustomSubField('');
      onSubFieldChange?.(value);
    }
  };

  const handleCustomSubFieldChange = (value: string) => {
    setCustomSubField(value);
    onSubFieldChange?.(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">어떤 작업을 하세요?</h2>
        <p className="text-gray-600">정확한 분야를 선택하면 더 안전한 계약서를 만들 수 있어요!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <Card
              key={field.id}
              selected={selectedField === field.id}
              onClick={() => onSelect(field.id)}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-3 rounded-full ${selectedField === field.id ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Icon size={24} className={selectedField === field.id ? 'text-primary-500' : 'text-gray-600'} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{field.label}</h3>
                  <p className="text-xs text-gray-600">{field.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 세부 장르 선택 */}
      {selectedField && selectedFieldData && selectedFieldData.subFields.length > 0 && (
        <div className="mt-6 p-6 bg-white rounded-xl border-2 border-primary-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">세부 장르를 선택하세요</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {selectedFieldData.subFields.map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubFieldSelect(sub)}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                  subField === sub || (sub === '기타' && customSubField)
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* "기타" 선택 시 직접 입력 */}
          {(subField === '기타' || customSubField) && (
            <div className="mt-4">
              <Input
                label="세부 장르를 직접 입력하세요"
                value={customSubField || subField || ''}
                onChange={handleCustomSubFieldChange}
                placeholder="예: 3D 모델링, 자수 디자인 등"
                helper="정확하게 입력하면 계약서가 더 명확해져요"
              />
            </div>
          )}
        </div>
      )}

      {/* "기타" 분야 선택 시 직접 입력 */}
      {selectedField === 'other' && (
        <div className="mt-6 p-6 bg-white rounded-xl border-2 border-amber-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">작업 분야를 직접 입력하세요</h3>
          <Input
            label="작업 분야"
            value={subField || ''}
            onChange={(value) => onSubFieldChange?.(value)}
            placeholder="예: 자수, 도예, 금속공예, 퍼포먼스 등"
            helper="어떤 창작 활동이든 괜찮아요!"
            required
          />
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>팁:</strong> 세부 장르까지 선택하면 계약서가 더 정확하고 안전해져요!
        </p>
      </div>
    </div>
  );
}
