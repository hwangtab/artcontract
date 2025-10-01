'use client';

import { useState, useCallback } from 'react';
import { AIMessage, AIContext } from '@/types/ai-assistant';
import { ContractFormData } from '@/types/contract';

export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      // 사용자 메시지 추가
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
        type: 'text',
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // API 호출
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            context: {
              currentStep,
              formData,
              conversationHistory: messages,
            },
          }),
        });

        const data = await response.json();

        if (data.success) {
          const assistantMessage: AIMessage = {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: data.data.message,
            timestamp: new Date(),
            type: 'text',
            metadata: {
              sourceType: 'ai',
              actionButtons: data.data.actionButtons,
            },
          };

          setMessages((prev) => [...prev, assistantMessage]);

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
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: '죄송해요, 잠시 문제가 있어요. 다시 한번 물어봐 주세요! 😊',
          timestamp: new Date(),
          type: 'text',
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addProactiveMessage = useCallback((content: string, severity: 'info' | 'warning' | 'danger') => {
    const message: AIMessage = {
      id: `msg_${Date.now()}_proactive`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      type: 'proactive',
      metadata: {
        sourceType: 'ai',
      },
    };

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
