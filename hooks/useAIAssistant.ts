'use client';

import { useState, useCallback, useRef } from 'react';
import { AIMessage, AIContext } from '@/types/ai-assistant';
import { ContractFormData } from '@/types/contract';

export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const processingRef = useRef<Set<string>>(new Set()); // 진행 중인 메시지 추적
  const addedMessageIds = useRef<Set<string>>(new Set()); // 추가된 메시지 ID 추적

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
      const requestKey = `${content}_${Date.now()}`;
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
        });

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

        const errorMessage: AIMessage = {
          id: `msg_${Date.now()}_error_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: '죄송해요, 잠시 문제가 있어요. 다시 한번 물어봐 주세요! 😊',
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
