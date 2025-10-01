import { WorkAnalysis } from '@/types/contract';
import { getOpenRouterClient } from './openrouter-client';

export async function analyzeWork(
  field: string,
  userInput: string
): Promise<WorkAnalysis> {
  const client = getOpenRouterClient();

  try {
    const analysis = await client.analyzeWork(field, userInput);

    // 기본값 설정 및 검증
    return {
      workType: analysis.workType || userInput,
      clientType: analysis.clientType || 'unknown',
      commercialUse: analysis.commercialUse || false,
      usageScope: Array.isArray(analysis.usageScope) ? analysis.usageScope : ['personal'],
      complexity: analysis.complexity || 'medium',
      riskFactors: Array.isArray(analysis.riskFactors) ? analysis.riskFactors : [],
      suggestedPriceRange: {
        min: analysis.suggestedPriceRange?.min || 100000,
        max: analysis.suggestedPriceRange?.max || 500000,
        currency: 'KRW',
      },
      additionalClauses: Array.isArray(analysis.additionalClauses)
        ? analysis.additionalClauses
        : [],
      confidence: analysis.confidence || 0.7,
    };
  } catch (error) {
    console.error('Work analysis failed:', error);

    // Fallback: 기본 분석 결과 반환
    return {
      workType: userInput,
      clientType: 'unknown',
      commercialUse: false,
      usageScope: ['personal'],
      complexity: 'medium',
      riskFactors: ['AI 분석이 실패했습니다. 전문가와 상담하세요.'],
      suggestedPriceRange: {
        min: 100000,
        max: 500000,
        currency: 'KRW',
      },
      additionalClauses: [],
      confidence: 0.3,
    };
  }
}
