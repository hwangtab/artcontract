'use client';

import React from 'react';
import Input from '../../shared/Input';
import { User } from 'lucide-react';

interface Step00Props {
  artistName?: string;
  artistContact?: string;
  artistIdNumber?: string;
  artistAddress?: string;
  onUpdate: (data: {
    artistName?: string;
    artistContact?: string;
    artistIdNumber?: string;
    artistAddress?: string;
  }) => void;
}

export default function Step00ArtistInfo({
  artistName,
  artistContact,
  artistIdNumber,
  artistAddress,
  onUpdate,
}: Step00Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">먼저 작가님 정보를 알려주세요</h2>
        <p className="text-gray-600">
          계약서 '을'에 해당하는 작가님의 정보입니다
        </p>
      </div>

      <div className="mt-8 space-y-6 max-w-2xl mx-auto">
        {/* 필수 정보 */}
        <div className="bg-white p-6 rounded-xl border-2 border-primary-200 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-primary-500" />
            필수 정보
          </h3>

          <Input
            label="작가 이름 *"
            value={artistName || ''}
            onChange={(value) =>
              onUpdate({ artistName: value, artistContact, artistIdNumber, artistAddress })
            }
            placeholder="홍길동"
            helper="실명을 입력하세요 (계약서에 표기됩니다)"
            required
          />

          <Input
            label="연락처 *"
            value={artistContact || ''}
            onChange={(value) =>
              onUpdate({ artistName, artistContact: value, artistIdNumber, artistAddress })
            }
            placeholder="010-1234-5678 또는 email@example.com"
            helper="전화번호 또는 이메일 주소"
            required
          />
        </div>

        {/* 선택 정보 */}
        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            선택 정보 (더 완성도 높은 계약서를 원하신다면)
          </h3>

          <Input
            label="주민등록번호 뒷자리 또는 사업자번호"
            value={artistIdNumber || ''}
            onChange={(value) =>
              onUpdate({ artistName, artistContact, artistIdNumber: value, artistAddress })
            }
            placeholder="예: 1234567 또는 123-45-67890"
            helper="고액 계약(100만원 이상) 시 권장"
          />

          <Input
            label="주소"
            value={artistAddress || ''}
            onChange={(value) =>
              onUpdate({ artistName, artistContact, artistIdNumber, artistAddress: value })
            }
            placeholder="서울시 강남구 테헤란로 123"
            helper="정식 계약서에는 주소가 명시되는 것이 좋습니다"
          />
        </div>

        {/* 안내 메시지 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>개인정보 보호:</strong> 입력하신 정보는 계약서 생성에만 사용되며, 서버에 저장되지 않습니다.
            브라우저를 닫으면 모든 정보가 삭제됩니다.
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            ✅ <strong>왜 필요한가요?</strong> 정식 계약서에는 '갑'과 '을' 모두의 정보가 명시되어야 법적 효력이 있습니다.
            작가님의 정보를 입력하면 더 안전한 계약이 가능해요.
          </p>
        </div>
      </div>
    </div>
  );
}
