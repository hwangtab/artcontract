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

    // ✅ AI 응답 검증 1: timeline.deadline 유효성 체크
    if (response.formUpdates?.timeline?.deadline) {
      const deadline = new Date(response.formUpdates.timeline.deadline);
      if (isNaN(deadline.getTime())) {
        console.warn('AI returned invalid deadline:', response.formUpdates.timeline.deadline);
        // 잘못된 날짜는 제거
        delete response.formUpdates.timeline.deadline;
      }
    }

    // ✅ AI 응답 검증 2: 주제 이탈 감지 (안전망)
    const offTopicPatterns = [
      /날씨.*(?:맑|흐림|비|눈|더워|추워|쾌청)/i,
      /(?:요리|음식|레시피).*(?:만들|끓이|볶|조리)/i,
      /(?:영화|드라마|예능).*(?:추천|재미|관람|시청)/i,
      /(?:게임|오락).*(?:플레이|공략|레벨|캐릭터)/i,
      /(?:주식|코인|투자).*(?:시세|매수|매도|상승|하락)/i,
      /(?:여행|관광).*(?:숙소|항공|패키지)/i,
      /(?:정치|선거|의원|대통령).*(?:정책|공약|투표)/i,
    ];

    const isOffTopic = offTopicPatterns.some(pattern => pattern.test(response.message));

    if (isOffTopic) {
      console.warn('Off-topic response detected, replacing with standard message');
      return {
        message: '죄송해요, 저는 **예술가 계약서 작성 전문 도우미**예요! 😊\n계약서 관련 질문만 도와드릴 수 있어요.\n\n예를 들면:\n• "일러스트 작업 금액은 얼마가 적당해?"\n• "무제한 수정 조건은 위험한가요?"\n• "저작권은 어떻게 설정하죠?"\n\n계약서 작성, 어떤 것부터 도와드릴까요?',
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
