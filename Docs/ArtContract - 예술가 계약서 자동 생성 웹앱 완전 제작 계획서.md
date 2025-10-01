# ArtContract - 예술가 계약서 자동 생성 웹앱 완전 제작 계획서

## 🎯 프로젝트 비전

### 미션

"계약 지식이 없어 피해를 보는 예술가를 없애자"

### 핵심 가치

- **접근성**: 누구나 5분 안에 안전한 계약서를 만들 수 있다
- **신뢰성**: AI가 위험을 미리 경고하고 보호한다
- **무료**: 모든 예술가가 비용 부담 없이 사용할 수 있다
- **공감**: 예술가의 언어로 말하고, 그들의 입장에서 생각한다

### 목표 사용자 페르소나

**페르소나 1: 신입 일러스트레이터 지민 (25세)**

- 프리랜서 경력 6개월
- SNS로 의뢰 받음
- 계약서 작성 경험 無
- "계약금을 못 받고 작업했다가 돈을 떼인 적이 있어요"

**페르소나 2: 중견 사진작가 현수 (32세)**

- 프리랜서 경력 5년
- 주로 웨딩/행사 촬영
- 간단한 계약서는 써봤지만 항상 불안함
- "저작권이나 사용 범위를 어떻게 정해야 할지 모르겠어요"

**페르소나 3: 음악 작곡가 수연 (29세)**

- 프리랜서 경력 3년
- 광고음악, 게임BGM 제작
- 복잡한 라이선스 조건 때문에 고민
- "저작권료를 어떻게 받아야 하는지 헷갈려요"

---

## 🏗️ 기술 아키텍처

### 전체 시스템 구조

```
Frontend (Next.js 14)
    ↓
Vercel Edge Network
    ↓
API Routes (Next.js)
    ├─→ OpenRouter API
    │   └─→ x-ai/grok-beta:free (모든 AI 기능 통합)
    └─→ GitHub Raw Content (템플릿)

```

### AI 역할 통합

```
단일 AI 모델로 모든 기능 처리:
- 작업 분석 (기타 입력 시)
- 챗봇 대화 (실시간 상담)
- 위험 평가 (자동 경고)
- 가격 추천 (시장 분석)

```

### 데이터 플로우

```
사용자 입력
    ↓
[Step 1-8 Wizard]
    ├─→ 선택형 입력 → 로컬 상태 저장
    └─→ "기타" 입력 → AI 분석 → 자동 분류
    ↓
[실시간 검증]
    ├─→ 누락 필드 감지
    ├─→ 위험 조건 감지
    └─→ AI 자동 경고
    ↓
[계약서 생성]
    ├─→ 템플릿 로드 (GitHub)
    ├─→ 데이터 병합
    └─→ 불완전성 표시
    ↓
[결과 출력]
    └─→ 텍스트 복사 / 향후 PDF

```

### 챗봇-마법사 통합 아키텍처

```
┌─────────────────────────────────────┐
│         메인 마법사 UI               │
│  ┌─────────────────────────────┐   │
│  │   Step Content              │   │
│  │   - 제목                     │   │
│  │   - 설명                     │   │
│  │   - 선택지 카드              │   │
│  │   - 입력 필드                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   맥락 기반 도움말           │   │
│  │   💡 이 단계에서는...        │   │
│  │   [빠른 질문 버튼들]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   자동 경고 배너              │   │
│  │   ⚠️ 금액이 정해지지 않았어요 │   │
│  │   [자세히 보기] [해결하기]    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
               ↕️
┌─────────────────────────────────────┐
│      플로팅 AI 도우미 (항상 접근)    │
│  💬 궁금한 게 있으면 물어보세요!     │
└─────────────────────────────────────┘

```

---

## 📱 완전 통합된 UX/UI 설계

### 1. 통합 원칙

**원칙 A: AI 도우미는 보조자, 마법사가 주인공**

- 마법사 = 구조화된 입력 경로 (대부분의 사용자)
- AI 도우미 = 필요할 때만 돕는 조력자 (막힐 때, 궁금할 때)
- 둘은 실시간으로 데이터 공유 (사용자는 한 번만 입력)

**원칙 B: 정보는 한 곳에만 입력**

- 마법사에서 입력 → AI가 컨텍스트로 인지
- AI에서 답변 → 마법사 폼에 자동 반영 가능
- 중복 입력 절대 금지

**원칙 C: 프로액티브하게 도움**

- 사용자가 묻기 전에 문제 감지
- 위험한 선택 시 즉시 경고
- 각 단계마다 적절한 팁 자동 표시

### 2. 단계별 통합 UX

### Step 1: 작업 분야 선택

```
┌─────────────────────────────────────┐
│ 어떤 작업을 하세요? (1/8)            │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │  🎨 그림/디자인│  │  📸 사진/영상 ││
│  │  로고, 포스터  │  │  촬영, 편집   ││
│  └──────────────┘  └──────────────┘│
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │  ✍️ 글쓰기    │  │  🎵 음악     ││
│  │  카피, 시나리오│  │  작곡, 녹음   ││
│  └──────────────┘  └──────────────┘│
│                                     │
├─────────────────────────────────────┤
│ 💡 맥락 도움말                       │
│ 정확한 분야를 선택하면 더 안전한      │
│ 계약서를 만들 수 있어요!             │
│                                     │
│ [궁금한 게 있나요?] 👈 도우미 열기    │
└─────────────────────────────────────┘

```

**통합 포인트:**

- 선택 시 → AI에 자동 컨텍스트 전달
- 하단 도움말 = AI 미리보기 (클릭하면 AI 도우미 열림)
- AI: "그림/디자인을 선택하셨네요! 구체적으로 어떤 작업인가요?"

### Step 2: 구체적 상황

```
┌─────────────────────────────────────┐
│ 정확히 어떤 걸 만들어드리나요? (2/8) │
├─────────────────────────────────────┤
│  ✓ 선택하신 분야: 그림/디자인         │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 🏪 가게 로고 만들기            │  │
│  │ 예: 카페, 미용실, 식당 로고    │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 📋 홍보물 디자인하기           │  │
│  │ 예: 전단지, 포스터, 배너       │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 💭 기타 (설명해주세요)         │  │
│  │ [텍스트 입력창]                │  │
│  │ 💡 AI가 자동으로 분류해드려요  │  │
│  └──────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│ 💬 빠른 질문                         │
│ [로고는 어떤 거?] [가격이 궁금해요]  │
└─────────────────────────────────────┘

```

