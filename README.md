# 🎨 ArtContract

**예술가를 위한 계약서 자동 생성 웹앱**

5분만에 안전한 계약서를 만드세요. AI가 위험을 미리 경고하고 보호합니다.

## 🎯 프로젝트 비전

"계약 지식이 없어 피해를 보는 예술가를 없애자"

### 핵심 가치

- **접근성**: 누구나 5분 안에 안전한 계약서를 만들 수 있다
- **신뢰성**: AI가 위험을 미리 경고하고 보호한다
- **무료**: 모든 예술가가 비용 부담 없이 사용할 수 있다
- **공감**: 예술가의 언어로 말하고, 그들의 입장에서 생각한다

## 🚀 빠른 시작

### 1. 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/hwangtab/artcontract.git
cd artcontract

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 OpenRouter API 키를 입력하세요
```

### 2. 환경 변수

`.env.local` 파일에 다음 내용을 입력하세요:

```bash
# OpenRouter API Key (필수)
OPENROUTER_API_KEY=your-api-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=ArtContract
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어보세요!

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **AI**: OpenRouter API (x-ai/grok-beta:free)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
artcontract/
├── app/
│   ├── api/              # API 라우트
│   │   ├── analyze-work/ # AI 작업 분석
│   │   ├── chat/         # AI 챗봇
│   │   └── templates/    # 계약서 템플릿
│   ├── components/       # React 컴포넌트
│   │   ├── wizard/       # 8단계 마법사
│   │   ├── ai-assistant/ # AI 도우미
│   │   ├── contract/     # 계약서 생성/표시
│   │   └── shared/       # 공통 컴포넌트
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 메인 페이지
├── lib/
│   ├── ai/               # AI 시스템
│   ├── contract/         # 계약서 생성 엔진
│   ├── ai-assistant/     # FAQ 및 프로액티브 시스템
│   └── utils/            # 유틸리티 함수
├── types/                # TypeScript 타입 정의
├── hooks/                # React 커스텀 훅
└── public/               # 정적 파일
```

## 🎨 주요 기능

### ✅ 구현 완료

1. **8단계 마법사 시스템**
   - Step 1: 작업 분야 선택 (디자인/사진/글쓰기/음악)
   - Step 2: 작업 상세 내용 + AI 자동 분석
   - Step 5: 금액 입력 + AI 추천 가격

2. **AI 시스템**
   - OpenRouter API 통합
   - 작업 분석 및 자동 분류
   - FAQ 기반 빠른 응답 (20개)
   - 하이브리드 AI 챗봇

3. **스마트 검증 시스템**
   - 실시간 입력 검증
   - 위험 수준 자동 평가
   - 프로액티브 경고 시스템
   - 완성도 추적 (%)

4. **계약서 생성 엔진**
   - 4개 분야별 템플릿
   - 동적 변수 치환
   - 조건부 섹션 추가
   - 경고 자동 삽입

5. **UI/UX**
   - 반응형 디자인
   - Pretendard 한글 폰트
   - TailwindCSS 스타일링
   - 직관적인 인터페이스

### 🚧 개발 예정

- Step 3-4, 6-8 구현
- AI 도우미 플로팅 UI
- 계약서 PDF 다운로드
- 전자서명 기능
- 계약 이력 관리

## 🧪 테스트

현재 개발 서버에서 다음을 테스트할 수 있습니다:

1. **작업 분야 선택**: 4가지 분야 중 선택
2. **작업 내용 입력**: 미리 정의된 옵션 또는 자유 입력
3. **AI 분석**: "기타" 입력 시 AI가 자동 분석
4. **금액 설정**: AI 추천 가격 확인
5. **실시간 경고**: 위험한 조건 입력 시 자동 경고

## 📊 API 엔드포인트

### POST `/api/analyze-work`
작업 내용을 AI가 분석하여 분류합니다.

```typescript
// Request
{
  "field": "design",
  "userInput": "카페 로고 디자인"
}

// Response
{
  "success": true,
  "data": {
    "workType": "로고 디자인",
    "commercialUse": true,
    "suggestedPriceRange": {
      "min": 300000,
      "max": 800000
    }
    // ...
  }
}
```

### POST `/api/chat`
AI 도우미와 대화합니다.

```typescript
// Request
{
  "message": "계약금은 얼마나 받아야 하나요?",
  "context": {
    "currentStep": 5,
    "formData": { /* ... */ }
  }
}

// Response
{
  "success": true,
  "data": {
    "message": "보통 총 금액의 30-50%를 계약금으로 받아요..."
  }
}
```

### GET `/api/templates?field=design`
분야별 계약서 템플릿을 가져옵니다.

## 🎯 개발 가이드

### 새로운 마법사 단계 추가하기

1. `app/components/wizard/steps/` 에 새 컴포넌트 생성
2. `WizardContainer.tsx`의 `renderStep()` 에 추가
3. `types/contract.ts` 에 필요한 타입 추가
4. `lib/contract/validator.ts` 에 검증 로직 추가

### FAQ 추가하기

`lib/ai-assistant/faq-database.ts` 파일에 새 FAQ 항목 추가:

```typescript
{
  id: 'faq_xxx',
  question: ['질문1', '질문2'],
  answer: '답변 내용',
  keywords: ['키워드1', '키워드2'],
  category: '카테고리',
}
```

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정

Vercel Dashboard에서 다음 환경 변수를 설정하세요:

- `OPENROUTER_API_KEY`: OpenRouter API 키
- `NEXT_PUBLIC_SITE_URL`: 프로덕션 URL
- `NEXT_PUBLIC_SITE_NAME`: ArtContract

## 📝 라이선스

MIT License - 모든 예술가를 위해 자유롭게 사용하세요!

## 🤝 기여하기

예술가들을 돕는 이 프로젝트에 참여해주세요!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 연락처

- **GitHub**: https://github.com/hwangtab/artcontract
- **Email**: contact@kosmart.org

## 💡 우리의 약속

1. **완전히 무료** - 모든 기능 무료, 제한 없음, 광고 없음
2. **정말 쉬움** - 5분이면 완성, 어려운 말 없음
3. **진짜 안전함** - 위험을 미리 경고, 예술가 편에서 생각
4. **계속 개선** - 사용자 피드백 즉시 반영

---

*"모든 창작자가 자신의 작품으로 정당하게 인정받고, 공정한 대가를 받으며, 안전하게 일할 수 있는 세상을 만들어갑시다."*

**🎨 Let's protect artists together. 🤝**
