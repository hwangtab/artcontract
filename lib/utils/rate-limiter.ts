import { LRUCache } from 'lru-cache';

export interface RateLimiterOptions {
  interval: number; // 시간 윈도우 (밀리초)
  uniqueTokenPerInterval: number; // 시간 윈도우당 허용 토큰 수
}

export class RateLimiter {
  private tokenCache: LRUCache<string, number[]>;
  private interval: number;
  private uniqueTokenPerInterval: number;

  constructor(options: RateLimiterOptions) {
    this.interval = options.interval;
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval;

    this.tokenCache = new LRUCache({
      max: 500, // 최대 500개 IP 추적
      ttl: this.interval, // interval 이후 자동 삭제
    });
  }

  /**
   * 요청 제한 확인
   * @param identifier - IP 주소 또는 고유 식별자
   * @returns { success: boolean, remaining: number, reset: number }
   */
  check(identifier: string): {
    success: boolean;
    remaining: number;
    reset: number;
  } {
    const now = Date.now();
    const tokenCount = this.tokenCache.get(identifier) || [];

    // 현재 시간 윈도우 내의 요청만 필터링
    const validTokens = tokenCount.filter(
      (timestamp) => now - timestamp < this.interval
    );

    if (validTokens.length < this.uniqueTokenPerInterval) {
      // 요청 허용
      validTokens.push(now);
      this.tokenCache.set(identifier, validTokens);

      return {
        success: true,
        remaining: this.uniqueTokenPerInterval - validTokens.length,
        reset: now + this.interval,
      };
    } else {
      // 요청 거부
      const oldestToken = validTokens[0];
      const resetTime = oldestToken + this.interval;

      return {
        success: false,
        remaining: 0,
        reset: resetTime,
      };
    }
  }

  /**
   * 특정 identifier의 제한 초기화
   */
  reset(identifier: string): void {
    this.tokenCache.delete(identifier);
  }
}

// 기본 Rate Limiter 인스턴스
// AI API용: 분당 10회 제한
export const aiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 10,
});

// 일반 API용: 분당 30회 제한
export const generalRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 30,
});

/**
 * IP 주소 추출 헬퍼
 */
export function getClientIp(request: Request): string {
  // Vercel Edge Functions에서 IP 추출
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}
