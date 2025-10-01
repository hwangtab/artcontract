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
      className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-50 ${
        isOpen
          ? 'bg-gray-600 hover:bg-gray-700'
          : 'bg-primary-500 hover:bg-primary-600 hover:scale-110'
      }`}
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
