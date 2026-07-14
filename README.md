# Carolyn DiLoreto Portfolio

Portfolio website for a Film Editor / Graphic Designer / UX Engineer. Built with TanStack Start and powered by Contentful CMS.

**Live site:** [carolyndiloreto.com](https://carolyndiloreto.com)

## Tech Stack

- **Framework:** TanStack Start with TanStack Router and React 19
- **Images:** `@unpic/react` with Contentful image transforms
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Primitives:** shadcn/ui + Radix UI
- **CMS:** Contentful
- **Package Manager / Build Runner:** Bun
- **Hosting:** Netlify through its official TanStack Start Vite plugin
- **Testing:** Playwright visual regression

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2+
- Access to the Contentful space for this project

### Install and configure

```bash
git clone https://github.com/soodoh/carolyn-portfolio.git
cd carolyn-portfolio
bun install
cp .env.example .env
```

| Variable                              | Description                                             |
| ------------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`     | Contentful space identifier                             |
| `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` | Content Delivery API access token                       |
| `PROJECT_AUTH_SECRET`                 | HMAC signing key for protected project cookies          |

Generate a local signing key with `openssl rand -hex 32`.

### Development

```bash
bun dev
```

The predev step generates `lib/project-auth-manifest.json` from Contentful, then Vite starts the TanStack Start server at `http://localhost:3000`.

### Production

```bash
bun run build
```

The prebuild step refreshes the auth manifest, TanStack Start prerenders public pages into `dist/client/`, and the official Netlify plugin emits the dynamic server handler at `.netlify/v1/functions/server.mjs`. Netlify runs that handler for protected projects, `/resume`, and other dynamic requests. Add all three environment variables to the Netlify site configuration before deploying.

`bun dev` provides the supported local workflow and includes Netlify platform emulation from the Vite plugin. There is no standalone Node production-server command in this repository; Bun remains the local package manager and build runner, while Netlify manages the deployed function runtime.

## Available Scripts

| Command                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `bun dev`               | Start port 3000 with Netlify emulation after generating auth data |
| `bun run build`         | Prerender public pages and emit the Netlify deployment bundle |
| `bun run typecheck`     | Generate fixture build artifacts, then run TypeScript         |
| `bun run validate`      | Run lint, unit tests, type checking, build, and output checks  |
| `bun run lint`          | Run Biome checks                                               |
| `bun run test:unit`     | Run focused Bun unit tests                                    |
| `bun run lint:fix`      | Apply safe Biome fixes                                         |
| `bun run test:visual`   | Run Playwright in the canonical ARM64 container               |

## Architecture

### Routes and data

TanStack Start file routes live in `src/routes/`. Each route owns its data-loading server function, while password verification uses the focused `lib/verify-project-password.ts` server function. Contentful credentials, project passwords, and cookie validation remain server-only. Builds prerender the public routes and public project slugs from Contentful. Protected project slugs and the external `/resume` redirect are explicitly excluded from prerendering and remain Netlify function requests.

| Route                     | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `/`                       | Home hero and project previews                   |
| `/about`                  | Bio and profile picture                          |
| `/projects`               | Filterable masonry grid                          |
| `/projects/$slug`         | Project detail or in-place password gate         |
| `/photography`            | Photo albums and image gallery                   |
| `/resume`                 | Permanent redirect to the Contentful PDF         |

### Password protection

1. `scripts/generate-auth-manifest.ts` writes gitignored `slug -> bcrypt hash` data before dev/build.
2. The project loader checks its project-specific HTTP-only cookie before fetching or returning protected content.
3. Unauthorized projects render the password form at the requested project URL.
4. A TanStack Start server function verifies the password, signs a token, and sets a secure, SameSite=strict cookie.
5. The route loader is invalidated after authentication and then returns only password-free project data.

### Images

`components/image-wrapper.tsx` uses `@unpic/react` and Contentful's image CDN transformer to generate responsive sources with WebP output and the requested quality. Local Playwright fixture images retain deterministic query parameters for visual testing.

## Testing

Visual tests run in a pinned Linux ARM64 Playwright container so local and CI rendering is identical. An ARM64 Docker engine must be running.

```bash
bun run test:visual
bun run test:visual -- tests/home.test.ts
bun run test:visual:update
```

Do not update snapshots from a native Playwright run. Review image diffs before intentionally updating canonical baselines. CI runs `bun run validate` before the canonical visual suite so ignored generated files are always recreated from a clean checkout.

## License

MIT
