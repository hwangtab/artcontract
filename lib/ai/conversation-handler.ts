import { AIContext, AIMessage, AIResponse } from '@/types/ai-assistant';
import { getOpenRouterClient } from './openrouter-client';
import { getFAQResponse } from '../ai-assistant/faq-database';
import { isValidDateString } from '../utils/date-helpers';

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

    // ✅ AI 응답 검증 1: timeline.deadline 유효성 체크
    if (response.formUpdates?.timeline?.deadline && !isValidDateString(response.formUpdates.timeline.deadline)) {
      console.warn('AI returned invalid deadline:', response.formUpdates.timeline.deadline);
      // 잘못된 날짜는 제거
      delete response.formUpdates.timeline.deadline;
    }

    // ✅ AI 응답 검증 2: 주제 이탈 감지 (System Prompt 신뢰 방식)
    // AI가 스스로 주제 이탈로 판단하고 표준 거절 메시지를 생성했는지 확인
    const standardRefusalMessage = '죄송해요, 저는 **예술가 계약서 작성 전문 도우미**예요!';

    if (response.message.startsWith(standardRefusalMessage)) {
      // AI가 이미 주제 이탈로 판단하여 거절 메시지 생성함
      console.warn('Off-topic detected by AI itself');
      return {
        message: response.message, // AI가 생성한 거절 메시지 사용
        confidence: 0.1,
      };
    }

    return {
      message: response.message,
      formUpdates: response.formUpdates,
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
