# Master Client Website Template (Next.js + TypeScript + Tailwind CSS)

A production-grade, high-performance, French-first master website template designed for rapid duplication and deployment of client websites.

---

## 🚀 Quick Start in 3 Steps

### 1. Duplicate & Install
```bash
# Clone or copy this template folder
cp -r website-template client-mon-entreprise
cd client-mon-entreprise

# Install dependencies
npm install
```

### 2. Configure Client Data
Open `src/config/site.ts` and update the client parameters:
- Company name, SIRET, RCS, VAT, legal director
- Phone numbers, email, physical address, business hours
- Hero title, badge, and description
- Services, portfolio projects, customer testimonials, and FAQs
- Color palette tokens in `src/app/globals.css` (if custom brand colors needed)

### 3. Add Client Images
Drop client images into:
- `public/images/projects/` (for portfolio realizations)
- `public/images/clients/` (for client logos/certifications)
- `public/images/og-default.jpg` (1200x630 social share preview)

---

## 🛠️ Development & Build Commands

```bash
# Run local development server (http://localhost:3000)
npm run dev

# Run TypeScript type check
npm run type-check

# Production build (Default / Standalone Docker mode)
npm run build

# Production static export (For Hostinger Static, Netlify, Cloudflare Pages)
NEXT_OUTPUT=export npm run build

# Run production server locally
npm run start
```

---

## 📦 Deployment Guides

Detailed deployment instructions for:
- **Hostinger VPS (NGINX)** ➡️ see [ProjectInfo/[1]_PROJECT_DETAILS.md](ProjectInfo/[1]_PROJECT_DETAILS.md)
- **Coolify (Docker)** ➡️ see [Dockerfile](Dockerfile)
- **Netlify & Vercel** ➡️ see [ProjectInfo/[3]_CODE_GUIDE.md](ProjectInfo/[3]_CODE_GUIDE.md)

---

## 📚 Documentation System
All comprehensive architectural guides are located in the `ProjectInfo/` folder:
- `[1]_PROJECT_DETAILS.md` — Full architectural specification & client deployment steps.
- `[2]_PROJECT_ROADMAP.md` — Future evolutions & client delivery checklist.
- `[3]_CODE_GUIDE.md` — Component architecture, styling rules, & conventions.
- `[4]_SEO_GUIDE.md` — SEO best practices, OpenGraph, JSON-LD, & indexing.
- `[5]_DEPENDENCIES_GUIDE.md` — Dependency audit and maintenance guide.
- `[6]_COMMON_ISSUES.md` — Troubleshooting and common edge cases.
- `[7]_TASKS_DONE.md` — Template build log and validated features.
- `[8]_DESIGN_GUIDE.md` — Visual system, design tokens, typography, & mobile-first rules.
