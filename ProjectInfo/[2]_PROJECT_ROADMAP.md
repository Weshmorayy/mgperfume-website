# [2] Project Roadmap & Priorities

## 1. Current Phase: Phase 1 — Master Template Foundation (Completed)
- [x] Next.js 15 App Router + TypeScript + Tailwind CSS core foundation.
- [x] Master configuration file (`src/config/site.ts`) with typed schemas.
- [x] UI component library (`Button`, `Container`, `Section`, `Badge`, `Card`).
- [x] Complete semantic layout (`Header`, `Footer`, `MobileNav`).
- [x] 9 conversion-oriented page sections (`Hero`, `Services`, `About`, `Portfolio`, `Testimonials`, `Pricing`, `FAQ`, `ContactCTA`, `ContactForm`).
- [x] Automated SEO engine (Metadata generator, Schema.org JSON-LD, sitemap, robots, manifest).
- [x] French legal compliance pages (`Mentions Légales`, `Confidentialité RGPD`).
- [x] Multi-platform deployment assets (`Dockerfile`, `nginx.conf`, `next.config.mjs`).
- [x] AI-assisted documentation & context management system (`ProjectInfo/`).

---

## 2. Phase 2 — Optional Reusable Module Extensions (Planned)
These modules can be integrated into the master template without breaking static export compatibility:
- [ ] **MDX Blog / News Module**: Lightweight static blog for French local SEO article generation.
- [ ] **Interactive Quote Estimator**: Client-side interactive step-by-step calculator.
- [ ] **Direct Form Handlers**: Configurable adapter for Formspree / Webhooks / Resend.
- [ ] **Dark / Light Theme Switcher**: Optional persistent class-based theme toggle.

---

## 3. Client Onboarding Checklist (Standard 30-Minute Workflow)
When duplicating this template for a client:
1. `cp -r website-template client-<name>`
2. Update `src/config/site.ts` with client branding, coordinates, SIRET, services, and testimonials.
3. Drop client images into `public/images/projects/` and `public/images/clients/`.
4. Update `NEXT_PUBLIC_SITE_URL` in `.env.local` or host dashboard.
5. Run `npm run build` or `NEXT_OUTPUT=export npm run build`.
6. Deploy to target environment (Hostinger VPS, Coolify, Netlify, Vercel).
