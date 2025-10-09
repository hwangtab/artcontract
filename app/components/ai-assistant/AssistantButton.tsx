'use client';

import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface AssistantButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasNewMessage?: boolean;
}

export default function AssistantButton({
  isOpen,
  onClick,
  hasNewMessage = false,
}: AssistantButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed
        w-14 h-14
        rounded-full
        shadow-lg
        transition-all
        duration-300
        flex
        items-center
        justify-center
        z-50
        touch-manipulation
        ${isOpen
          ? 'bg-gray-600 hover:bg-gray-700'
          : 'bg-primary-500 hover:bg-primary-600 hover:scale-110'
        }
      `}
      style={{
        // ✅ inline style로 위치 제어 (Tailwind CSS 충돌 방지)
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        left: 'calc(1.5rem + env(safe-area-inset-left, 0px))',
      }}
      aria-label={isOpen ? 'AI 도우미 닫기' : 'AI 도우미 열기'}
    >
      {isOpen ? (
        <X size={28} className="text-white" />
      ) : (
        <>
          <MessageCircle size={28} className="text-white" />
          {hasNewMessage && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-danger rounded-full animate-pulse" />
          )}
        </>
      )}
    </button>
  );
}
