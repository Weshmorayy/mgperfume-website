# [1] Project Details & Architecture

## 1. Executive Summary
- **Project Name**: Master Website Template
- **Type**: Reusable Static / SSG Client Website Engine
- **Primary Goal**: Provide a robust, ultra-fast, French-first foundation that can be duplicated in minutes for any client website.
- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Design Language**: Modern, clean, accessible, mobile-first responsive design.
- **Language & Localization**: French (fr-FR) first by default.

---

## 2. Architectural Pillars
1. **Zero Client Bloat**: Server Components by default; `'use client'` strictly restricted to interactive components (e.g. mobile drawer, FAQ toggle, contact form).
2. **Single Source of Truth**: All client business parameters, branding strings, coordinates, services, testimonials, pricing, and FAQs live in `src/config/site.ts`.
3. **Hybrid Deployment Ready**: Builds as 100% static HTML (`output: 'export'`) or containerized standalone server (`output: 'standalone'`).
4. **Autonomous SEO Engine**: Automated JSON-LD structured data (`LocalBusiness`, `FAQPage`), dynamic sitemaps, robots.txt, and OpenGraph cards.

---

## 3. Directory Layout
```text
website-template/
├── .dockerignore                     # Docker build exclusion rules
├── .env.example                      # Environment variables reference
├── Dockerfile                        # Multi-stage production container
├── nginx.conf                        # VPS NGINX reverse-proxy / static server config
├── package.json                      # Minimal, fast dependencies
├── tsconfig.json                     # Strict TypeScript configuration
├── next.config.mjs                   # Hybrid static export / standalone config
├── tailwind.config.ts                # Design tokens & color system
├── AGENTS.md                         # Permanent high-level rules for AI agents
├── README.md                         # Quick-start manual
├── ProjectInfo/                      # AI Context & Knowledge System
│   ├── [1]_PROJECT_DETAILS.md        # This file (Identity & Core Architecture)
│   ├── [2]_PROJECT_ROADMAP.md        # Evolution & delivery checklist
│   ├── [3]_CODE_GUIDE.md            # Coding standards & component contracts
│   ├── [4]_SEO_GUIDE.md             # SEO, JSON-LD & metadata pipeline
│   ├── [5]_DEPENDENCIES_GUIDE.md    # Package matrix & configurations
│   ├── [6]_COMMON_ISSUES.md         # Solved issues registry
│   ├── [7]_TASKS_DONE.md            # Completed tasks registry
│   ├── [8]_DESIGN_GUIDE.md          # Design tokens, typography & images
│   ├── [9]_AI_WORKFLOW.md           # Context rules & doc maintenance workflow
│   ├── Tasks/                       # Historical task records
│   ├── Issues/                      # Historical issue records
│   └── SpecialGuides/               # In-depth operational guides
├── public/                           # Static assets & client image dropzones
└── src/
    ├── app/                          # App Router pages, layouts & legal routes
    ├── config/                       # site.ts & navigation.ts
    ├── components/                   # ui/, layout/, sections/, seo/
    ├── lib/                          # utils.ts & seo.ts
    └── types/                        # TypeScript types & data schemas
```

---

## 4. Quick Execution Commands
| Action | Command | Output |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Local hot-reload dev server at `http://localhost:3000` |
| **Type Check** | `npm run type-check` | Full strict TypeScript validation (`tsc --noEmit`) |
| **Standalone Build** | `npm run build` | Optimized Next.js standalone build for Docker / Coolify |
| **Static Export** | `NEXT_OUTPUT=export npm run build` | 100% pure static HTML/CSS/JS in `./out` |
| **Start Standalone** | `npm run start` | Production Node server execution |
