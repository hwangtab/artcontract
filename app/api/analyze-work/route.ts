import { NextRequest, NextResponse } from 'next/server';
import { analyzeWork } from '@/lib/ai/work-analyzer';
import { AnalyzeWorkRequest, AnalyzeWorkResponse } from '@/types/api';
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
      } as AnalyzeWorkResponse,
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
    const body: AnalyzeWorkRequest = await request.json();

    const { field, userInput } = body;

    if (!field || !userInput) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '분야와 작업 내용을 입력해주세요.',
          },
          timestamp: new Date().toISOString(),
        } as AnalyzeWorkResponse,
        { status: 400 }
      );
    }

    const analysis = await analyzeWork(field, userInput);

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    } as AnalyzeWorkResponse);
  } catch (error) {
    console.error('Analyze work API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      } as AnalyzeWorkResponse,
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