**통합 포인트:**

- "기타" 입력 시 → AI 분석 중 로딩 표시
- 분석 결과 → "웨딩드레스 쇼핑몰 인스타 광고용 일러스트로 이해했어요. 맞나요?"
- 빠른 질문 버튼 → 즉시 AI 도우미 열림 + 해당 질문 자동 입력

### Step 5: 금액 (가장 중요)

```
┌─────────────────────────────────────┐
│ 얼마 받기로 하셨나요? (5/8)          │
├─────────────────────────────────────┤
│                                     │
│  💰 금액 입력                        │
│  ┌─────────────────┐               │
│  │ [      ] 만원    │               │
│  └─────────────────┘               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💡 AI 추천 금액                │   │
│  │ 카페 로고 작업은 보통           │   │
│  │ 30만원 ~ 80만원이에요          │   │
│  │                               │   │
│  │ [30만원으로 채우기]            │   │
│  │ [50만원으로 채우기]            │   │
│  │ [직접 입력할게요]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ ] 아직 정하지 않았어요            │
│      (나중에 협의할게요)             │
│                                     │
├─────────────────────────────────────┤
│ ⚠️ 자동 경고                         │
│ 금액 없이 일을 시작하면 나중에        │
│ 분쟁 위험이 정말 높아요!             │
│                                     │
│ [왜 그런가요?] [어떻게 정하죠?]      │
└─────────────────────────────────────┘

```

**통합 포인트:**

- AI 추천 금액 = AI 분석 결과 표시
- 추천 버튼 클릭 → 자동 입력 (한 번의 클릭으로 해결)
- "아직 정하지 않음" 체크 → 즉시 경고 배너 표시
- 경고 버튼 → AI 도우미 열림 + 관련 FAQ 자동 표시
- AI에서 금액 조언 → "폼에 바로 입력할까요?" 버튼 제공

### Step 6: 수정 횟수

```
┌─────────────────────────────────────┐
│ 몇 번까지 수정해드리기로 하셨나요? (6/8)│
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │  ✌️ 2-3회     │  │  🖐️ 3-5회   ││
│  │  추천! ⭐     │  │  안전한 범위 ││
│  └──────────────┘  └──────────────┘│
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │  🔢 직접 입력 │  │  🤷 정하지 않음││
│  │  [  ]회       │  │  나중에 협의 ││
│  └──────────────┘  └──────────────┘│
│                                     │
│  [ ] 무제한 수정 ⚠️ 위험!            │
│                                     │
├─────────────────────────────────────┤
│ 💡 실시간 조언                       │
│ 로고 디자인은 보통 2-3번이면           │
│ 충분해요. 대폭 변경 시에는            │
│ 추가 비용을 받는 조항을 넣으세요!     │
│                                     │
│ [추가 비용은 얼마?] [예시 보여줘]     │
└─────────────────────────────────────┘

```

**통합 포인트:**

- 추천 옵션에 별 표시 (AI + 경험 기반)
- "무제한" 선택 시 → 즉시 경고 모달
- 실시간 조언 = AI 프로액티브 메시지
- 빠른 질문 → AI가 구체적 예시 제공
- AI: "3회로 정하고, 추가는 회당 총액의 20%를 받는 게 일반적이에요"

### Step 8: 최종 확인

```
┌─────────────────────────────────────┐
│ 마지막으로 확인할게요! (8/8)         │
├─────────────────────────────────────┤
│                                     │
│  📋 입력하신 정보                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  작업: 카페 로고 디자인     [수정]   │
│  클라이언트: 소상공인       [수정]   │
│  기간: 2주                 [수정]   │
│  금액: 50만원              [수정]   │
│  수정: 3회까지             [수정]   │
│  사용: 상업적 사용         [수정]   │
│                                     │
├─────────────────────────────────────┤
│  🎯 완성도: 100% ✅                 │
│  ┌─────────────────────────────┐   │
│  │ ███████████████████████████ │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✅ 모든 필수 항목이 입력되었어요!   │
│  ✅ 위험한 조건이 없어요!            │
│  ✅ 안전한 계약서가 준비됐어요!      │
│                                     │
├─────────────────────────────────────┤
│  💬 AI 최종 검토                     │
│  "계약금 30%를 먼저 받는 조항을      │
│   추가하시는 게 어떨까요?"           │
│                                     │
│  [좋아요, 추가할게요] [괜찮아요]     │
│                                     │
├─────────────────────────────────────┤
│  [이전 단계로] [계약서 만들기 🎉]    │
└─────────────────────────────────────┘

```

**통합 포인트:**

- 각 항목 옆 [수정] 버튼 → 해당 단계로 즉시 이동
- 완성도 바 = 필수 항목 충족도 시각화
- AI 최종 검토 = AI의 프로액티브 제안
- 제안 수락 시 → 자동으로 조항 추가
- 불완성 항목 있으면 → 빨간색 경고 + AI 자동 팝업

### 3. AI 도우미 UI/UX 완전 재설계

### AI 도우미 위치 전략

```
데스크톱: 우하단 고정 플로팅
모바일: 하단 탭 바 통합 or 풀스크린

┌─────────────────────────────────────┐
│                                     │
│         메인 콘텐츠                  │
│                                     │
│                                     │
│                                     │
│                                     │
│              ┌──────────────┐       │
│              │  💬          │       │
│              │  도움말      │ ← AI  │
│              └──────────────┘       │
└─────────────────────────────────────┘

```

### AI 도우미 상태별 UI

**상태 1: 닫혀있을 때 (미니멀)**

- 작은 플로팅 버튼
- 새 제안 있으면 배지 표시
- 호버 시 미리보기 툴팁

**상태 2: 열렸을 때 (컴팩트)**

- 높이 400px 정도의 창
- 현재 단계 컨텍스트 자동 표시
- 빠른 질문 버튼 3-4개

**상태 3: 확장 모드 (선택적)**

- 화면 절반 차지
- 대화 히스토리 전체 표시
- 상세 설명 및 예시

### AI 도우미 메시지 유형

**Type A: 프로액티브 팁 (자동 발송)**

