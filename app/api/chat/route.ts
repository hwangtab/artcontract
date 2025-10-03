import { NextRequest, NextResponse } from 'next/server';
import { handleConversation } from '@/lib/ai/conversation-handler';
import { ChatRequest, ChatResponse, ChatMessage } from '@/types/api';
import { AIContext } from '@/types/ai-assistant';
import { aiRateLimiter } from '@/lib/utils/rate-limiter';
import { withApiHandler } from '@/lib/api/withApiHandler';

async function handler(request: NextRequest): Promise<NextResponse> {
  let body: ChatRequest;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'JSON 형식이 올바르지 않습니다.',
          details: error instanceof Error ? error.message : undefined,
        },
        timestamp: new Date().toISOString(),
      } as ChatResponse,
      { status: 400 }
    );
  }

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
    conversationHistory: context.conversationHistory.map((msg: ChatMessage) => ({
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
}

export const POST = withApiHandler(handler, { rateLimiter: aiRateLimiter });

export const runtime = 'edge';
