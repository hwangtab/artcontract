'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

interface AIRecommendationBannerProps {
  title: string;
  description: string | React.ReactNode;
  actionLabel: string;
  appliedLabel?: string;
  onApply: () => void;
  isApplied?: boolean;
  disabled?: boolean;
}

export default function AIRecommendationBanner({
  title,
  description,
  actionLabel,
  appliedLabel = '✓ 적용됨',
  onApply,
  isApplied = false,
  disabled = false,
}: AIRecommendationBannerProps) {
  return (
    <div className="p-5 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Sparkles className="text-primary-500" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <div className="text-sm text-gray-700 mb-3">
            {description}
          </div>
          <Button
            size="small"
            onClick={onApply}
            disabled={isApplied || disabled}
          >
            {isApplied ? appliedLabel : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
