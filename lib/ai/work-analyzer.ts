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
  workType: z.string().default('작업'),
  workItems: z.array(WorkItemSchema).optional(),
  clientName: z.string().optional(),
  clientType: z.enum(['individual', 'small_business', 'enterprise', 'unknown']).default('unknown'),
  totalAmount: z.number().optional(),
  commercialUse: z.boolean().default(false),
  usageScope: z.array(z.enum(['personal', 'commercial', 'online', 'print', 'unlimited'])).default(['personal']),
  complexity: z.enum(['simple', 'medium', 'complex']).default('medium'),
  riskFactors: z.array(z.string()).default([]),
  suggestedPriceRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }).default({ min: 100000, max: 500000, currency: 'KRW' }),
  estimatedDays: z.number().optional(),
  additionalClauses: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
});

// Fallback 분석 결과 생성 함수 (적극적이고 유용한 기본값 제공)
function createFallbackAnalysis(userInput: string, reason: string): WorkAnalysis {
  console.warn(`AI analysis fallback triggered: ${reason}, providing helpful defaults`);

  // 입력 텍스트 기반으로 기본 작업 항목 생성
  const basicWorkItem = {
    title: userInput.slice(0, 50) || '작업',
    description: userInput || '작업 내용을 확인해주세요',
    quantity: 1,
    deliverables: '협의 후 결정',
    estimatedPrice: 500000,
  };

  return {
    workType: userInput.slice(0, 50) || '작업',
    workItems: [basicWorkItem],
    clientType: 'unknown',
    commercialUse: false,
    usageScope: ['personal'],
    complexity: 'medium',
    riskFactors: [], // 부정적 메시지 제거
    suggestedPriceRange: {
      min: 300000,
      max: 800000,
      currency: 'KRW',
    },
    additionalClauses: ['작업 상세 내용은 협의 후 확정합니다.'],
    confidence: 0.4,
  };
}

export async function analyzeWork(
  field: string,
  userInput: string
): Promise<WorkAnalysis> {
  const client = getOpenRouterClient();

  try {
    const analysis = await client.analyzeWork(field, userInput);

    // ✅ Level 1: 스키마 검증 (관대한 기본값 적용)
    const validationResult = WorkAnalysisSchema.safeParse(analysis);

    if (!validationResult.success) {
      console.warn('AI response validation failed, attempting partial parse:', validationResult.error);

      // ✅ Level 2: 부분 파싱 시도 (일부 필드만 추출)
      try {
        const partialData = {
          workType: analysis.workType || userInput.slice(0, 50),
          workItems: analysis.workItems || undefined,
          clientName: analysis.clientName,
          clientType: analysis.clientType || 'unknown',
          totalAmount: analysis.totalAmount,
          commercialUse: analysis.commercialUse ?? false,
          usageScope: Array.isArray(analysis.usageScope) ? analysis.usageScope : ['personal'],
          complexity: analysis.complexity || 'medium',
          riskFactors: Array.isArray(analysis.riskFactors) ? analysis.riskFactors : [],
          suggestedPriceRange: analysis.suggestedPriceRange || { min: 300000, max: 800000, currency: 'KRW' },
          estimatedDays: analysis.estimatedDays,
          additionalClauses: Array.isArray(analysis.additionalClauses) ? analysis.additionalClauses : [],
          confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.5,
        };

        console.log('Partial parse successful, using cleaned data');
        return partialData as WorkAnalysis;
      } catch (partialError) {
        console.warn('Partial parse failed, using fallback');
        return createFallbackAnalysis(userInput, 'Partial parse failed');
      }
    }

    // ✅ 검증 통과 시 원본 데이터 반환
    console.log('AI analysis successful, confidence:', validationResult.data.confidence);
    return validationResult.data;
  } catch (error) {
    console.error('Work analysis API call failed:', error);
    // ✅ Level 3: 완전 실패 시에도 유용한 기본값 제공
    return createFallbackAnalysis(userInput, 'API call failed');
  }
}
