# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for a Film Editor / Graphic Designer / UX Engineer. Fully static Next.js site powered by Contentful CMS, deployed on Netlify.

## Common Commands

```bash
bun dev              # Start dev server
bun run build        # Production build (fetches all Contentful data at build time)
bun run lint         # ESLint check
bun run lint:fix     # ESLint autofix
bunx shadcn@latest add <component>  # Add shadcn component, then run bun run lint:fix
```

**Playwright tests** (visual regression — config references `yarn` but project uses `bun`):
```bash
bunx playwright test                    # Run all tests
bunx playwright test tests/home.test.ts # Run single test file
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first `@theme` config in `globals.css` — no `tailwind.config.js`)
- **UI Primitives**: shadcn/ui (New York style) + Radix UI
- **Icons**: Lucide React + custom SVG components in `components/icons/`
- **CMS**: Contentful (all images served via Contentful CDN)
- **Package Manager**: Bun
- **Fonts**: Karla (body, `font-body`), Old Standard TT (headers, `font-header`) — loaded via Google Fonts `<link>` in `app/layout.tsx`

## Architecture

### Static Generation

Every page uses `export const dynamic = "error"` to enforce static generation. There are **no API routes, no server actions, and no runtime CMS calls**. All data is fetched at build time via React Server Components.

### Routes

| Route | Page | Notes |
|-------|------|-------|
| `/` | Home | Background image, hero, project previews |
| `/about` | About | Bio, profile picture |
| `/projects` | Projects | Filterable masonry grid |
| `/projects/[slug]` | Project detail | Dynamic, client-side password protection |
| `/photography` | Photography | Album filtering, image gallery |
| `/resume` | — | Permanent redirect to Contentful-hosted PDF |

### Data Flow

1. **Contentful CMS** → `lib/fetch-*.ts` functions (one per domain: home, about, projects, photos)
2. **Image processing**: `lib/contentful-utils.ts` → `formatImage()` generates blur placeholders via Sharp, caches in-memory
3. **RSC pages** call fetch functions, pass data as props to client components
4. **Client interactivity** is limited to: filter state, modal/gallery state, scroll-based header transparency

### Key Files

- `lib/contentful-utils.ts` — Contentful client, image processing, rich text helpers
- `lib/types.ts` — All TypeScript types (`ImageType`, `Project`, `Album`, `AboutData`, etc.)
- `lib/image-loader.ts` — Custom Next.js image loader (Contentful CDN → WebP)
- `lib/utils.ts` — `cn()` class merger, `containerClass` layout constant
- `components/commonStyles/globals.css` — All design tokens, base styles, component layers

### Environment Variables

Required in `.env`:
- `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`
- `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN`

## Design Tokens

All tokens defined in `components/commonStyles/globals.css` inside `@theme {}`.

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-dark` | `#494f5c` | Primary text (`text-dark`) |
| `--color-dark-rgb` | `73, 79, 92` | For `rgba()` usage |
| `--color-light` | `#cec0a8` | Accent/brand (`bg-light`) |
| `--color-light-text` | `#fff` | Light text on dark bg |
| `--color-error` | `#fd9f92` | Error states |

### Breakpoints (Custom, Desktop-First)

| Name | Value | Variant |
|------|-------|---------|
| `sm` | `480px` | `max-sm:` |
| `md` | `800px` | `max-md:` |
| `lg` | `1024px` | `max-lg:` |

**Important**: This project uses **desktop-first** responsive design. Always use `max-*:` variants:
```tsx
// Correct:
className="text-lg max-md:text-base max-sm:text-sm"
// Wrong:
className="text-sm md:text-base lg:text-lg"
```

### Spacing

- `--spacing-padding`: `1.5rem` — standard page padding
- `--spacing-header-height`: `4rem` — fixed header height

## Component Patterns

### Layout Container

```tsx
import { containerClass } from "@/lib/utils";
<div className={containerClass}> {/* mx-auto w-[calc(100%-3rem)] max-w-[1440px] grow */}
```

### Class Merging

Always use `cn()` from `@/lib/utils` for conditional classes:
```tsx
import { cn } from "@/lib/utils";
<div className={cn("base-classes", conditional && "conditional-classes")} />
```

### Images

All images from Contentful CDN. Never store content images in `/public/`.
```tsx
import ImageWrapper from "@/components/ImageWrapper";
<ImageWrapper image={contentfulAsset} quality={75} priority={false} />
```

### Masonry Grids

```tsx
import Masonry from "react-masonry-css";
<Masonry
  breakpointCols={{ default: 3, 800: 2, 480: 1 }}
  className="masonry-grid"
  columnClassName="masonry-grid-column"
>
```
Styles in `globals.css` `@layer components`. Gap controlled by `--grid-gap: 50px`.

### CSS Variables in Tailwind

```tsx
className="px-(--spacing-padding) h-(--spacing-header-height)"
style={{ backgroundColor: `rgba(var(--color-dark-rgb), 0.5)` }}
```

## Code Conventions

### Imports

Enforced by ESLint — order: builtin/external → parent/sibling → types. Path alias: `@/` maps to project root. No relative imports allowed (except same-folder).

### Commit Messages

Commitlint enforces conventional commits with **no scopes allowed**:
```
feat: add gallery component
fix: header transparency on scroll
chore: update dependencies
```

### Linting

- Prettier + ESLint with import ordering
- After generating shadcn components, run `bun run lint:fix` (fixes semicolons, import order)

### File Structure

- `components/ui/` — shadcn/ui primitives
- `components/icons/` — Custom SVG icon components
- `components/commonStyles/` — globals.css
- `components/[Feature]/index.tsx` — Feature components with barrel exports

### Testing

Visual regression tests via Playwright using `toHaveScreenshot()`. Tests mock GIF routes to prevent pixel drift. No unit tests.
