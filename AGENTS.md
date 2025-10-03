# Repository Guidelines

## Project Structure & Module Organization
Next.js routes live in `app/`, with API handlers under `app/api/` and UI split across `app/components/` (wizard, contract, shared). Core logic sits in `lib/` (`ai/`, `contract/`, `utils/`), custom hooks in `hooks/`, and shared types in `types/`. Tests mirror sources inside `__tests__/`. Static assets reside in `public/`; long-form references go to `Docs/`.

## Build, Test, and Development Commands
Run `npm run dev` for the local server at `http://localhost:3000`. Production checks use `npm run build` then `npm run start`. Code quality gates: `npm run lint`, `npm run type-check`, and `npm test`. For coverage snapshots use `npm run test:coverage`, which writes reports to `coverage/`.

## Coding Style & Naming Conventions
Stick to TypeScript + functional React with two-space indentation. Components and hooks follow PascalCase (`Step03ClientType`, `useWizard`); helpers remain camelCase, and utility filenames stay kebab-case. Favor Tailwind utility strings over custom CSS. Run `npm run lint` before committing to catch ESLint and Next.js formatting rules.

## Testing Guidelines
We rely on Jest with Testing Library. Name specs `*.test.ts` or `*.test.tsx` and place them in the matching path under `__tests__/`. Cover accessibility via `screen.getByRole` queries and keep assertions focused on user-visible outcome. Maintain the current coverage baseline; confirm with `npm run test:coverage` and review `coverage/lcov-report/index.html`.

## Commit & Pull Request Guidelines
Use Conventional Commit prefixes seen in history (`feat:`, `fix:`, `refactor:`, `docs:`) with concise scopes, e.g. `fix: guard work analyzer on empty input`. Squash noisy work-in-progress commits. PRs should state the user problem, highlight key changes, list verification steps (tests, manual QA), and include screenshots or recordings when UI shifts. Link related issues or Docs notes for context.

## Configuration & Secrets
Copy `.env.example` to `.env.local` and supply `OPENROUTER_API_KEY`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_SITE_NAME` before using AI features. Keep secret files out of Git and rely on Vercel environment variables in production. Document any rate-limit or AI prompt adjustments in `Docs/` so other contributors can trace experiments.
