'use client';

import React, { useRef, useEffect } from 'react';
import { AIMessage } from '@/types/ai-assistant';
import { ContractFormData } from '@/types/contract';
import { Send, Loader } from 'lucide-react';
import { getQuickQuestions } from '@/lib/ai-assistant/faq-database';

interface AssistantWindowProps {
  messages: AIMessage[];
  isLoading: boolean;
  currentStep: number;
  onSendMessage: (message: string) => void;
}

export default function AssistantWindow({
  messages,
  isLoading,
  currentStep,
  onSendMessage,
}: AssistantWindowProps) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickQuestions = getQuickQuestions(currentStep);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickQuestion = (question: string) => {
    onSendMessage(question);
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-primary-500 text-white p-4 rounded-t-2xl">
        <h3 className="font-semibold flex items-center gap-2">
          💬 AI 도우미
        </h3>
        <p className="text-sm text-primary-100 mt-1">
          궁금한 게 있으면 물어보세요!
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-sm mt-4">
            <div className="mb-6">
              <p className="text-lg mb-2">👋 안녕하세요! AI 도우미예요.</p>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-xl mb-4 text-left">
              <p className="font-semibold text-primary-700 mb-2 flex items-center gap-2">
                ✨ 자동 입력 기능
              </p>
              <p className="text-gray-700 text-xs leading-relaxed mb-3">
                저와 대화하면 입력 내용이<br />
                자동으로 폼에 채워져요!
              </p>
              <div className="bg-white/80 p-3 rounded-lg text-xs">
                <p className="text-gray-600 mb-1">💬 예시:</p>
                <p className="text-primary-600 font-medium mb-1">
                  "웹툰 작업 50만원에 할게요"
                </p>
                <p className="text-gray-500 text-xs">
                  → 분야, 장르, 금액 자동 입력 ✓
                </p>
              </div>
            </div>

            <p className="text-gray-500 text-xs">
              궁금한 점이 있으면 편하게 물어보세요 😊
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : message.type === 'proactive'
                  ? 'bg-warning/10 border border-warning text-gray-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.metadata?.actionButtons && (
                <div className="mt-2 space-y-1">
                  {message.metadata.actionButtons.map((button, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left text-xs px-2 py-1 rounded bg-white/50 hover:bg-white/80 transition-colors"
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <Loader size={16} className="animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && quickQuestions.length > 0 && (
        <div className="px-4 pb-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2 mt-2">빠른 질문:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.slice(0, 3).map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
