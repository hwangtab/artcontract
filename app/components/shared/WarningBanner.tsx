'use client';

import React from 'react';
import { AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface WarningBannerProps {
  severity: 'info' | 'warning' | 'danger';
  message: string;
  suggestion?: string;
  onDismiss?: () => void;
  dismissible?: boolean;
  actions?: React.ReactNode;
}

export default function WarningBanner({
  severity,
  message,
  suggestion,
  onDismiss,
  dismissible = true,
  actions,
}: WarningBannerProps) {
  const severityConfig = {
    info: {
      bg: 'bg-info/10',
      border: 'border-info',
      text: 'text-info',
      icon: Info,
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning',
      text: 'text-warning',
      icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-danger/10',
      border: 'border-danger',
      text: 'text-danger',
      icon: XCircle,
    },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border-l-4 p-4 rounded-lg relative`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${config.text} flex-shrink-0 mt-0.5`} size={20} />
        <div className="flex-1">
          <p className={`font-medium ${config.text}`}>{message}</p>
          {suggestion && (
            <p className="text-sm text-gray-600 mt-1">{suggestion}</p>
          )}
          {actions && <div className="mt-3">{actions}</div>}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
