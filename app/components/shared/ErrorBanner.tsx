'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
}

export default function ErrorBanner({
  message,
  onRetry,
  retryLabel = '다시 시도',
  showRetry = true,
}: ErrorBannerProps) {
  return (
    <div className="p-5 bg-danger/10 border-2 border-danger rounded-xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-danger flex-shrink-0 mt-0.5" size={24} />
        <div className="flex-1">
          <p className="font-medium text-danger-dark mb-2">{message}</p>
          {showRetry && onRetry && (
            <Button
              size="small"
              variant="secondary"
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw size={16} />
              <span className="ml-2">{retryLabel}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
