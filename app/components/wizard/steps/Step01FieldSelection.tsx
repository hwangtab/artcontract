'use client';

import React from 'react';
import { Palette, Camera, PenTool, Music } from 'lucide-react';
import Card from '../../shared/Card';
import { ArtField } from '@/types/contract';

interface Step01Props {
  selectedField?: ArtField;
  onSelect: (field: ArtField) => void;
}

const fields = [
  {
    id: 'design' as ArtField,
    label: '🎨 그림/디자인',
    description: '로고, 포스터, 일러스트',
    icon: Palette,
  },
  {
    id: 'photography' as ArtField,
    label: '📸 사진/영상',
    description: '촬영, 편집',
    icon: Camera,
  },
  {
    id: 'writing' as ArtField,
    label: '✍️ 글쓰기',
    description: '카피, 시나리오',
    icon: PenTool,
  },
  {
    id: 'music' as ArtField,
    label: '🎵 음악',
    description: '작곡, 녹음',
    icon: Music,
  },
];

export default function Step01FieldSelection({ selectedField, onSelect }: Step01Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">어떤 작업을 하세요?</h2>
        <p className="text-gray-600">정확한 분야를 선택하면 더 안전한 계약서를 만들 수 있어요!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <Card
              key={field.id}
              selected={selectedField === field.id}
              onClick={() => onSelect(field.id)}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-4 rounded-full ${selectedField === field.id ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Icon size={32} className={selectedField === field.id ? 'text-primary-500' : 'text-gray-600'} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{field.label}</h3>
                  <p className="text-sm text-gray-600">{field.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>맥락 도움말:</strong> 정확한 분야를 선택하면 더 안전한 계약서를 만들 수 있어요!
        </p>
      </div>
    </div>
  );
}
