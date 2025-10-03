import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, getClientIp } from '@/lib/utils/rate-limiter';

export interface ApiHandlerOptions {
  rateLimiter?: RateLimiter;
  requireAuth?: boolean;
}

/**
 * API 라우트 핸들러를 위한 고차 함수
 * Rate Limiting, 에러 처리 등 공통 로직을 추상화
 */
export function withApiHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: ApiHandlerOptions
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Rate Limiting 체크
      if (options?.rateLimiter) {
        const clientIp = getClientIp(request);
        const rateLimitResult = options.rateLimiter.check(clientIp);

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
            },
            {
              status: 429,
              headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimitResult.reset.toString(),
              },
            }
          );
        }
      }

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