```
┌─────────────────────────────────┐
│ 💡 [AI 도우미]                   │
│                                 │
│ 5단계에 오신 걸 환영해요!        │
│ 금액은 계약서에서 가장 중요한     │
│ 부분이에요.                      │
│                                 │
│ [금액 정하는 법] [시장 가격은?]  │
└─────────────────────────────────┘

```

**Type B: 경고 (위험 감지 시)**

```
┌─────────────────────────────────┐
│ ⚠️ [AI - 중요]                   │
│                                 │
│ 금액을 정하지 않고 시작하면      │
│ 나중에 99% 문제가 생겨요!       │
│                                 │
│ 최소한 대략적인 금액이라도       │
│ 정해두시는 걸 강력 추천해요.     │
│                                 │
│ [얼마가 적당해?] [예시 보기]     │
└─────────────────────────────────┘

```

**Type C: 대화형 (사용자 질문 응답)**

```
┌─────────────────────────────────┐
│ [사용자]                         │
│ 수정 횟수는 몇 번이 좋아요?      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💬 [AI]                          │
│                                 │
│ 카페 로고 같은 경우는            │
│ 2-3번이면 충분해요!              │
│                                 │
│ 그 이상 필요하면:                │
│ • 4-5회: 회당 10만원 추가        │
│ • 대폭 변경: 별도 견적           │
│                                 │
│ [3회로 설정하기] [더 알려줘]     │
└─────────────────────────────────┘

```

**Type D: 액션 제안 (폼 자동 입력)**

```
┌─────────────────────────────────┐
│ 💬 [AI]                          │
│                                 │
│ 비슷한 작업은 보통               │
│ 30만원~80만원이에요.            │
│                                 │
│ 50만원으로 시작하는 게           │
│ 어떨까요?                        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💰 50만원을 폼에 입력하기     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [다른 금액으로] [더 알아보기]    │
└─────────────────────────────────┘

```

### 4. 마법사↔AI 도우미 실시간 동기화

### 시나리오 1: 마법사 → AI

```
사용자 액션: Step 5에서 금액 미입력, 다음 클릭

마법사 동작:
1. 필수 항목 검증
2. 금액 없음 감지
3. 경고 배너 표시

AI 자동 반응:
1. 플로팅 버튼 흔들림 애니메이션
2. 배지 표시: "중요!"
3. 자동 메시지:
   "⚠️ 금액이 정해지지 않았어요!
    이대로 진행하면 위험해요.
    도움이 필요하신가요?"
4. 빠른 액션:
   [금액 정하기 도와줘]
   [일단 미정으로 진행]

```

### 시나리오 2: AI → 마법사

```
사용자 액션: AI에게 "50만원이 적당할까요?" 질문

AI 응답:
"카페 로고라면 50만원은
 적정한 금액이에요! 👍

 계약금 20만원(40%),
 잔금 30만원으로 나누면
 더 안전해요.

 ┌─────────────────────────────┐
 │ 💰 50만원을 금액란에 입력하기 │
 └─────────────────────────────┘"

사용자가 버튼 클릭:
1. AI 창 자동 닫힘
2. 마법사 Step 5로 자동 이동
3. 금액 필드에 "50" 자동 입력
4. 부드러운 하이라이트 애니메이션
5. 토스트: "✅ 금액이 입력되었어요!"

```

### 시나리오 3: 단계 이동 시 컨텍스트 전환

```
사용자 액션: Step 3 → Step 4 이동

AI 자동 업데이트:
1. 이전 대화 유지
2. 새 컨텍스트 메시지 추가:
   "4단계로 넘어오셨네요!
    작업 기한을 정하는 단계예요.

    💡 너무 촉박한 일정은
       러시 비용을 받는 게 좋아요.

    [기한 정하는 팁] [평균 기간은?]"
3. 빠른 질문 버튼 업데이트
4. 관련 FAQ 자동 로드

```

---

## 🚀 배포 및 CI/CD 완전 가이드

### Vercel 배포 전략

### 1단계: Vercel CLI 설치 및 로그인

```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel 로그인 (브라우저 자동 열림)
vercel login

# 이메일 인증 완료 후 터미널로 돌아옴

# 프로젝트 초기화
cd artcontract
vercel

# 대화형 질문들:
? Set up and deploy "~/artcontract"? [Y/n] Y
? Which scope do you want to deploy to? (개인 계정 선택)
? Link to existing project? [y/N] N
? What's your project's name? artcontract
? In which directory is your code located? ./
? Want to override the settings? [y/N] N

# 자동으로 배포되고 미리보기 URL 생성됨
# 예: https://artcontract-abc123.vercel.app

```

### 2단계: GitHub 저장소 생성 및 연동

```bash
# GitHub에서 새 저장소 생성 (웹)
# Repository name: artcontract
# Public/Private 선택
# README, .gitignore 등은 추가하지 않음

# 로컬에서 Git 초기화
git init
git add .
git commit -m "Initial commit: ArtContract MVP"

# GitHub 저장소와 연결
git remote add origin https://github.com/yourusername/artcontract.git
git branch -M main
git push -u origin main

```

### 3단계: Vercel에서 GitHub 연동

```
Vercel Dashboard (https://vercel.com/dashboard)
→ Add New Project
→ Import Git Repository
→ GitHub 계정 연결 (처음이면)
→ artcontract 저장소 선택
→ Import

환경 변수 설정:
┌─────────────────────────────────────┐
│ Environment Variables                │
├─────────────────────────────────────┤
│ NAME                 │ VALUE         │
├─────────────────────────────────────┤
│ OPENROUTER_API_KEY   │ sk-or-v1-... │
│ NEXT_PUBLIC_SITE_URL │ 프로덕션 URL  │
│ NEXT_PUBLIC_SITE_NAME│ ArtContract   │
└─────────────────────────────────────┘

→ Deploy 클릭

첫 배포 완료!
프로덕션 URL: https://artcontract.vercel.app

```

### 4단계: 자동 배포 설정 (완료!)

```
이제 자동으로 작동:

Git Push → 자동 배포
┌─────────────────────────────────────┐
│ Branch    → Environment → 결과      │
├─────────────────────────────────────┤
│ main      → Production  → 실서비스  │
│ develop   → Preview     → 테스트    │
│ feature/* → Preview     → 미리보기  │
└─────────────────────────────────────┘

Pull Request 생성 → 미리보기 URL 자동 생성
└─ PR에 자동 댓글로 미리보기 링크 추가

```

