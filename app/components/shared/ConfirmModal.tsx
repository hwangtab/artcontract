'use client';

import React, { useEffect, useRef } from 'react';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  // 모달 열릴 때 확인 버튼에 포커스
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  // 포커스 트랩 (모달 내부에만 포커스 유지)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab: 역방향
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: 정방향
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  // 백드롭 클릭 시 닫기
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="modal-title"
          className="text-lg font-semibold text-gray-900 mb-3"
        >
          {title}
        </h3>

        <div
          id="modal-message"
          className="text-gray-700 mb-6 whitespace-pre-line"
        >
          {message}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            size="medium"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant="primary"
            size="medium"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
