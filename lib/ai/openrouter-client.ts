const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'x-ai/grok-4-fast:free';
const MODEL = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

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
          'X-Title': '한국스마트협동조합 예술인 계약서 작성 도우미',
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

**중요: 입력에서 여러 작업 단계를 감지하면 반드시 workItems 배열로 나눠주세요!**

예시:
- "작곡, 편곡, 믹싱" → workItems 3개
- "로고 디자인과 명함 디자인" → workItems 2개
- "단순 로고 디자인" → workItems null (단일 작업)

다음 JSON 형식으로 정확히 분석하세요 (JSON만 출력, 주석 없이):

{
  "workType": "전체 작업명 (예: 앨범 제작 풀 패키지)",
  "workItems": [  // ✅ 여러 작업이 감지되면 배열로 나눔, 단일 작업이면 null
    {
      "title": "작곡",
      "description": "메인 테마/멜로디 작곡",
      "estimatedPrice": 200000
    },
    {
      "title": "편곡",
      "description": "악기 구성 및 편곡 작업",
      "estimatedPrice": 300000
    }
  ],
  "clientType": "individual 또는 small_business 또는 enterprise 또는 unknown 중 하나",
  "commercialUse": true 또는 false,
  "usageScope": ["personal", "commercial", "online", "print"] 중 해당하는 것들 배열로,
  "complexity": "simple 또는 medium 또는 complex 중 하나",
  "riskFactors": ["위험 요소 1", "위험 요소 2"],
  "suggestedPriceRange": {
    "min": 100000,
    "max": 500000,
    "currency": "KRW"
  },
  "estimatedDays": 7,
  "additionalClauses": ["추가 조항 1", "추가 조항 2"],
  "confidence": 0.8
}

분석 기준:
1. 여러 작업 단계 감지 시 반드시 workItems 배열로 나눔
2. 각 항목에 개별 예상 금액 제시
3. 상업적 사용 여부 명확히 판단
4. 클라이언트 규모 추정
5. 한국 시장 가격 기준
6. 예술가 보호 관점`;

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
    // 단계별 가이드 생성
    const getStepGuidance = (step: number): string => {
      switch (step) {
        case 0:
          return `**현재 단계: 작가 정보 입력**
- 이 단계에서는 계약서의 "을(乙)" 즉 작가님의 정보를 입력해요.
- 필수: 이름, 연락처
- 선택: 주민등록번호 뒷자리(또는 사업자번호), 주소
- 사용자가 자신의 정보를 말하면 artistName, artistContact, artistIdNumber, artistAddress로 추출하세요.`;

        case 1:
          return `**현재 단계: 작업 분야 선택**
- 어떤 종류의 예술 작업인지 선택하는 단계예요.
- 8개 분야: 그림/디자인, 사진, 글쓰기, 음악, 영상, 성우/더빙, 번역, 기타
- 각 분야마다 세부 장르가 있어요 (예: 그림/디자인 → 일러스트, 웹툰, 캐릭터 디자인 등)
- 사용자가 작업 종류를 말하면 field와 subField로 추출하세요.`;

        case 2:
          return `**현재 단계: 작업 상세 설명**
- 구체적으로 어떤 작업을 할 건지 자세히 설명하는 단계예요.
- 작업 내용, 스타일, 분량, 형식 등을 자유롭게 입력해요.
- 너무 짧거나 애매하면 구체적으로 물어보세요 (예: "A4 몇 장 정도예요?", "어떤 스타일을 원하세요?")
- workDescription으로 추출하세요.`;

        case 3:
          return `**현재 단계: 클라이언트 정보**
- 계약서의 "갑(甲)" 즉 의뢰인 정보를 입력하는 단계예요.
- 필수: 이름(또는 회사명), 연락처
- 개인인지, 소규모 사업자인지, 대기업인지도 파악하면 좋아요.
- clientName, clientContact, clientType으로 추출하세요.`;

        case 4:
          return `**현재 단계: 일정**
- 작업 시작일과 마감일을 정하는 단계예요.
- ⚠️ 너무 촉박한 일정(1-3일)이면 러시 요금을 권장하세요!
- 긴 프로젝트(30일 이상)면 중간 점검일도 제안하세요.
- timeline.startDate, timeline.deadline으로 추출하세요 (YYYY-MM-DD 형식).`;

        case 5:
          return `**현재 단계: 금액**
- 작업 대가를 얼마 받을지 정하는 단계예요. 가장 중요한 부분이에요!
- ⚠️ 5만원 미만이면 "너무 저렴하지 않나요?" 물어보세요.
- 💼 100만원 이상이면 계약금(30%)과 법률 자문을 권장하세요.
- 지급 방식(계좌이체, 현금 등)도 물어보세요.
- payment.amount, payment.deposit, payment.paymentMethod로 추출하세요.`;

        case 6:
          return `**현재 단계: 수정 횟수**
- 작업 완료 후 몇 번까지 수정해줄지 정하는 단계예요.
- ⚠️ "무제한"은 위험해요! 꼭 경고하세요.
- 0회는 수정 없음, 1-3회가 일반적, 5회 이상은 많은 편이에요.
- 추가 수정 시 비용도 정할 수 있어요.
- revisions (숫자 또는 'unlimited'), additionalRevisionFee로 추출하세요.`;

        case 7:
          return `**현재 단계: 사용 범위**
- 완성된 작업물을 어디에 어떻게 쓸 수 있는지 정하는 단계예요.
- 옵션: 개인적 사용, 상업적 사용, 온라인, 인쇄물, 무제한
- 💼 상업적 사용이나 무제한이면 가격이 더 높아야 해요!
- 저작권을 양도하는 건지, 사용권만 주는 건지도 중요해요.
- usageScope (배열), commercialUse (true/false)로 추출하세요.`;

        case 8:
          return `**현재 단계: 최종 확인**
- 모든 정보를 입력했고, 이제 계약서를 생성하기 직전이에요.
- 빠진 정보가 있는지, 위험한 조건은 없는지 한 번 더 확인하세요.
- 궁금한 점이 있으면 마지막으로 물어보라고 안내하세요.`;

        default:
          return '';
      }
    };

    const stepGuidance = getStepGuidance(context.currentStep);

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

${stepGuidance}

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
      // 1. 마크다운 코드 블록으로 감싼 JSON
      let jsonMatch = response.match(/```json\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          message: parsed.message,
          formUpdates: parsed.formUpdates,
        };
      }

      // 2. 코드 블록 없이 직접 JSON 객체
      jsonMatch = response.match(/\{[\s\S]*"message"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message,
          formUpdates: parsed.formUpdates,
        };
      }
    } catch (error) {
      // JSON 파싱 실패 시 일반 텍스트로 처리
      console.warn('Failed to parse AI JSON response:', error);
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