### Git 브랜치 전략

```
main (프로덕션)
  ↑ PR & 리뷰
develop (스테이징)
  ↑ PR
feature/xxx (기능 개발)

hotfix/xxx (긴급 수정)
  ↓ 직접 main으로

```

### 일상적인 개발 워크플로우

```bash
# 1. 새 기능 개발 시작
git checkout develop
git pull origin develop
git checkout -b feature/pdf-download

# 2. 개발 및 커밋
# ... 코드 작성 ...
git add .
git commit -m "feat: PDF 다운로드 기능 추가

- 계약서를 PDF로 변환하는 기능
- 다운로드 버튼 UI 추가
- 브라우저 프린트 최적화"

git push origin feature/pdf-download

# 3. GitHub에서 Pull Request 생성

# develop ← feature/pdf-download

# Vercel이 자동으로 미리보기 URL 생성

# 예: https://artcontract-pr-42.vercel.app

# 4. 리뷰 및 테스트 완료 후 develop에 병합

# 5. develop이 안정화되면 main으로 병합

git checkout develop
git pull origin develop
git checkout main
git pull origin main
git merge develop
git push origin main

# → 프로덕션 자동 배포!

#### 긴급 수정 (Hotfix)
```bash
# 프로덕션에 심각한 버그 발견 시
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 수정 및 커밋
git add .
git commit -m "hotfix: 계약서 생성 오류 수정"
git push origin hotfix/critical-bug

# main으로 직접 병합 (긴급)
git checkout main
git merge hotfix/critical-bug
git push origin main
# → 즉시 프로덕션 배포

# develop에도 반영
git checkout develop
git merge hotfix/critical-bug
git push origin develop

# hotfix 브랜치 삭제
git branch -d hotfix/critical-bug
git push origin --delete hotfix/critical-bug

# github 저장소 url
https://github.com/hwangtab/artcontract.git
```

### 프로젝트 파일 구조

```
artcontract/
├── .github/
│   └── workflows/
│       └── quality-check.yml    # PR 시 자동 테스트
├── app/
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 메인 마법사 페이지
│   ├── globals.css              # 전역 스타일
│   ├── api/
│   │   ├── analyze-work/
│   │   │   └── route.ts         # "기타" 작업 AI 분석
│   │   ├── chat/
│   │   │   └── route.ts         # AI 대화 API
│   │   └── templates/
│   │       └── route.ts         # 템플릿 제공
│   └── components/
│       ├── wizard/
│       │   ├── WizardContainer.tsx
│       │   ├── ProgressBar.tsx
│       │   ├── NavigationButtons.tsx
│       │   └── steps/
│       │       ├── Step01FieldSelection.tsx
│       │       ├── Step02WorkDetail.tsx
│       │       ├── Step03ClientType.tsx
│       │       ├── Step04Timeline.tsx
│       │       ├── Step05Payment.tsx
│       │       ├── Step06Revisions.tsx
│       │       ├── Step07UsageScope.tsx
│       │       └── Step08FinalCheck.tsx
│       ├── ai-assistant/
│       │   ├── AssistantContainer.tsx
│       │   ├── AssistantButton.tsx
│       │   ├── AssistantWindow.tsx
│       │   ├── MessageList.tsx
│       │   ├── MessageBubble.tsx
│       │   ├── ChatInput.tsx
│       │   ├── QuickQuestions.tsx
│       │   └── ProactiveAlert.tsx
│       ├── contract/
│       │   ├── ContractPreview.tsx
│       │   ├── ContractResult.tsx
│       │   ├── CopyButton.tsx
│       │   └── ShareButton.tsx
│       └── shared/
│           ├── Card.tsx
│           ├── WarningBanner.tsx
│           ├── InfoTooltip.tsx
│           ├── LoadingSpinner.tsx
│           └── Toast.tsx
├── lib/
│   ├── ai/
│   │   ├── openrouter-client.ts    # OpenRouter API 클라이언트
│   │   ├── work-analyzer.ts        # 작업 분석 로직
│   │   └── conversation-handler.ts  # AI 대화 처리
│   ├── contract/
│   │   ├── template-loader.ts       # GitHub 템플릿 로드
│   │   ├── generator.ts             # 계약서 생성
│   │   ├── validator.ts             # 입력 검증
│   │   └── formatter.ts             # 출력 포맷팅
│   ├── ai-assistant/
│   │   ├── faq-database.ts          # FAQ 데이터
│   │   ├── context-manager.ts       # 컨텍스트 관리
│   │   ├── proactive-triggers.ts    # 자동 경고 트리거
│   │   ├── response-handler.ts      # 응답 처리
│   │   └── action-executor.ts       # 액션 실행 (폼 자동 입력)
│   ├── analytics/
│   │   ├── tracker.ts               # 이벤트 추적
│   │   └── logger.ts                # 로그 관리
│   └── utils/
│       ├── date-helpers.ts
│       ├── currency-format.ts
│       ├── validation-rules.ts
│       └── text-helpers.ts
├── types/
│   ├── contract.ts                  # 계약서 관련 타입
│   ├── ai-assistant.ts              # AI 도우미 타입
│   ├── wizard.ts                    # 마법사 타입
│   └── api.ts                       # API 응답 타입
├── hooks/
│   ├── useWizard.ts                 # 마법사 상태 관리
│   ├── useAIAssistant.ts            # AI 도우미 훅
│   ├── useContract.ts               # 계약서 생성 훅
│   └── useWizardSync.ts             # 동기화 훅
├── public/
│   ├── icons/
│   │   ├── design.svg
│   │   ├── photography.svg
│   │   ├── writing.svg
│   │   └── music.svg
│   ├── images/
│   │   └── og-image.png             # 오픈그래프 이미지
│   └── favicon.ico
├── .env.example                     # 환경 변수 예시
├── .env.local                       # 로컬 환경 변수 (git 제외)
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vercel.json                      # Vercel 설정
└── README.md

```

### 핵심 설정 파일

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/templates/:path*",
      "destination": "https://raw.githubusercontent.com/yourusername/art-contract-templates/main/templates/:path*"
    }
  ]
}

```

### .gitignore

```
# dependencies
node_modules/
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

```

### .env.example

