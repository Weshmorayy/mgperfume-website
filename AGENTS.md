# AGENTS.md - Permanent Rules & Guidelines for Master Website Template

This document defines the permanent engineering, architectural, and operational rules for any AI agent or human engineer working with or duplicating this Master Website Template.

---

## 1. Core Principles & Philosophy
1. **Master Template Integrity**: This repository is a reusable foundation for producing high-converting, performant, static/SSG client websites. Do NOT hardcode client-specific one-off logic into core components.
2. **French-First Architecture**: All content strings, schema defaults, date formats, legal templates, and SEO structures must be in proper French by default.
3. **No Unnecessary Dependencies**: Keep the bundle minimal and hyper-fast. Do NOT add heavy animation libraries (e.g., GSAP/Three.js) or bloated state management unless explicitly required.
4. **Single Source of Truth (`src/config/site.ts`)**: Every business detail (names, coordinates, phone numbers, opening hours, SIRET, testimonials, services, and color accents) MUST reside in `src/config/site.ts`.

---

## 2. Architecture & Tech Stack Rules
- **Framework**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Icons**: `lucide-react` only.
- **Styling**: Tailwind CSS utility classes with CSS variables defined in `src/app/globals.css`.
- **Export Compatibility**: Every component and page must build cleanly in both `output: 'export'` (100% static HTML) and `output: 'standalone'` (Docker / Node server).
- **No Client State Bloat**: Use Server Components by default. Add `'use client'` only where user interactivity is strictly required (e.g., FAQ accordion toggle, mobile navigation drawer, form submission).

---

## 3. SEO & Structured Data Rules
- **Dynamic Metadata**: Every page must implement `generatePageMetadata()` from `@/lib/seo`.
- **JSON-LD Schema**: The root layout embeds `SchemaOrg.tsx`, which injects `LocalBusiness`, `Organization`, and `FAQPage` schemas.
- **Sitemap & Robots**: Next.js route handlers `sitemap.ts` and `robots.ts` dynamically read `siteConfig.url`.

---

## 4. Image Workflow Rules
- Place all static client images in `public/images/`:
  - `public/images/clients/`: Client logos, client badges, partner emblems.
  - `public/images/projects/`: Realization showcase images, photo galleries.
  - `public/images/optimized/`: WebP / AVIF compressed images.
- Use Next.js `<Image />` or semantic `<img>` tags with explicit `alt` text.

---

## 5. Deployment Rules
Support 4 target environments seamlessly:
1. **Hostinger VPS without Coolify**: Static build via `NEXT_OUTPUT=export npm run build` served through NGINX (`nginx.conf`).
2. **Coolify**: Standard deployment using the included multi-stage `Dockerfile`.
3. **Netlify**: Deploy static `/out` or Next.js runtime plugin.
4. **Vercel**: Zero-config deployment with native App Router support.

---

## 6. System Reorganization, Anti-AI & Workflow References
- **Master Plan & Architecture**: Always consult [`ProjectInfo/[PLAN]_SYSTEM_REORGANIZATION_AND_WORKFLOW.md`](file:///data/data/com.termux/files/home/website-template/ProjectInfo/%5BPLAN%5D_SYSTEM_REORGANIZATION_AND_WORKFLOW.md)
- **Anti-AI Design & Copywriting Guide**: Follow [`ProjectInfo/SpecialGuides/[GUIDE]_AVOIDING_AI_LOOK_AND_FEEL.md`](file:///data/data/com.termux/files/home/website-template/ProjectInfo/SpecialGuides/%5BGUIDE%5D_AVOIDING_AI_LOOK_AND_FEEL.md)
- **Projects Registry**: Keep [`ProjectInfo/PROJECTS_INDEX.md`](file:///data/data/com.termux/files/home/website-template/ProjectInfo/PROJECTS_INDEX.md) up to date.
- **Client Onboarding**: Use `new-client` command in Termux. Never start coding without proposing the Visual Foundation to the USER first.

