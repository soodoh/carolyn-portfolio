# Carolyn DiLoreto Portfolio

Portfolio website for a Film Editor / Graphic Designer / UX Engineer. Built with Next.js, powered by Contentful CMS, and deployed on Netlify.

**Live site:** [carolyndiloreto.com](https://carolyndiloreto.com)

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)
- **UI Primitives:** shadcn/ui + Radix UI
- **CMS:** Contentful
- **Package Manager:** Bun
- **Hosting:** Netlify
- **Testing:** Playwright (visual regression)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.2+)
- [Node.js](https://nodejs.org) (v18+, required by Next.js)
- Access to the Contentful space for this project

### 1. Clone the repository

```bash
git clone https://github.com/soodoh/carolyn-portfolio.git
cd carolyn-portfolio
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description | Where to find it |
|----------|-------------|------------------|
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` | Contentful space identifier | Contentful dashboard: Settings > API keys |
| `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` | Content Delivery API access token | Contentful dashboard: Settings > API keys > Content delivery / preview tokens |
| `PROJECT_AUTH_SECRET` | HMAC signing key for password-protected project cookies | Generate locally with `openssl rand -hex 32` |

### 4. Start the dev server

```bash
bun dev
```

This automatically runs a prebuild step that generates the auth manifest (`lib/project-auth-manifest.json`) from Contentful before starting Next.js. The dev server will be available at `http://localhost:3000`.

### 5. Production build

```bash
bun run build
```

Same as dev, the auth manifest is regenerated before each build.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server (generates auth manifest first) |
| `bun run build` | Production build (generates auth manifest first) |
| `bun start` | Serve the production build locally |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Run ESLint with auto-fix |

## Architecture

### Static Generation

Every page uses `export const dynamic = "error"` to enforce full static generation. All content is fetched from Contentful at build time via React Server Components. There are no runtime CMS calls.

### Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with background image, hero, and project previews |
| `/about` | Bio and profile picture |
| `/projects` | Filterable masonry grid of all projects |
| `/projects/[slug]` | Individual project detail page |
| `/photography` | Photo albums with image gallery |
| `/resume` | Permanent redirect to Contentful-hosted PDF |

### Password Protection

Some projects are password-protected. This is implemented with server-side security:

1. A **prebuild script** (`scripts/generate-auth-manifest.ts`) fetches protected projects from Contentful and writes a manifest of `slug -> bcrypt hash` mappings to `lib/project-auth-manifest.json` (gitignored).
2. **Middleware** intercepts requests to protected project pages and checks for a valid authentication cookie.
3. Unauthenticated users are rewritten to a **password form page** (`/projects/[slug]/auth`). The protected project content is never served.
4. A **server action** validates the submitted password against the bcrypt hash and sets an HTTP-only, secure, SameSite=strict cookie scoped to that project's path.
5. Per-project cookies mean authenticating for one project does not grant access to another.

### Data Flow

1. **Contentful CMS** -> `lib/fetch-*.ts` functions (one per domain: home, about, projects, photos)
2. **Image processing:** `lib/contentful-utils.ts` -> `formatImage()` generates blur placeholders via Sharp
3. **RSC pages** call fetch functions, pass data as props to client components
4. **Client interactivity** is limited to: filter state, modal/gallery state, scroll-based header transparency

## Testing

Visual regression tests using Playwright's `toHaveScreenshot()`.

```bash
# Install Playwright browsers (first time only)
bunx playwright install

# Run all tests
bunx playwright test

# Run a single test file
bunx playwright test tests/home.test.ts
```

## Deployment

The site is deployed on Netlify. On each deploy:

1. The `prebuild` script generates the auth manifest from Contentful
2. `next build` statically generates all pages
3. Netlify serves the static output with middleware support for password-protected routes

### Environment Variables on Netlify

All three variables from `.env.example` must be configured in the Netlify dashboard under Site settings > Environment variables. Generate a separate `PROJECT_AUTH_SECRET` for production (do not reuse the local dev value).

## License

MIT