```bash
# OpenRouter API Key (필수)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://artcontract.vercel.app
NEXT_PUBLIC_SITE_NAME=ArtContract

# Analytics (선택)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags (선택)
NEXT_PUBLIC_ENABLE_PDF=false
NEXT_PUBLIC_ENABLE_HISTORY=false

```

---

## 📊 데이터 모델 및 타입 정의

### 핵심 타입 시스템

### types/contract.ts

```tsx
// 예술 분야
export type ArtField =
  | 'design'
  | 'photography'
  | 'writing'
  | 'music';

// 클라이언트 유형
export type ClientType =
  | 'individual'
  | 'small_business'
  | 'enterprise'
  | 'unknown';

// 사용 범위
export type UsageScope =
  | 'personal'
  | 'commercial'
  | 'online'
  | 'print'
  | 'unlimited';

// 계약서 폼 데이터
export interface ContractFormData {
  field?: ArtField;
  workType?: string;
  workDescription?: string;
  aiAnalysis?: WorkAnalysis;

  clientType?: ClientType;
  clientName?: string;
  clientContact?: string;

  timeline?: {
    startDate?: Date;
    deadline?: Date;
    estimatedDays?: number;
  };

  payment?: {
    amount?: number;
    currency: 'KRW';
    deposit?: number;
    depositPercentage?: number;
    paymentMethod?: string;
    paymentSchedule?: string;
  };

  revisions?: number | 'unlimited' | null;
  additionalRevisionFee?: number;

  usageScope?: UsageScope[];
  commercialUse?: boolean;
  exclusiveRights?: boolean;

  additionalClauses?: string[];
  specialConditions?: string;

  currentStep: number;
  completeness: number;
  riskLevel: 'low' | 'medium' | 'high';
  warnings: Warning[];
}

// AI 분석 결과
export interface WorkAnalysis {
  workType: string;
  clientType: ClientType;
  commercialUse: boolean;
  usageScope: UsageScope;
  complexity: 'simple' | 'medium' | 'complex';
  riskFactors: string[];
  suggestedPriceRange: {
    min: number;
    max: number;
    currency: string;
  };
  additionalClauses: string[];
  confidence: number;
}

// 경고 시스템
export interface Warning {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
  suggestion: string;
  autoTrigger: boolean;
  dismissible: boolean;
}

// 계약서 템플릿
export interface ContractTemplate {
  template_id: string;
  name: string;
  description: string;
  target_field: ArtField;
  target_work_types: string[];
  sections: {
    [key: string]: TemplateSection;
  };
  conditional_clauses?: ConditionalClause[];
  risk_warnings?: RiskWarning[];
  legal_disclaimer: string;
}

export interface TemplateSection {
  title: string;
  template: string;
  required: boolean;
  order: number;
}

export interface ConditionalClause {
  condition: string;
  additional_text?: string;
  warning?: string;
}

export interface RiskWarning {
  condition: string;
  message: string;
  level: 'info' | 'warning' | 'danger';
}

```

### types/ai-assistant.ts

```tsx
// AI 메시지
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: MessageType;
  metadata?: MessageMetadata;
}

export type MessageType =
  | 'text'
  | 'warning'
  | 'suggestion'
  | 'example'
  | 'proactive';

export interface MessageMetadata {
  relatedStep?: number;
  actionButtons?: ActionButton[];
  sourceType?: 'faq' | 'ai';
  responseTime?: number;
}

// 액션 버튼
export interface ActionButton {
  label: string;
  action: ActionType;
  value?: any;
  style?: 'primary' | 'secondary' | 'danger';
}

export type ActionType =
  | 'fill_field'
  | 'go_to_step'
  | 'show_example'
  | 'open_modal'
  | 'dismiss';

// AI 컨텍스트
export interface AIContext {
  currentStep: number;
  formData: ContractFormData;
  incompletedFields: string[];
  riskLevel: 'low' | 'medium' | 'high';
  userIntent?: string;
  conversationHistory: AIMessage[];
}

// 빠른 질문
export interface QuickQuestion {
  id: string;
  text: string;
  category: string;
  relevantSteps: number[];
}

// FAQ 항목
export interface FAQItem {
  id: string;
  question: string[];
  answer: string;
  keywords: string[];
  category: string;
  examples?: string[];
}

```

---

## 🎨 디자인 시스템

### 컬러 팔레트

```tsx
const colors = {
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
  },

  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

```

### 타이포그래피

```
폰트 패밀리: Pretendard (한글), system-ui (fallback)

크기 체계:
- xs: 12px (캡션, 안내문)
- sm: 14px (본문 작은 글씨)
- base: 16px (기본 본문)
- lg: 18px (강조 본문)
- xl: 20px (소제목)
- 2xl: 24px (중제목)
- 3xl: 30px (대제목)

무게:
- light: 300 (설명)
- regular: 400 (본문)
- medium: 500 (버튼)
- semibold: 600 (소제목)
- bold: 700 (제목)

```

### 컴포넌트 스타일 원칙

### 선택 카드

```
기본 상태:
- 배경: white
- 테두리: 2px solid gray-200
- 패딩: 24px
- 라운드: 12px
- 그림자: 없음

호버:
- 테두리: primary-500
- 그림자: shadow-md
- 트랜지션: 200ms

선택됨:
- 배경: blue-50
- 테두리: primary-500
- 그림자: shadow-lg

```

### 버튼

```
Primary (주요 액션):
- 배경: primary-500
- 텍스트: white
- 높이: 48px
- 호버: scale-105

Secondary (보조 액션):
- 배경: transparent
- 테두리: 2px gray-300
- 텍스트: gray-700
- 호버: border-primary-500

Danger (위험):
- 배경: danger
- 텍스트: white

```

### 입력 필드

```
기본:
- 높이: 48px
- 패딩: 16px
- 테두리: 1px gray-300
- 라운드: 8px

포커스:
- 테두리: primary-500
- 링: 2px primary-500 (opacity 20%)

에러:
- 테두리: danger
- 텍스트: danger

```

---

## 🧩 핵심 기능 상세 설계

### 1. AI 분석 시스템 (단일 모델)

### 작업 분석 프롬프트

```
시스템 역할:
당신은 예술가의 작업을 정확히 이해하고 분류하는 전문가입니다.

입력: "{user_input}"
분야: "{selected_field}"

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
4. 예술가 보호 관점

```

### AI 대화 시스템 프롬프트

