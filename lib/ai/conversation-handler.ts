import { AIContext, AIMessage, AIResponse } from '@/types/ai-assistant';
import { getOpenRouterClient } from './openrouter-client';
import { getFAQResponse } from '../ai-assistant/faq-database';

export async function handleConversation(
  userMessage: string,
  context: AIContext
): Promise<AIResponse> {
  // 1. FAQ 먼저 확인 (빠른 응답)
  const faqResponse = getFAQResponse(userMessage, context.currentStep);

  if (faqResponse) {
    return {
      message: faqResponse.answer,
      confidence: 0.9,
    };
  }

  // 2. AI 대화 처리
  const client = getOpenRouterClient();

  try {
    const response = await client.chatWithAssistant(userMessage, {
      currentStep: context.currentStep,
      formData: context.formData,
      conversationHistory: context.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    return {
      message: response,
      confidence: 0.8,
    };
  } catch (error) {
    console.error('Conversation handler error:', error);

    return {
      message: '죄송해요, 잠시 문제가 있어요. 다시 한번 물어봐 주세요! 😊',
      confidence: 0,
      warnings: ['AI 서비스에 일시적인 문제가 발생했습니다.'],
    };
  }
}

export function createAIMessage(
  role: 'user' | 'assistant' | 'system',
  content: string,
  type?: 'text' | 'warning' | 'suggestion' | 'proactive'
): AIMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
    type,
  };
}
