# Repository Guidelines

## Project Structure & Module Organization

- `src/routes/` contains TanStack Start file-based routes (for example, `projects.$slug.tsx`); `src/routes/__root.tsx` defines the document shell.
- `components/` holds reusable React UI, grouped by feature (`Header/`, `Projects/`, `PhotographyContent/`, `ui/`). Most component folders export from `index.tsx`.
- `lib/` includes data fetching and shared utilities (`fetch-*.ts`, Contentful helpers, image utilities, type definitions).
- `tests/` contains Playwright specs and visual baselines (`*.test.ts` and `*-snapshots/`).
- `scripts/` stores build-time tasks, including `generate-auth-manifest.ts`.
- `infra/` contains the self-contained AWS CDK v2 TypeScript project for Amplify, IAM, Route 53, monitoring, and budgets.
- `public/` is for static assets. `lib/project-auth-manifest.json` is generated and must stay uncommitted.

## Build, Test, and Development Commands

- `bun install`: install dependencies.
- `bun dev`: generate auth manifest, then start local dev server (`http://localhost:3000`).
- `bun run build`: generate auth data, prerender public pages, and emit the cleaned AWS Amplify Hosting bundle under `.amplify-hosting/`.
- `bun run typecheck`: generate fixture build artifacts, then run TypeScript.
- `bun run validate`: run lint, unit tests, type checking, fixture build, and prerender-output checks.
- `bun run lint`: run Biome lint and format checks.
- `bun run test:unit`: run focused Bun unit tests.
- `bun run lint:fix`: apply automatic Biome lint and format fixes.
- `bun run test:visual`: run all end-to-end/visual tests in the canonical container.
- `bun run test:visual -- tests/home.test.ts`: run one spec file in the canonical container.
- `bun run test:visual:update`: update canonical visual snapshots after reviewing the intended changes.

## Coding Style & Naming Conventions

- Use TypeScript and functional React components.
- Follow Biome rules in `biome.json`; run lint before opening a PR.
- Prefer `@/` alias imports for cross-directory references; relative imports are only allowed within the same folder.
- Keep imports grouped and alphabetized per configured `import/order` and `sort-imports` rules.
- Use `PascalCase` for component names/folders and descriptive lowercase names for utilities (example: `fetch-projects.ts`).

## Testing Guidelines

- Playwright (`@playwright/test`) covers end-to-end and visual regression behavior; Bun covers focused unit tests under `tests/unit/`.
- Name Playwright files `*.test.ts`; use `*.unit.ts` for Bun tests so Playwright does not collect them.
- Review screenshot diffs before updating snapshots to avoid accepting accidental UI regressions.
- For UI work, run the changed spec first, then the full Playwright suite.

## Commit & Pull Request Guidelines

- Commits are enforced by lefthook + commitlint and must follow Conventional Commits.
- Use `type: summary` format with no scope (example: `feat: add project password gate`).
- Keep commits focused, with passing lint/tests where applicable.
- PRs should include a short description, linked issue (if relevant), and screenshots for visual changes.