```
시스템 역할:
당신은 예술가들의 계약서 작성을 돕는 친절한 AI 도우미입니다.

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

말투 가이드:
✅ 해요체: "~해요", "~이에요"
✅ 이모지: 😊 ⚠️ ✅ 💡 🎨
✅ 짧은 문장: 2-3문장씩
✅ 구체적 예시 제공
❌ 법률 용어 금지
❌ 명령조 금지

지식 범위:
✅ 계약서 기본 구성
✅ 예술 분야별 관행
✅ 흔한 분쟁 사례
✅ 한국 프리랜서 시장
❌ 구체적 법률 자문 (→ 전문가 권유)
❌ 확정적 금액 제시 (→ 범위로)

안전 가이드:
- 법률 자문 요청 → "법률 전문가와 상담하세요"
- 고액 계약 (100만원+) → 반드시 경고
- 위험 조건 발견 → 명확히 경고

현재 상황:
{user_context}

위 정보를 바탕으로 사용자를 도와주세요.

```

### 2. 스마트 검증 시스템

### 실시간 검증 규칙

**금액 검증:**

```
조건 → 결과

null → 🚨 위험 경고
0 → ❌ 오류 (0원 불가)
1~100,000 → 💡 정보 (소액, 계약금 불필요)
100,000~1,000,000 → ✅ 정상 + 계약금 30% 권장
1,000,000+ → ⚠️ 주의 + 법률 자문 필수

```

**수정 횟수 검증:**

```
null → ⚠️ 주의
0 → ⚠️ 경고 (수정 불가?)
1~5 → ✅ 정상
6~10 → ⚠️ 주의 (너무 많음)
'unlimited' → 🚨 위험 경고

```

**기한 검증:**

```
null → ⚠️ 주의
오늘/내일 → 🚨 위험 (촉박)
3~7일 → ⚠️ 주의 + 러시 비용 권장
7~30일 → ✅ 정상
30일+ → 💡 정보 (중간 점검 권장)

```

### 3. 프로액티브 시스템

### 자동 개입 조건

```tsx
const proactiveTriggers = {
  // 단계 진입
  onStepEnter: (step) => {
    if (step === 5) return "💰 금액은 가장 중요해요!";
    if (step === 6) return "✏️ 수정 횟수를 명확히 하세요";
  },

  // 필드 변경
  onFieldChange: (field, value) => {
    if (field === 'revisions' && value === 'unlimited') {
      return {
        severity: 'danger',
        message: "무제한 수정은 매우 위험해요!"
      };
    }
  },

  // 다음 시도
  onNextAttempt: (step, data) => {
    if (step === 5 && !data.payment?.amount) {
      return {
        severity: 'danger',
        message: "금액을 정하지 않으셨어요!",
        blockNext: true
      };
    }
  },

  // 비활동
  onInactivity: (seconds) => {
    if (seconds > 45) {
      return "막히는 부분이 있나요? 도와드릴게요!";
    }
  }
};

```

### 4. 계약서 생성 엔진

### 템플릿 병합 프로세스

```
1. 템플릿 선택
   분야 + 작업 유형 매칭
   ↓
2. 기본 섹션 로드
   - 당사자 정보
   - 작업 내용
   - 금액
   - 기간
   - 수정
   - 사용 권리
   - 저작권
   - 취소/환불
   ↓
3. 조건부 섹션 추가
   if (commercialUse) → 라이선스 조항
   if (amount > 1000000) → 분할 지불
   if (online) → 플랫폼 제한
   ↓
4. 변수 치환
   {artist_name} → 입력값
   {amount:currency} → "500,000원"
   {deadline:date} → "2025년 1월 15일"
   ↓
5. 경고 추가
   미정 항목 표시
   위험 경고 삽입
   법률 자문 권고
   ↓
6. 포맷팅
   마크다운 정리
   번호 매기기
   서명란 추가

```

---

## 📅 세부 개발 일정

### Week 1: 기초 구축 (Day 1-7)

**Day 1-2: 환경 설정**

- Next.js 14 프로젝트 생성
- TypeScript, TailwindCSS 설정
- Vercel CLI 설치 및 로그인
- GitHub 저장소 생성
- 로컬 개발 환경 테스트

**Day 3-4: 타입 및 구조**

- types/ 폴더 전체 타입 정의
- lib/ 폴더 기본 구조
- hooks/ 기본 훅 생성
- API routes 스켈레톤

**Day 5-7: API 연동**

- OpenRouter 클라이언트 구현
- AI 분석 API 테스트
- AI 대화 API 테스트
- 에러 핸들링 구현

### Week 2: 마법사 UI (Day 8-14)

**Day 8-9: Step 1-3**

- 분야 선택 UI
- 작업 상세 (AI 분석 포함)
- 클라이언트 정보 입력

**Day 10-11: Step 4-6**

- 기간 선택
- 금액 입력 (AI 추천 기능)
- 수정 횟수 선택

**Day 12-13: Step 7-8**

- 사용 범위 설정
- 최종 확인 페이지

**Day 14: 공통 컴포넌트**

- ProgressBar
- WarningBanner
- InfoTooltip
- LoadingSpinner
- Toast

### Week 3: AI 도우미 통합 (Day 15-21)

**Day 15-16: AI 도우미 UI**

- 플로팅 버튼
- AI 창 (데스크톱/모바일)
- 메시지 컴포넌트
- 입력 필드

**Day 17-18: AI 로직**

- FAQ 데이터베이스 (30개)
- 컨텍스트 관리 시스템
- 하이브리드 응답 로직
- 액션 버튼 실행

**Day 19-21: 통합 및 동기화**

- 마법사↔AI 실시간 sync
- 프로액티브 시스템
- 자동 경고
- 폼 자동 입력 기능

### Week 4: 계약서 생성 (Day 22-28)

**Day 22-24: 템플릿 시스템**

- GitHub 템플릿 저장소 생성
- 템플릿 로더 구현
- 변수 치환 엔진
- 조건부 섹션 로직

**Day 25-26: 생성 및 출력**

- 계약서 생성기
- 결과 화면
- 복사 기능
- 불완성 표시

**Day 27-28: 테스트**

- 전체 플로우 테스트
- 엣지 케이스 처리
- 모바일 테스트
- 버그 수정

### Week 5-6: 템플릿 제작 (Day 29-42)

**Week 5: 디자인 분야**

