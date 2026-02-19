# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Next.js App Router routes; each route folder defines `page.tsx` (for example, `app/projects/[slug]/page.tsx` and `app/projects/[slug]/auth/page.tsx`).
- `components/` holds reusable React UI, grouped by feature (`Header/`, `Projects/`, `PhotographyContent/`, `ui/`). Most component folders export from `index.tsx`.
- `lib/` includes data fetching and shared utilities (`fetch-*.ts`, Contentful helpers, image utilities, type definitions).
- `tests/` contains Playwright specs and visual baselines (`*.test.ts` and `*-snapshots/`).
- `scripts/` stores build-time tasks, including `generate-auth-manifest.ts`.
- `public/` is for static assets. `lib/project-auth-manifest.json` is generated and must stay uncommitted.

## Build, Test, and Development Commands
- `bun install`: install dependencies.
- `bun dev`: generate auth manifest, then start local dev server (`http://localhost:3000`).
- `bun run build`: generate auth manifest, then create production build.
- `bun start`: run the production server locally.
- `bun run lint`: run Oxlint checks.
- `bun run lint:fix`: apply automatic lint fixes.
- `bunx playwright install`: install Playwright browsers (first-time setup).
- `bunx playwright test`: run all end-to-end/visual tests.
- `bunx playwright test tests/home.test.ts`: run one spec file.

## Coding Style & Naming Conventions
- Use TypeScript and functional React components.
- Follow Oxlint + Prettier rules in `oxlint.config.ts`; run lint before opening a PR.
- Prefer `@/` alias imports for cross-directory references; relative imports are only allowed within the same folder.
- Keep imports grouped and alphabetized per configured `import/order` and `sort-imports` rules.
- Use `PascalCase` for component names/folders and descriptive lowercase names for utilities (example: `fetch-projects.ts`).

## Testing Guidelines
- Playwright is the test framework (`@playwright/test`) and is used primarily for visual regression.
- Name test files `*.test.ts` under `tests/`.
- Review screenshot diffs before updating snapshots to avoid accepting accidental UI regressions.
- For UI work, run the changed spec first, then the full Playwright suite.

## Commit & Pull Request Guidelines
- Commits are enforced by Husky + commitlint and must follow Conventional Commits.
- Use `type: summary` format with no scope (example: `feat: add project password gate`).
- Keep commits focused, with passing lint/tests where applicable.
- PRs should include a short description, linked issue (if relevant), and screenshots for visual changes.
