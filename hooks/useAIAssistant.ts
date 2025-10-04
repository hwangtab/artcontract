'use client';

import { useState, useCallback, useRef } from 'react';
import { AIMessage, AIContext } from '@/types/ai-assistant';
import { ContractFormData } from '@/types/contract';

export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 중복 방지 시스템 설명:
  // - processingRef: 동일한 요청의 중복 API 호출 방지 (사용자 메시지용)
  // - addedMessageIds: 동일 메시지의 UI 중복 렌더링 방지 (AI 응답 & proactive 메시지용)
  const processingRef = useRef<Set<string>>(new Set());
  const addedMessageIds = useRef<Set<string>>(new Set());

  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      formData: ContractFormData,
      currentStep: number,
      onFormUpdate?: (updates: Partial<ContractFormData>) => void
    ) => {
      // 중복 요청 방지
      const requestKey = `${content}_${currentStep}`.trim();
      if (processingRef.current.has(requestKey)) {
        return;
      }
      processingRef.current.add(requestKey);

      // 사용자 메시지 추가
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content,
        timestamp: new Date(),
        type: 'text',
      };

      // 이미 추가된 메시지인지 확인
      if (addedMessageIds.current.has(userMessage.id)) {
        processingRef.current.delete(requestKey);
        return;
      }
      addedMessageIds.current.add(userMessage.id);

      let currentMessages: AIMessage[] = [];

      setMessages((prev) => {
        currentMessages = [...prev, userMessage];
        return currentMessages;
      });

      setIsLoading(true);

      try {
        // ✅ 타임아웃 설정 (15초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // API 호출 - 현재 메시지 목록을 변수에서 참조
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            context: {
              currentStep,
              formData,
              conversationHistory: currentMessages,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // HTTP 오류 체크 (Rate Limit, Server Error 등)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          let errorContent = '죄송해요, 잠시 문제가 있어요. 다시 시도해주세요 😊';

          if (response.status === 429) {
            errorContent = '요청이 너무 많아요 😅 잠시 후 (1분 뒤) 다시 시도해주세요!';
          } else if (response.status >= 500) {
            errorContent = '서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해주세요 🙏';
          }

          throw new Error(errorContent);
        }

        const data = await response.json();

        if (data.success) {
          const assistantMessage: AIMessage = {
            id: `msg_${Date.now()}_assistant_${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: data.data.message,
            timestamp: new Date(),
            type: 'text',
            metadata: {
              sourceType: 'ai',
              actionButtons: data.data.actionButtons,
            },
          };

          // 중복 응답 방지
          if (!addedMessageIds.current.has(assistantMessage.id)) {
            addedMessageIds.current.add(assistantMessage.id);
            setMessages((prev) => [...prev, assistantMessage]);
          }

          // AI가 제안한 폼 업데이트가 있으면 자동 적용
          if (data.data.formUpdates && onFormUpdate) {
            onFormUpdate(data.data.formUpdates);
          }
        } else {
          throw new Error(data.error?.message || '응답 실패');
        }
      } catch (error) {
        console.error('AI chat error:', error);

        // ✅ AbortError (타임아웃) 처리
        let errorContent = '죄송해요, 잠시 문제가 있어요. 다시 한번 물어봐 주세요! 😊';

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorContent = '⏱️ 응답 시간이 초과되었어요. 네트워크 상태를 확인하고 다시 시도해주세요!';
          } else {
            errorContent = error.message;
          }
        }

        const errorMessage: AIMessage = {
          id: `msg_${Date.now()}_error_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: errorContent,
          timestamp: new Date(),
          type: 'text',
        };

        if (!addedMessageIds.current.has(errorMessage.id)) {
          addedMessageIds.current.add(errorMessage.id);
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsLoading(false);
        processingRef.current.delete(requestKey);
      }
    },
    [] // messages 의존성 제거
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    addedMessageIds.current.clear();
    processingRef.current.clear();
  }, []);

  const addProactiveMessage = useCallback((content: string, severity: 'info' | 'warning' | 'danger') => {
    // ✅ 같은 내용의 메시지가 이미 있는지 체크 (내용 기반 중복 방지)
    const contentKey = `proactive_${content}`;
    if (addedMessageIds.current.has(contentKey)) {
      return; // 중복 차단
    }

    const message: AIMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_proactive`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      type: 'proactive',
      metadata: {
        sourceType: 'ai',
      },
    };

    addedMessageIds.current.add(contentKey);
    setMessages((prev) => [...prev, message]);
    setIsOpen(true); // 자동으로 열기
  }, []);

  return {
    isOpen,
    messages,
    isLoading,
    openAssistant,
    closeAssistant,
    toggleAssistant,
    sendMessage,
    clearMessages,
    addProactiveMessage,
  };
}
