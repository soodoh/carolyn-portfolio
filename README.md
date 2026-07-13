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
- **Package Manager:** Bun
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
bun start
```

Nitro emits the production server to `.output/`. The auth manifest is regenerated before every development and production build.

## Available Scripts

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `bun dev`          | Start Vite dev server after generating auth data |
| `bun run build`    | Create the TanStack Start production build       |
| `bun start`        | Run the production server                        |
| `bun run lint`     | Run Biome checks                                 |
| `bun run lint:fix` | Apply safe Biome fixes                           |
| `bun run test:visual` | Run Playwright in the canonical container     |

## Architecture

### Routes and data

TanStack Start file routes live in `src/routes/`. Route loaders call server functions from `lib/server-functions.ts`; Contentful credentials, project passwords, and cookie validation remain server-only.

| Route                     | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `/`                       | Home hero and project previews                   |
| `/about`                  | Bio and profile picture                          |
| `/projects`               | Filterable masonry grid                          |
| `/projects/$slug`         | Project detail or in-place password gate         |
| `/projects/$slug/auth`    | Direct protected-project password form           |
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

Do not update snapshots from a native Playwright run. Review image diffs before intentionally updating canonical baselines.

## License

MIT
