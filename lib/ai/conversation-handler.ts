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

    // ✅ AI 응답 검증 3: 단계별 주제 이탈 거짓 양성 방지
    if (response.message.startsWith(standardRefusalMessage)) {
      // Step 2: 작업 내용 설명은 계약서의 핵심이므로 거절 금지
      if (context.currentStep === 2) {
        console.warn('False positive detected: User is describing work in Step 2, but AI refused');
        return {
          message: "구체적으로 어떤 작업을 하시는지 조금 더 자세히 설명해주시겠어요? 😊",
          confidence: 0.5,
        };
      }

      // 기타 단계: AI의 판단 신뢰
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
    // ✅ 에러를 상위(/api/chat)로 전파하여 프론트엔드가 에러 상태를 올바르게 인식하도록 함
    throw error;
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