- 로고 디자인 (기본, 브랜딩, 심플)
- 일러스트 (단순, 복잡)
- 포스터/전단지
- 웹 디자인

**Week 6: 기타 분야**

- 사진/영상 (인물, 행사, 상품, 상업)
- 글쓰기 (카피, 콘텐츠, 시나리오)
- 음악 (작곡, 편곡, 연주)
- FAQ 30개 완성

### Week 7: 최종 준비 및 배포 (Day 43-49)

**Day 43-44: 최적화**

- 성능 최적화
- 이미지 최적화
- 번들 크기 최소화
- SEO 메타태그

**Day 45-46: 문서화**

- README.md
- 사용자 가이드
- 개발자 문서
- 배포 가이드

**Day 47-49: 프로덕션 배포**

- 환경 변수 설정
- 도메인 연결 (선택)
- SSL 인증서
- 모니터링 설정
- 베타 테스터 초대 (10명)
- 피드백 수집
- 최종 수정
- 공식 런칭! 🚀

---

## 🎯 성공 체크리스트

### 기술적 완성도

- [ ]  8단계 모두 정상 작동
- [ ]  AI 분석 응답 시간 5초 이내
- [ ]  AI 대화 응답 시간 3초 이내
- [ ]  모바일 완벽 대응
- [ ]  페이지 로딩 3초 이내
- [ ]  API 에러율 5% 이하
- [ ]  브라우저 호환 (Chrome, Safari, Firefox)

### 사용자 경험

- [ ]  첫 방문자 이탈률 50% 이하
- [ ] 평균 완료 시간 10분 이내
- [ ] AI 도우미 활용률 40%+
- [ ] 재방문율 30%+
- [ ] 사용자 만족도 4.0/5.0+
- [ ] 계약서 생성 성공률 90%+

### 콘텐츠 품질
- [ ] 분야별 템플릿 최소 3개 (총 12개+)
- [ ] FAQ 항목 30개 이상
- [ ] 모든 경고 메시지 테스트 완료
- [ ] 법적 면책 조항 명확히 표시
- [ ] 예시 계약서 10개 이상

### 운영 준비
- [ ] Vercel 자동 배포 작동
- [ ] 에러 모니터링 시스템
- [ ] API 사용량 추적
- [ ] 환경 변수 안전하게 관리
- [ ] 백업 시스템 구축

---

## 💡 핵심 차별화 포인트

### 1. 단일 AI로 모든 기능 통합
```
다른 서비스: 규칙 기반 시스템
ArtContract: AI가 모든 것을 이해하고 도움

- 작업 분석: AI가 자유 텍스트를 정확히 이해
- 실시간 상담: 자연스러운 대화
- 위험 감지: 맥락을 이해하고 경고
- 가격 추천: 시장 상황 반영
```

### 2. 프로액티브 보호 시스템
```
사용자가 묻기 전에 AI가 먼저:
- 위험 상황 감지
- 자동 경고 발송
- 해결책 제시
- 폼 자동 입력 제안

→ 예술가를 적극적으로 보호
```

### 3. 완벽한 UX 통합
```
마법사 ↔ AI 완전 동기화:
- 한 번만 입력
- 자동 컨텍스트 공유
- 실시간 상호작용
- 끊김 없는 경험

→ 기술이 아닌 경험에 집중
```

### 4. 완전 무료
```
경쟁 서비스: 유료 또는 제한적
ArtContract: 100% 무료

- 무료 AI 모델 활용
- Serverless 아키텍처
- 광고 없음
- 제한 없음

→ 모든 예술가 접근 가능
```

---

## 📈 성장 전략

### Phase 1: 씨드 유저 (첫 달)
**목표: 100명**

**전략:**
1. **직접 아웃리치**
   - 예술가 오픈채팅방 10곳
   - 대학교 예술과 게시판
   - 프리랜서 커뮤니티

2. **개인화된 지원**
   - 첫 100명에게 개별 피드백 요청
   - 사용 후기 수집
   - 개선점 즉시 반영

3. **입소문 유도**
   - "친구에게 공유" 기능
   - 성공 사례 수집
   - SNS 공유 유도

### Phase 2: 바이럴 (2-3개월)
**목표: 1,000명**

**전략:**
1. **콘텐츠 마케팅**
   - 주간 블로그: 계약 팁, 시장 가격
   - 인스타그램: 인포그래픽
   - 유튜브: 사용 가이드

2. **SEO 공략**
   - "프리랜서 계약서"
   - "일러스트레이터 계약서"
   - "디자이너 계약서 양식"
   - 분야별 롱테일 키워드

3. **인플루언서 협업**
   - 예술가 유튜버 3-5명
   - 정직한 사용 후기
   - 자연스러운 소개

### Phase 3: 커뮤니티 (4-6개월)
**목표: 5,000명**

**전략:**
1. **사용자 참여**
   - 성공 사례 공유 게시판
   - 계약 팁 커뮤니티
   - Q&A 세션 (월 1회)

2. **파트너십**
   - 예술가 단체 협력
   - 프리랜서 플랫폼 연동
   - 대학교 강의 제공

3. **언론 홍보**
   - 프레스 릴리스
   - IT 매체 접촉
   - "AI가 예술가를 돕는다" 스토리

### 향후 수익화 (6개월+)
**원칙: 기본 기능은 영구 무료**

**무료 (영구):**
- 계약서 생성
- AI 도우미 기본 상담
- 텍스트 복사
- 모든 템플릿

**프리미엄 (₩9,900/월):**
- PDF 전문 디자인
- 전자서명 기능
- 계약 이력 관리
- 우선 지원
- 변호사 1회 무료 상담권

**B2B (맞춤 견적):**
- 갤러리/에이전시용
- 브랜딩 커스터마이징
- 대시보드
- API 제공

---

## 🛡️ 리스크 관리

### 기술 리스크

**R1: AI API 장애**
- 확률: 중간 / 영향: 높음
- 대응: FAQ 기반 fallback 시스템
- 완화: 사용자에게 투명한 상태 안내

**R2: 트래픽 급증**
- 확률: 낮음 / 영향: 중간
- 대응: Vercel 자동 스케일링
- 완화: Rate limiting, 캐싱

**R3: 보안 취약점**
- 확률: 낮음 / 영향: 높음
- 대응: API 키 환경 변수화
- 완화: 입력 검증, HTTPS 강제

