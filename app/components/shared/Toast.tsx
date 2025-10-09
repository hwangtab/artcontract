'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-success',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-danger',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-info',
      icon: Info,
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`fixed top-6 md:top-auto md:bottom-6 right-6 ${config.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 z-50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className="hover:bg-white/20 rounded p-1"
        aria-label="알림 닫기"
      >
        <X size={16} />
      </button>
    </div>
  );
}
