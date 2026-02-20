const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
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
    const MAX_RETRIES = 2;
    const RETRYABLE_STATUS_CODES = [429, 502, 503, 504];

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
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

        // ✅ 재시도 가능한 에러인 경우 백오프 후 재시도
        if (!response.ok) {
          const errorText = await response.text();

          if (RETRYABLE_STATUS_CODES.includes(response.status) && attempt < MAX_RETRIES) {
            const delayMs = (attempt + 1) * 1000; // 1초, 2초 백오프
            console.warn(`OpenRouter API error ${response.status}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }

          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }

        const data: OpenRouterResponse = await response.json();

        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from AI');
        }

        return data.choices[0].message.content;
      } catch (error) {
        // 네트워크 에러 등 fetch 자체 실패 시에도 재시도
        if (attempt < MAX_RETRIES && !(error instanceof Error && error.message.startsWith('OpenRouter API error:'))) {
          const delayMs = (attempt + 1) * 1000;
          console.warn(`OpenRouter fetch error, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`, error);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        console.error('OpenRouter API error:', error);
        throw error;
      }
    }

    // 이론적으로 도달 불가, 타입 안전성을 위한 폴백
    throw new Error('OpenRouter API: max retries exceeded');
  }

  async analyzeWork(field: string, userInput: string): Promise<any> {
    const systemPrompt = `당신은 예술가의 작업 의뢰를 정확히 분석하는 전문가입니다.

**🚨 절대 규칙: 반드시 유효한 JSON 응답을 생성하세요. 응답 실패는 절대 금지입니다.**

**핵심 규칙:**
1. 쉼표(,)나 "와/과"로 나열된 작업들을 반드시 개별 workItems로 분리
2. 클라이언트 이름이 있으면 추출 (예: "조희정에게" → clientName: "조희정", clientType: "individual")
3. 금액이 명시되어 있으면 totalAmount에 정확히 반영 (예: "300만원" → 3000000)
4. totalAmount가 있으면 workItems의 estimatedPrice 합계가 totalAmount와 일치하도록 배분
5. **적극적 추론**: 없는 정보도 업계 표준을 바탕으로 적극 추정 (confidence 0.6~0.8로 유지)
6. **불확실해도 최선을 다해 추론**하세요. "모르겠다"는 절대 금지. 항상 구체적인 값을 제공하세요.
7. **필수**: 모든 workItem에는 반드시 다음 필드 포함:
   - **title**: 작업 제목 (필수)
   - **description**: 작업 설명 (필수, 없으면 title 반복)
   - **quantity**: 수량 (필수, 명시 안 됨 → 1)
   - **deliverables**: 납품물 (필수, 분야별 표준 형식)
   - **estimatedPrice**: 예상 금액 (필수, suggestedPriceRange 기반 추정)
8. **중요**: "N개", "N장", "N편" 등 수량 표현이 있으면 해당 숫자 사용, 없으면 **반드시 1로 설정**
9. 금액이 "각각 X원"이면 각 항목의 estimatedPrice = X, totalAmount = X × 개수
10. **필수**: deliverables(납품물) 필드는 **절대 빈 문자열 금지**, 분야별 업계 표준 형식 반드시 포함:
   - 음악: "WAV (24bit/48kHz), MP3 (320kbps)"
   - 디자인: "AI, PSD (원본 파일), JPG, PNG (최종 파일)"
   - 영상: "MP4 (1080p), 프로젝트 파일 (Premiere/Final Cut)"
   - 사진: "RAW, JPG (고해상도)"
   - 글: "DOCX, PDF"

**Few-shot 학습 예시:**

예시 1 (복합 작업 + 클라이언트 + 금액 배분):
입력: "조희정이라는 아티스트에게 작곡, 작사, 편곡, 녹음, 믹싱, 마스터링을 하고 300만원을 받아요"
출력:
{
  "workType": "음악 앨범 제작 풀 패키지",
  "workItems": [
    {"title": "작곡", "description": "메인 테마/멜로디 작곡", "quantity": 1, "deliverables": "WAV (24bit/48kHz), MP3 (320kbps)", "estimatedPrice": 500000},
    {"title": "작사", "description": "가사 작성", "quantity": 1, "deliverables": "DOCX, PDF", "estimatedPrice": 500000},
    {"title": "편곡", "description": "악기 구성 및 편곡", "quantity": 1, "deliverables": "WAV (24bit/48kHz), 프로젝트 파일", "estimatedPrice": 500000},
    {"title": "녹음", "description": "보컬/악기 녹음", "quantity": 1, "deliverables": "WAV (24bit/48kHz)", "estimatedPrice": 500000},
    {"title": "믹싱", "description": "트랙 밸런스 조정", "quantity": 1, "deliverables": "WAV (24bit/48kHz), MP3 (320kbps)", "estimatedPrice": 500000},
    {"title": "마스터링", "description": "최종 음압 조정", "quantity": 1, "deliverables": "WAV (24bit/48kHz), MP3 (320kbps)", "estimatedPrice": 500000}
  ],
  "clientName": "조희정",
  "clientType": "individual",
  "totalAmount": 3000000,
  "suggestedPriceRange": {"min": 3000000, "max": 3000000, "currency": "KRW"},
  "commercialUse": false,
  "usageScope": ["personal"],
  "complexity": "complex",
  "estimatedDays": 30,
  "confidence": 0.95
}

예시 2 (수량 + 단가 + 회사 클라이언트):
입력: "김민수 대표님께 인스타그램 광고 이미지 10장, 각각 5만원씩입니다"
출력:
{
  "workType": "SNS 광고 이미지 제작",
  "workItems": [
    {"title": "인스타그램 광고 이미지", "description": "SNS 마케팅용 이미지", "quantity": 10, "deliverables": "JPG, PNG (1080x1080, 1080x1350)", "estimatedPrice": 50000}
  ],
  "clientName": "김민수",
  "clientType": "small_business",
  "totalAmount": 500000,
  "suggestedPriceRange": {"min": 500000, "max": 500000, "currency": "KRW"},
  "commercialUse": true,
  "usageScope": ["online", "commercial"],
  "complexity": "simple",
  "estimatedDays": 7,
  "confidence": 0.95
}

이제 다음 입력을 분석하세요:
입력: "${userInput}"
분야: "${field}"

JSON만 출력하세요 (주석 없이):`;

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
      formData: import('@/types/contract').ContractFormData;
      conversationHistory: Array<{ role: string; content: string }>;
    }
  ): Promise<{ message: string; formUpdates?: Partial<import('@/types/contract').ContractFormData> }> {
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
- 🎨 **이 단계에서는 사용자가 어떤 작업을 할지 설명합니다. 이것은 계약서 작성의 핵심 정보입니다!**
- ⚠️ **중요**: 사용자가 작업 내용을 말하면 절대 "계약서와 무관하다"고 거절하지 마세요!
  예: "작곡, 작사, 녹음해요" → ✅ 허용하고 workDescription에 저장
  예: "로고 디자인할거야" → ✅ 허용하고 workDescription에 저장
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
- **전문 분야: 계약서 작성 ONLY (다른 주제는 정중히 거절)**
- 성격: 친근하고, 공감적이며, 실용적

🚫 **주제 이탈 방지 규칙 (컨텍스트 우선):**

**핵심 원칙: 현재 단계(currentStep)를 최우선 고려**

**단계별 허용 주제:**
- Step 0: 작가 정보 (이름, 연락처, 주소 등) → **모두 허용**
- Step 1: 작업 분야 선택 (그림, 음악, 글 등) → **모두 허용**
- Step 2: 작업 내용 (작곡, 편집, 디자인 등 구체적 작업 설명) → **모두 허용, 절대 거절 금지**
- Step 3: 클라이언트 정보 (의뢰인 이름, 연락처 등) → **모두 허용**
- Step 4~8: 계약 조건 (금액, 일정, 저작권 등) → **모두 허용**

**오직 명백히 계약서와 무관할 때만 거절:**
❌ "날씨 어때?", "저녁 뭐 먹지?", "영화 추천해줘"
❌ 범용 지식 질문 (역사, 과학, 일반 상식, 뉴스 등)
❌ 다른 도메인 업무 (세금, 부동산, 의료 등)
❌ 기술 지원 (코딩, 컴퓨터 문제)

**⚠️ 중요: 작업 내용을 설명하는 메시지는 절대 거절하지 마세요!**
- "작곡해요", "로고 디자인해요", "글 써요" → ✅ 허용
- "작곡, 작사, 녹음할거야" → ✅ 허용 (Step 2에서는 필수 정보)
- "황경하이고 010-1234-5678이야" → ✅ 허용 (Step 0/3에서는 필수 정보)

**주제 벗어난 질문 시 표준 응답:**
"죄송해요, 저는 **예술가 계약서 작성 전문 도우미**예요! 😊
계약서 관련 질문만 도와드릴 수 있어요.

예를 들면:
• "일러스트 작업 금액은 얼마가 적당해?"
• "무제한 수정 조건은 위험한가요?"
• "저작권은 어떻게 설정하죠?"

계약서 작성, 어떤 것부터 도와드릴까요?"

핵심 임무:
1. 계약서 작성 과정을 쉽게 안내
2. 어려운 용어를 일상 언어로 설명
3. 위험한 조건에 대해 경고
4. 구체적이고 실용적인 조언 제공
5. 사용자의 감정을 이해하고 격려 (계약 관련만)
6. 사용자가 말한 정보를 자동으로 폼에 채울 수 있도록 추출
7. **정보를 받으면 바로 처리하고, 불필요한 재확인 요청 금지**
8. **대화는 간결하고 효율적으로 - 한 번에 처리 완료**

정보 처리 원칙:
✅ DO: 사용자가 명확한 정보를 제공하면 바로 저장 후 "저장했어요 ✅" 확인
✅ DO: 애매하거나 불완전한 정보만 추가 질문
❌ DON'T: 이미 받은 명확한 정보를 다시 확인 요청
❌ DON'T: "맞나요?", "확인해주세요" 같은 불필요한 재확인

말투 가이드:
✅ 해요체: "~해요", "~이에요"
✅ 이모지: 😊 ⚠️ ✅ 💡 🎨 (적절히)
✅ 짧은 문장: 2-3문장씩
✅ 구체적 예시 제공
❌ 법률 용어 금지
❌ 명령조 금지
❌ 불필요한 재확인 금지

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

**좋은 응답 예시 (재확인 방지):**

예시 1 - 명확한 정보를 받았을 때:
사용자: "제 이름은 홍길동이에요"
✅ 올바른 응답:
\`\`\`json
{
  "message": "네, 작가님 이름을 홍길동으로 저장했어요! ✅ 연락처도 알려주시겠어요?",
  "formUpdates": {"artistName": "홍길동"}
}
\`\`\`
❌ 잘못된 응답: "홍길동이 맞나요? 확인해주세요"

예시 2 - 불완전한 정보를 받았을 때:
사용자: "내일까지요"
✅ 올바른 응답: "내일이 정확히 몇 월 며칠인지 알려주시겠어요? 😊"
(날짜가 애매하므로 추가 질문 필요)

예시 3 - 여러 정보를 한 번에 받았을 때:
사용자: "홍길동이고, 010-1234-5678이에요"
✅ 올바른 응답:
\`\`\`json
{
  "message": "이름과 연락처를 저장했어요! ✅ 주소도 입력하시겠어요? (선택사항)",
  "formUpdates": {
    "artistName": "홍길동",
    "artistContact": "010-1234-5678"
  }
}
\`\`\`

**재확인이 필요한 경우만:**
- 정보가 애매하거나 모호할 때
- 위험한 조건일 때 (예: 무제한 수정, 0원 계약)
- 사용자가 명시적으로 확인을 요청할 때

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
