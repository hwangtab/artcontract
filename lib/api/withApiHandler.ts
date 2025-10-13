import { NextRequest, NextResponse } from 'next/server';

export interface ApiHandlerOptions {
  requireAuth?: boolean;
}

/**
 * API 라우트 핸들러를 위한 고차 함수
 * 에러 처리 등 공통 로직을 추상화
 */
export function withApiHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: ApiHandlerOptions
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 핸들러 실행
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);

      // JSON 파싱 에러 감지 (400 Bad Request)
      if (error instanceof SyntaxError || error instanceof TypeError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_JSON',
              message: '잘못된 요청 형식입니다.',
              details: '올바른 JSON 형식으로 요청해주세요.',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // 그 외 서버 에러 (500 Internal Server Error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: '서버 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}
