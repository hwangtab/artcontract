# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ArtContract** is a web application that helps freelance artists create safe, fair contracts in 5 minutes. The mission is to eliminate contract-related harm for artists who lack legal knowledge.

### Core Values
- **Accessibility**: Anyone can create a safe contract in under 5 minutes
- **Reliability**: AI warns of risks and protects artists proactively
- **Free**: All artists can use it without cost
- **Empathy**: Speaks in artists' language and thinks from their perspective

## Technology Stack

### Frontend & Framework
- **Next.js 14** (App Router)
- React 18
- TypeScript
- TailwindCSS
- Lucide Icons

### AI & Backend
- **OpenRouter API** with `x-ai/grok-beta:free` model
  - Handles ALL AI functionality: work analysis, chatbot, risk assessment, price recommendations
  - Single AI model for unified context and experience
- Next.js API Routes:
  - `/api/analyze-work` - Analyzes "other" work type inputs
  - `/api/chat` - AI assistant conversation
  - `/api/templates` - Contract template delivery

### Deployment
- **Vercel** (Serverless Functions, Edge Network)
- GitHub-integrated auto-deployment
- Environment variables managed in Vercel Dashboard

### Data & Templates
- Contract templates stored as JSON in GitHub repository
- GitHub Raw Content API for template delivery
- Version controlled and open source

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Environment Variables

Required in `.env.local`:
```bash
OPENROUTER_API_KEY=sk-or-v1-...  # Required for all AI features
NEXT_PUBLIC_SITE_URL=https://artcontract.vercel.app
NEXT_PUBLIC_SITE_NAME=ArtContract
```

Optional:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_PDF=false
NEXT_PUBLIC_ENABLE_HISTORY=false
```

## Project Structure

```
artcontract/
├── app/
│   ├── page.tsx                 # Main wizard page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── api/
│   │   ├── analyze-work/route.ts    # AI work analysis
│   │   ├── chat/route.ts            # AI chatbot
│   │   └── templates/route.ts       # Template provider
│   └── components/
│       ├── wizard/              # 8-step wizard components
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
│       ├── ai-assistant/        # Floating AI assistant
│       │   ├── AssistantContainer.tsx
│       │   ├── AssistantButton.tsx
│       │   ├── AssistantWindow.tsx
│       │   ├── MessageList.tsx
│       │   ├── ChatInput.tsx
│       │   ├── QuickQuestions.tsx
│       │   └── ProactiveAlert.tsx
│       ├── contract/            # Contract generation & display
│       │   ├── ContractPreview.tsx
│       │   ├── ContractResult.tsx
│       │   └── CopyButton.tsx
│       └── shared/              # Reusable components
│           ├── Card.tsx
│           ├── WarningBanner.tsx
│           ├── InfoTooltip.tsx
│           ├── LoadingSpinner.tsx
│           └── Toast.tsx
├── lib/
│   ├── ai/
│   │   ├── openrouter-client.ts     # OpenRouter API client
│   │   ├── work-analyzer.ts         # Work analysis logic
│   │   └── conversation-handler.ts  # AI conversation handling
│   ├── contract/
│   │   ├── template-loader.ts       # GitHub template loader
│   │   ├── generator.ts             # Contract generation engine
│   │   ├── validator.ts             # Input validation
│   │   └── formatter.ts             # Output formatting
│   ├── ai-assistant/
│   │   ├── faq-database.ts          # FAQ data (30+ items)
│   │   ├── context-manager.ts       # Context management
│   │   ├── proactive-triggers.ts    # Auto-warning triggers
│   │   ├── response-handler.ts      # Response processing
│   │   └── action-executor.ts       # Action execution (auto-fill forms)
│   └── utils/
│       ├── date-helpers.ts
│       ├── currency-format.ts
│       ├── validation-rules.ts
│       └── text-helpers.ts
├── types/
│   ├── contract.ts              # Contract-related types
│   ├── ai-assistant.ts          # AI assistant types
│   ├── wizard.ts                # Wizard types
│   └── api.ts                   # API response types
└── hooks/
    ├── useWizard.ts             # Wizard state management
    ├── useAIAssistant.ts        # AI assistant hook
    ├── useContract.ts           # Contract generation hook
    └── useWizardSync.ts         # Wizard ↔ AI synchronization
