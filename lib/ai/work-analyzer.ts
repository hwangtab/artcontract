import { z } from 'zod';
import { WorkAnalysis } from '@/types/contract';
import { getOpenRouterClient } from './openrouter-client';

// ✅ AI 응답 스키마 정의
const WorkItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  deliverables: z.string().optional(),
  estimatedPrice: z.number().optional(),
  quantity: z.number().optional(),
});

const WorkAnalysisSchema = z.object({
  workType: z.string(),
  workItems: z.array(WorkItemSchema).optional(),
  clientName: z.string().optional(),
  clientType: z.enum(['individual', 'small_business', 'enterprise', 'unknown']),
  totalAmount: z.number().optional(),
  commercialUse: z.boolean(),
  usageScope: z.array(z.enum(['personal', 'commercial', 'online', 'print', 'unlimited'])),
  complexity: z.enum(['simple', 'medium', 'complex']),
  riskFactors: z.array(z.string()),
  suggestedPriceRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }),
  estimatedDays: z.number().optional(),
  additionalClauses: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

// Fallback 분석 결과 생성 함수
function createFallbackAnalysis(userInput: string, reason: string): WorkAnalysis {
  console.error(`AI analysis fallback triggered: ${reason}`);

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

export async function analyzeWork(
  field: string,
  userInput: string
): Promise<WorkAnalysis> {
  const client = getOpenRouterClient();

  try {
    const analysis = await client.analyzeWork(field, userInput);

    // ✅ 스키마 검증
    const validationResult = WorkAnalysisSchema.safeParse(analysis);

    if (!validationResult.success) {
      console.error('AI response validation failed:', validationResult.error.errors);
      return createFallbackAnalysis(userInput, 'Schema validation failed');
    }

    // ✅ 검증 통과 시 원본 데이터 반환
    return validationResult.data;
  } catch (error) {
    console.error('Work analysis failed:', error);
    return createFallbackAnalysis(userInput, 'API call failed');
  }
}
