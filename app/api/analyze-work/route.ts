import { NextRequest, NextResponse } from 'next/server';
import { analyzeWork } from '@/lib/ai/work-analyzer';
import { AnalyzeWorkRequest, AnalyzeWorkResponse } from '@/types/api';
import { withApiHandler } from '@/lib/api/withApiHandler';

async function handler(request: NextRequest): Promise<NextResponse> {
  let body: AnalyzeWorkRequest;
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
      } as AnalyzeWorkResponse,
      { status: 400 }
    );
  }

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

  // ✅ AI API 호출 에러 핸들링
  try {
    const analysis = await analyzeWork(field, userInput);

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    } as AnalyzeWorkResponse);
  } catch (error) {
    console.error('AI work analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AI_SERVICE_ERROR',
          message: 'AI 분석 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
          details: error instanceof Error ? error.message : undefined,
        },
        timestamp: new Date().toISOString(),
      } as AnalyzeWorkResponse,
      { status: 500 }
    );
  }
}

export const POST = withApiHandler(handler);

export const runtime = 'edge';