```

## Architecture & Key Concepts

### Unified AI Integration
- **Single AI model** (`grok-beta:free`) handles ALL AI features:
  - Work analysis (for "other" inputs)
  - Real-time chatbot consultation
  - Risk assessment and warnings
  - Price recommendations based on market analysis
- This unified approach provides consistent context and seamless user experience

### Wizard-Chatbot Integration
The core UX principle is **seamless integration between wizard and AI assistant**:

1. **Wizard is primary, AI is supportive**
   - Wizard = structured input path (most users)
   - AI assistant = helper when stuck or curious
   - Both share data in real-time (users input once)

2. **No duplicate inputs**
   - Wizard input → AI receives as context
   - AI response → Can auto-fill wizard forms
   - Single source of truth for all data

3. **Proactive assistance**
   - Detects problems before users ask
   - Warns on dangerous choices immediately
   - Auto-displays contextual tips at each step

### Data Flow
```
User Input
    ↓
[8-Step Wizard]
    ├─→ Selection inputs → Local state
    └─→ "Other" inputs → AI analysis → Auto-classification
    ↓
[Real-time Validation]
    ├─→ Detect missing fields
    ├─→ Detect risky conditions
    └─→ AI auto-warnings
    ↓
[Contract Generation]
    ├─→ Load template (GitHub)
    ├─→ Merge data
    └─→ Mark incompleteness
    ↓
[Output]
    └─→ Copy text / Future PDF
```

### Type System
Key TypeScript types in `types/`:

- `ArtField`: 'design' | 'photography' | 'writing' | 'music'
- `ClientType`: 'individual' | 'small_business' | 'enterprise' | 'unknown'
- `UsageScope`: 'personal' | 'commercial' | 'online' | 'print' | 'unlimited'
- `ContractFormData`: Main form data structure with completeness tracking
- `WorkAnalysis`: AI analysis results with confidence scores
- `Warning`: Risk warning system with severity levels
- `AIMessage`: Chat message structure with metadata
- `AIContext`: Complete context passed to AI for informed responses

### Validation & Risk System
Smart validation rules in `lib/contract/validator.ts`:

**Payment validation:**
- `null` → 🚨 High risk warning
- `0` → ❌ Error (0 won invalid)
- `1-100,000` → 💡 Info (small amount, deposit unnecessary)
- `100,000-1,000,000` → ✅ Normal + recommend 30% deposit
- `1,000,000+` → ⚠️ Caution + require legal consultation

**Revision validation:**
- `null` → ⚠️ Caution
- `0` → ⚠️ Warning (no revisions?)
- `1-5` → ✅ Normal
- `6-10` → ⚠️ Caution (too many)
- `'unlimited'` → �� High risk warning

**Deadline validation:**
- `null` → ⚠️ Caution
- Today/Tomorrow → 🚨 High risk (too tight)
- 3-7 days → ⚠️ Caution + recommend rush fee
- 7-30 days → ✅ Normal
- 30+ days → 💡 Info (recommend milestone checks)

### Proactive System
Auto-intervention conditions in `lib/ai-assistant/proactive-triggers.ts`:

- **On step entry**: Context-appropriate tips
- **On field change**: Real-time risk detection
- **On next attempt**: Block if critical fields missing
- **On inactivity**: Offer help after 45 seconds

## Design System

### Colors
```typescript
primary: '#6366f1' (indigo-500)
success: '#10b981' (green-500)
warning: '#f59e0b' (amber-500)
danger: '#ef4444' (red-500)
info: '#3b82f6' (blue-500)
```

### Typography
- Font: Pretendard (Korean), system-ui (fallback)
- Sizes: xs(12px), sm(14px), base(16px), lg(18px), xl(20px), 2xl(24px), 3xl(30px)
- Weights: light(300), regular(400), medium(500), semibold(600), bold(700)

### Component Patterns
- **Selection cards**: White bg, 2px border, hover scale, active blue-50 bg
- **Primary buttons**: Primary color, 48px height, hover scale-105
- **Input fields**: 48px height, 16px padding, focus ring primary-500
- **Warnings**: Colored banner with severity-based styling

## Git Workflow

### Branch Strategy
```
main (production - Vercel auto-deploys)
  ↑ PR & Review
develop (staging - Preview URL)
  ↑ PR
feature/xxx (feature development)

hotfix/xxx (emergency fixes)
  ↓ Direct to main
