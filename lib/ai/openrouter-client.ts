const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'x-ai/grok-4-fast:free';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
  }

  async chat(
    messages: OpenRouterMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://artcontract.vercel.app',
          'X-Title': 'ArtContract',
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async analyzeWork(field: string, userInput: string): Promise<any> {
    const systemPrompt = `당신은 예술가의 작업을 정확히 이해하고 분류하는 전문가입니다.

입력: "${userInput}"
분야: "${field}"

다음 JSON 형식으로 정확히 분석하세요 (JSON만 출력):

{
  "workType": "구체적 작업 분류",
  "clientType": "individual|small_business|enterprise|unknown",
  "commercialUse": true|false,
  "usageScope": "personal|commercial|online|print|unlimited",
  "complexity": "simple|medium|complex",
  "riskFactors": ["위험 요소들"],
  "suggestedPriceRange": {
    "min": 숫자,
    "max": 숫자,
    "currency": "KRW"
  },
  "additionalClauses": ["추가 조항들"],
  "confidence": 0.0~1.0
}

분석 기준:
1. 상업적 사용 여부 명확히 판단
2. 클라이언트 규모 추정
3. 한국 시장 가격 기준
4. 예술가 보호 관점`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ]);

    try {
      // JSON 응답 파싱
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Failed to parse AI analysis:', error);
      throw new Error('AI 분석 결과를 처리할 수 없습니다');
    }
  }

  async chatWithAssistant(
    userMessage: string,
    context: {
      currentStep: number;
      formData: any;
      conversationHistory: Array<{ role: string; content: string }>;
    }
  ): Promise<{ message: string; formUpdates?: any }> {
    const systemPrompt = `당신은 예술가들의 계약서 작성을 돕는 친절한 AI 도우미입니다.

정체성:
- 이름: AI 도우미 (단순하게)
- 역할: 예술가가 안전하게 계약하도록 돕는 조력자
- 성격: 친근하고, 공감적이며, 실용적

핵심 임무:
1. 계약서 작성 과정을 쉽게 안내
2. 어려운 용어를 일상 언어로 설명
3. 위험한 조건에 대해 경고
4. 구체적이고 실용적인 조언 제공
5. 사용자의 감정을 이해하고 격려
6. 사용자가 말한 정보를 자동으로 폼에 채울 수 있도록 추출

말투 가이드:
✅ 해요체: "~해요", "~이에요"
✅ 이모지: 😊 ⚠️ ✅ 💡 🎨 (적절히)
✅ 짧은 문장: 2-3문장씩
✅ 구체적 예시 제공
❌ 법률 용어 금지
❌ 명령조 금지

현재 상황:
- 단계: ${context.currentStep}/8
- 입력된 정보: ${JSON.stringify(context.formData, null, 2)}

**중요: 응답 형식**
사용자의 메시지에서 계약 정보를 추출할 수 있다면, 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "message": "사용자에게 보여줄 답변 (200자 이내)",
  "formUpdates": {
    "field": "design",  // 작업 분야
    "subField": "웹툰",  // 세부 장르
    "clientName": "홍길동",  // 클라이언트 이름
    "payment": {"amount": 500000},  // 금액
    "timeline": {"deadline": "2025-12-31"}  // 마감일
    // 등등... 추출 가능한 정보만 포함
  }
}
\`\`\`

추출할 수 없으면 일반 텍스트로 답변하세요.

위 정보를 바탕으로 사용자를 도와주세요.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await this.chat(messages, { temperature: 0.8 });

    // JSON 형식 응답 파싱 시도
    try {
      const jsonMatch = response.match(/```json\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          message: parsed.message,
          formUpdates: parsed.formUpdates,
        };
      }
    } catch (error) {
      // JSON 파싱 실패 시 일반 텍스트로 처리
    }

    // 일반 텍스트 응답
    return { message: response };
  }
}

// 싱글톤 인스턴스
let clientInstance: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!clientInstance) {
    clientInstance = new OpenRouterClient();
  }
  return clientInstance;
}
