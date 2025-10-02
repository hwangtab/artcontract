import { NextRequest, NextResponse } from 'next/server';
import { handleConversation } from '@/lib/ai/conversation-handler';
import { ChatRequest, ChatResponse } from '@/types/api';
import { AIContext } from '@/types/ai-assistant';
import { aiRateLimiter, getClientIp } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  // Rate Limiting 체크
  const clientIp = getClientIp(request);
  const rateLimitResult = aiRateLimiter.check(clientIp);

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          details: `${retryAfter}초 후에 다시 시도할 수 있습니다.`,
        },
        timestamp: new Date().toISOString(),
      } as ChatResponse,
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        }
      }
    );
  }

  try {
    const body: ChatRequest = await request.json();

    const { message, context } = body;

    if (!message || !context) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '메시지와 컨텍스트가 필요합니다.',
          },
          timestamp: new Date().toISOString(),
        } as ChatResponse,
        { status: 400 }
      );
    }

    const aiContext: AIContext = {
      currentStep: context.currentStep,
      formData: context.formData,
      incompletedFields: [],
      riskLevel: context.formData.riskLevel || 'low',
      conversationHistory: context.conversationHistory.map((msg: any) => ({
        id: msg.id || `msg_${Date.now()}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()),
      })),
    };

    const response = await handleConversation(message, aiContext);

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    } as ChatResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHAT_FAILED',
          message: 'AI 대화 중 오류가 발생했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      } as ChatResponse,
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