```

### Commit Messages
Follow conventional commits:
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

### Development Workflow
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature-name

# Develop and commit
git add .
git commit -m "feat: description of changes"
git push origin feature/new-feature-name

# Create PR on GitHub: develop ← feature/new-feature-name
# Vercel auto-creates preview URL

# After review & merge to develop
# When stable, merge develop → main for production
```

## Key Principles

### User-Centric Design
1. **Simplicity first**: 5 minutes to complete
2. **No legal jargon**: Everyday language only
3. **Proactive protection**: Warn before users make mistakes
4. **Trust through transparency**: Clear about AI limitations

### Artist Protection
1. **Always take artist's side** in advice
2. **Emphasize payment terms** (most critical)
3. **Warn against unlimited revisions**
4. **Encourage contract deposits**
5. **Recommend legal consultation** for high-value contracts (₩1M+)

### AI Personality
- **Tone**: Friendly, empathetic, practical (해요체)
- **Language**: Simple Korean, no legal terms
- **Emojis**: Use sparingly (😊 ⚠️ ✅ 💡 🎨)
- **Sentences**: 2-3 short sentences per message
- **Examples**: Always provide concrete examples
- **Disclaimers**: Never give definitive legal advice → recommend professionals

### Code Quality
1. **TypeScript strict mode**: No `any` types
2. **Component composition**: Keep components small, focused
3. **Custom hooks**: Extract reusable logic to hooks
4. **Error boundaries**: Graceful error handling in UI
5. **Loading states**: Always show feedback during async operations
6. **Accessibility**: ARIA labels, keyboard navigation

## Testing Strategy

### Manual Testing Checklist
- [ ] All 8 wizard steps work correctly
- [ ] AI analysis responds within 5 seconds
- [ ] AI chat responds within 3 seconds
- [ ] Mobile responsive on iOS/Android
- [ ] Page load under 3 seconds
- [ ] API error rate under 5%
- [ ] Browser compatibility (Chrome, Safari, Firefox)

### User Acceptance Criteria
- [ ] First-time visitor drop-off rate under 50%
- [ ] Average completion time under 10 minutes
- [ ] AI assistant usage rate over 40%
- [ ] User satisfaction 4.0/5.0+
- [ ] Contract generation success rate 90%+

## Deployment

### Local Development
```bash
npm run dev  # Starts on http://localhost:3000
```

### Vercel Deployment
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Or push to main branch for auto-deployment
git push origin main
```

### Environment Setup on Vercel
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   - `OPENROUTER_API_KEY` (required)
   - `NEXT_PUBLIC_SITE_URL` (production URL)
   - `NEXT_PUBLIC_SITE_NAME` (ArtContract)

## Important Notes

### Security
- **Never commit** `.env.local` or API keys
- API keys stored in environment variables only
- Input validation on all user inputs
- HTTPS enforced via Vercel

### Legal Disclaimer
- Always include disclaimer: "이 계약서는 법률 자문을 대체하지 않습니다"
- For high-value contracts (₩1M+), **strongly recommend** legal professional review
- Templates are guidance, not legal advice

### AI Model Limitations
- Model: `x-ai/grok-beta:free` (free tier)
- Rate limits may apply
- Implement FAQ fallback for API failures
- Cache common responses when possible

## Roadmap & Future Features

### Phase 1: MVP (Current)
- 8-step wizard
- AI assistant integration
- Contract generation
- Text copy functionality

### Phase 2: Enhancement
- PDF generation with professional design
- Contract history management
- Electronic signature integration
- Template customization

### Phase 3: Community
- User success stories
- Contract tips community
- Monthly Q&A sessions
- Partnership with artist organizations

### Monetization (6+ months)
- **Free forever**: Contract generation, AI assistant, all templates
- **Premium (₩9,900/month)**: PDF design, e-signature, history, priority support
- **B2B (custom)**: Gallery/agency branding, dashboards, API access

## Resources

- **GitHub Repository**: https://github.com/hwangtab/artcontract
- **Email**: contact@kosmart.org
- **Vercel URL**: https://artcontract.vercel.app
- **Documentation**: See `/Docs` folder for complete project plan

## Development Philosophy

**"모든 창작자가 자신의 작품으로 정당하게 인정받고, 공정한 대가를 받으며, 안전하게 일할 수 있는 세상을 만들어갑시다."**

This project is not just a web app—it's a shield protecting artists' rights, resistance against unfair practices, and a step toward a world where all creators are respected.