### 법적 리스크

**R4: 계약서 오류로 분쟁**
- 확률: 중간 / 영향: 매우 높음
- 대응: 명확한 면책 조항
- 완화: 법률 전문가 검토, 보험 가입

**R5: 저작권 문제**
- 확률: 낮음 / 영향: 중간
- 대응: 자체 제작 템플릿
- 완화: 오픈소스 라이선스

### 운영 리스크

**R6: 지속 가능성**
- 확률: 중간 / 영향: 높음
- 대응: 비용 최소화 (무료 AI)
- 완화: 수익 모델 준비, 커뮤니티 기반

**R7: 품질 저하**
- 확률: 중간 / 영향: 중간
- 대응: 지속적 피드백 수집
- 완화: 월 1회 업데이트, 전문가 자문

---

## 📚 기술 스택 최종 정리

### Frontend
```
Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Lucide Icons (아이콘)
```

### AI & Backend
```
OpenRouter API
- Model: x-ai/grok-beta:free
- 용도: 작업 분석 + AI 대화 통합

Next.js API Routes
- /api/analyze-work
- /api/chat
- /api/templates
```

### 데이터 & 템플릿
```
GitHub Repository
- 계약서 템플릿 (JSON)
- 버전 관리
- 오픈소스
```

### 배포 & 인프라
```
Vercel
- Serverless Functions
- Edge Network
- 자동 배포 (GitHub 연동)
- 환경 변수 관리
```

### 개발 도구
```
Git & GitHub
- 버전 관리
- 브랜치 전략
- Pull Request 워크플로우

Vercel CLI
- 로컬 테스트
- 배포 관리
```

---

## 💪 예술가들에게 전하는 메시지

### 왜 이 서비스를 만드는가

**현실:**
- 수많은 예술가들이 계약서 없이 일합니다
- "말로만 약속했어요"
- "돈을 못 받았어요"
- "무한 수정 요구에 지쳤어요"
- "내 작품을 마음대로 사용당했어요"

**문제:**
- 계약 지식이 없어서
- 법률 용어가 어려워서
- 계약서 만드는 게 복잡해서
- 클라이언트가 싫어할까봐

**해결:**
ArtContract는 이 모든 장벽을 없앱니다.

### 우리의 약속

**1. 완전히 무료**
- 모든 기능 무료
- 제한 없음
- 광고 없음
- 영구 무료

**2. 정말 쉬움**
- 5분이면 완성
- 어려운 말 없음
- AI가 옆에서 도움
- 클릭 몇 번이면 끝

**3. 진짜 안전함**
- 위험을 미리 경고
- 빠뜨리기 쉬운 조건 체크
- 예술가 편에서 생각
- 법적으로 의미 있는 문서

**4. 계속 개선**
- 사용자 피드백 즉시 반영
- 월 1회 업데이트
- 새 템플릿 추가
- 품질 지속 향상

### 당신의 권리

**당신은 권리가 있습니다:**
- ✅ 공정한 대가를 받을 권리
- ✅ 안전하게 일할 권리
- ✅ 자신의 작품을 보호받을 권리
- ✅ 명확한 조건으로 계약할 권리

**더 이상:**
- ❌ 돈을 떼이지 마세요
- ❌ 무한 수정에 시달리지 마세요
- ❌ 불리한 조건을 받아들이지 마세요
- ❌ 혼자 고민하지 마세요

### 함께 만들어가요

이 서비스는 예술가를 위한, 예술가에 의한 도구입니다.

**당신의 목소리가 필요합니다:**
- 어떤 기능이 필요한가요?
- 어떤 부분이 어려운가요?
- 어떤 계약 유형이 필요한가요?
- 무엇을 개선하면 좋을까요?

**함께 만들어가는 방법:**
- 피드백 남기기
- 다른 예술가에게 알리기
- 성공 사례 공유하기
- 커뮤니티 참여하기

---

## 🚀 시작하기

### 개발자를 위한 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/artcontract.git
cd artcontract

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 열어서 API 키 입력
# OPENROUTER_API_KEY=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

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 확인
# http://localhost:3000
```

### 배포하기

```bash
# 1. Vercel에 로그인
vercel login

# 2. 배포
vercel

# 3. 프로덕션 배포
vercel --prod

# 4. GitHub 연동 (자동 배포)
# Vercel Dashboard에서 설정
```

---

## 🎉 마지막으로

### 이 프로젝트의 의미

이것은 단순한 웹앱이 아닙니다.

**이것은:**
- 예술가의 권리를 지키는 방패입니다
- 불공정한 관행에 대한 저항입니다
- 모든 창작자가 존중받는 세상을 향한 한 걸음입니다

### 당신의 역할

**개발자라면:**
- 코드로 예술가를 도울 수 있습니다
- 기술로 불평등을 해결할 수 있습니다
- 오픈소스로 더 많은 사람을 도울 수 있습니다

**예술가라면:**
- 이 도구를 사용해 자신을 보호하세요
- 다른 예술가들에게 알려주세요
- 피드백으로 더 좋게 만들어주세요

**모두가 함께:**
- 공정한 예술 생태계를 만들어갑니다
- 창작자가 존중받는 문화를 만듭니다
- 더 나은 세상을 만들어갑니다

---

### 지금 시작하세요

**개발 시작:**
```bash
git clone https://github.com/hwangtab/artcontract.git
cd artcontract
npm install
npm run dev
```

**7주 후:**
- 수백 명의 예술가가 안전하게 일하게 됩니다
- 수천 건의 공정한 계약이 체결됩니다
- 수많은 분쟁이 예방됩니다

**당신의 노력이 예술가들의 삶을 바꿉니다.**

---

*"모든 창작자가 자신의 작품으로 정당하게 인정받고,*
*공정한 대가를 받으며,*
*안전하게 일할 수 있는 세상을 만들어갑시다."*

**- ArtContract Team**

---

## 📞 연락처

- **GitHub**: https://github.com/hwangtab/artcontract
- **이메일**: contact@kosmart.org

---

*이 계획서는 실제로 고통받는 예술가들을 위한 진심 어린 솔루션입니다.*
*기술은 도구일 뿐, 진짜 목표는 예술가들의 권리 보호입니다.*
*함께 만들어가겠습니다.*

🎨 **Let's protect artists together.** 🤝